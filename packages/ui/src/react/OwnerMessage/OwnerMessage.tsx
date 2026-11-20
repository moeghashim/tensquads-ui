import { useEffect, useState } from "react";
import { type AgentSlug, AgentSlugSchema, type Locale } from "../../schemas/index.js";
import type { PlatformOwnerCommandBody, PlatformOwnerMessage } from "../../schemas/platform.js";
import { ownerAnswerCommand, PlatformOwnerMessageSchema } from "../../schemas/platform.js";
import { ApprovalCard, type ApprovalCardProps } from "../ApprovalCard/ApprovalCard.js";
import { Button } from "../Button/Button.js";
import { ChatAssistantMessage, ChatError, ChatWorking } from "../Chat/Chat.js";
import { ChatReply } from "../ChatReply/ChatReply.js";
import { Squadmate } from "../Squadmate/Squadmate.js";

export type OwnerMessageViewProps = {
	messages: readonly unknown[];
	locale?: Locale;
	actionLabels?: Record<string, string>;
	approvalDecisions?: Readonly<Record<string, "approve" | "reject">>;
	labels?: { answerHint?: string; attempt?: string; errorTitle?: string };
	approvalLabels?: ApprovalCardProps["labels"];
	squadmates?: Readonly<Record<string, AgentSlug>>;
	onCommand?: (body: PlatformOwnerCommandBody) => void;
	onUnknown?: (message: unknown) => void;
};

export function pendingQuestion(
	messages: readonly unknown[],
): Extract<PlatformOwnerMessage, { type: "question" }> | undefined {
	const parsed = messages
		.map((message) => PlatformOwnerMessageSchema.safeParse(message))
		.filter((result) => result.success)
		.map((result) => result.data);
	const unanswered = parsed.filter(
		(message): message is Extract<PlatformOwnerMessage, { type: "question" }> =>
			message.type === "question" && message.options.length === 0,
	);
	const answered = new Set(
		parsed.filter((message) => message.type === "question_answered").map((message) => message.questionId),
	);
	return unanswered.filter((question) => !answered.has(question.questionId)).sort((a, b) => b.seq - a.seq)[0];
}

export function approvalDecisions(messages: readonly unknown[]): Record<string, "approve" | "reject"> {
	const newest = new Map<string, Extract<PlatformOwnerMessage, { type: "approval_decided" }>>();
	for (const raw of messages) {
		const parsed = PlatformOwnerMessageSchema.safeParse(raw);
		if (!parsed.success || parsed.data.type !== "approval_decided") continue;
		const previous = newest.get(parsed.data.approvalId);
		if (!previous || parsed.data.seq > previous.seq) newest.set(parsed.data.approvalId, parsed.data);
	}
	return Object.fromEntries([...newest].map(([id, message]) => [id, message.decision]));
}

export function OwnerMessageView({
	messages,
	locale = "en",
	actionLabels,
	approvalDecisions: approvalDecisionsProp,
	labels,
	approvalLabels,
	squadmates,
	onCommand,
	onUnknown,
}: OwnerMessageViewProps) {
	const messageDecisions = approvalDecisions(messages);
	const answeredQuestionIds = new Set(
		messages.flatMap((raw) => {
			const parsed = PlatformOwnerMessageSchema.safeParse(raw);
			return parsed.success && parsed.data.type === "question_answered" ? [parsed.data.questionId] : [];
		}),
	);
	const sorted = messages
		.map((raw, index) => ({ raw, index, parsed: PlatformOwnerMessageSchema.safeParse(raw) }))
		.sort((a, b) => {
			const seqA = a.parsed.success ? a.parsed.data.seq : Number.MAX_SAFE_INTEGER;
			const seqB = b.parsed.success ? b.parsed.data.seq : Number.MAX_SAFE_INTEGER;
			return seqA - seqB || a.index - b.index;
		});
	useEffect(() => {
		for (const { raw, parsed } of sorted) if (!parsed.success) onUnknown?.(raw);
	}, [messages, onUnknown]);
	return (
		<div className="ts-owner-messages" lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
			{sorted.map(({ parsed }) => {
				if (!parsed.success) return null;
				return (
					<OwnerMessageItem
						key={parsed.data.seq}
						message={parsed.data}
						locale={locale}
						actionLabels={actionLabels}
						approvalDecision={
							parsed.data.type === "approval_request"
								? (messageDecisions[parsed.data.approvalId] ?? approvalDecisionsProp?.[parsed.data.approvalId])
								: undefined
						}
						squadmates={squadmates}
						answeredQuestionIds={answeredQuestionIds}
						labels={labels}
						approvalLabels={approvalLabels}
						onCommand={onCommand}
					/>
				);
			})}
		</div>
	);
}

function OwnerMessageItem({
	message,
	locale,
	actionLabels,
	approvalDecision,
	labels,
	approvalLabels,
	squadmates,
	answeredQuestionIds,
	onCommand,
}: {
	message: PlatformOwnerMessage;
	locale: Locale;
	actionLabels?: Record<string, string>;
	approvalDecision?: "approve" | "reject";
	labels?: OwnerMessageViewProps["labels"];
	approvalLabels?: ApprovalCardProps["labels"];
	squadmates?: Readonly<Record<string, AgentSlug>>;
	answeredQuestionIds: ReadonlySet<string>;
	onCommand?: (body: PlatformOwnerCommandBody) => void;
}) {
	const [chosen, setChosen] = useState<string>();
	if (message.type === "reply")
		return (
			<ChatAssistantMessage className="ts-owner-message">
				<ChatReply reply={message.text} locale={locale} plainText />
			</ChatAssistantMessage>
		);
	if (message.type === "approval_decided" || message.type === "question_answered") return null;
	if (message.type === "question")
		return (
			<ChatAssistantMessage className="ts-owner-message">
				<p>{message.text}</p>
				{message.options.length ? (
					<div className="ts-owner-message__options">
						{message.options.map((option) => (
							<Button
								key={option}
								pill
								size="md"
								variant="soft"
								disabled={chosen !== undefined || answeredQuestionIds.has(message.questionId)}
								aria-pressed={chosen === option}
								onClick={() => {
									setChosen(option);
									onCommand?.(ownerAnswerCommand({ questionId: message.questionId, text: option }));
								}}
							>
								{option}
							</Button>
						))}
					</div>
				) : (
					<p className="ts-owner-message__hint">
						{labels?.answerHint ??
							(locale === "ar" ? "أرسل إجابتك في مربع الرسالة." : "Send your answer in the message box.")}
					</p>
				)}
			</ChatAssistantMessage>
		);
	if (message.type === "approval_request")
		return (
			<ApprovalCard
				request={message}
				squadmates={squadmates}
				locale={locale}
				actionLabels={actionLabels}
				decision={approvalDecision}
				labels={approvalLabels}
				onDecision={onCommand}
			/>
		);
	if (message.type === "result")
		return (
			<ChatAssistantMessage className="ts-owner-message">
				<ChatReply reply={message.summary} locale={locale} plainText />
				{message.evidence.length > 0 && (
					<ul>
						{message.evidence.map((item, index) => (
							<li key={`${item}:${index}`}>
								<ChatReply reply={item} locale={locale} plainText />
							</li>
						))}
					</ul>
				)}
			</ChatAssistantMessage>
		);
	if (message.type === "status") {
		const agent = AgentSlugSchema.safeParse(
			squadmates && Object.hasOwn(squadmates, message.bot) ? squadmates[message.bot] : undefined,
		);
		return (
			<ChatWorking
				className="ts-owner-message"
				locale={locale}
				label={`${message.step}${message.attempt > 1 ? ` · ${labels?.attempt ?? (locale === "ar" ? "المحاولة" : "Attempt")} ${message.attempt}` : ""}`}
				glyph={
					agent.success ? <Squadmate agent={agent.data} state="running" size={20} locale={locale} /> : undefined
				}
			/>
		);
	}
	return (
		<ChatError
			className="ts-owner-message"
			locale={locale}
			title={labels?.errorTitle ?? (locale === "ar" ? "تعذّر تأكيد الإجراء" : "Action could not be confirmed")}
		>
			{message.what}
		</ChatError>
	);
}
