import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import {
	Button,
	Chat,
	ChatComposer,
	ChatHeader,
	ChatLog,
	ChatReply,
	ChatStep,
	type ChatTransport,
	ChatUserMessage,
	squadmateCharacterName,
	useChat,
} from "@tensquads/ui/react";
import type { AgentSlug, ChatActionTurn, ChatTurn, Direction, Locale } from "@tensquads/ui/schemas";
import { Squadmate } from "@tensquads/ui/squadmates";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { siteCopy } from "../copy";
import { getPreviewState } from "../state";

type DemoStep = { agent: string; status: string; responseId: string };
type ChatFixture = { request: string; steps: DemoStep[]; reply: string; followup: string; freeReply: string };

const fixtures = import.meta.glob<string>("../fixtures/chat-demo.fixture.*.txt", {
	eager: true,
	query: "?raw",
	import: "default",
});
const scripts = {
	en: JSON.parse(fixtures["../fixtures/chat-demo.fixture.en.txt"] ?? "{}") as ChatFixture,
	ar: JSON.parse(fixtures["../fixtures/chat-demo.fixture.ar.txt"] ?? "{}") as ChatFixture,
};
const setupReplyId = "store-setup";

export const Route = createFileRoute("/chat")({ component: ChatPage });

function ChatPage() {
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const { locale, direction } = getPreviewState(search);
	return <ChatExperience key={locale} locale={locale} direction={direction} search={search} />;
}

function ChatExperience({
	locale,
	direction,
	search,
}: {
	locale: Locale;
	direction: Direction;
	search: Record<string, unknown>;
}) {
	const copy = siteCopy[locale].chat;
	const fixture = scripts[locale];
	const [replayNumber, setReplayNumber] = useState(0);
	const startedRun = useRef<string | null>(null);
	const transport = useCallback<ChatTransport>(
		(request, { signal }) => scriptedTransport(request.turns, request.locale, signal),
		[],
	);
	const chat = useChat({ endpoint: "/scripted-chat", locale, transport });
	const replay = () => {
		chat.reset();
		setReplayNumber((number) => number + 1);
	};

	useEffect(() => {
		const runKey = `${locale}-${replayNumber}`;
		if (startedRun.current === runKey) return;
		startedRun.current = runKey;
		void chat.send(fixture.request);
	}, [chat.send, fixture.request, locale, replayNumber]);

	return (
		<main className="content-page chat-page" dir={direction}>
			<header className="chat-page__intro">
				<p className="eyebrow">{copy.eyebrow}</p>
				<h1>{copy.title}</h1>
				<p>{copy.intro}</p>
			</header>
			<section className="chat-demo" aria-label={copy.eyebrow}>
				<Chat className="chat-demo__surface" lang={locale} dir={direction}>
					<ChatHeader onNewChat={replay} newChatLabel={copy.newChat} locale={locale}>
						<strong>{squadmateCharacterName("petra", locale)}</strong>
					</ChatHeader>
					<ChatLog>
						{chat.turns.map((turn) => {
							if (turn.role === "user") {
								return (
									<Fragment key={`user-${turn.content}`}>
										<ChatUserMessage>{turn.content}</ChatUserMessage>
										{turn.content === fixture.request && (
											<RoutedSteps steps={fixture.steps} locale={locale} />
										)}
									</Fragment>
								);
							}
							if (turn.role === "action") {
								return (
									<ChatUserMessage key={`action-${turn.action.name}-${turn.action.summary}`}>
										{turn.action.summary}
									</ChatUserMessage>
								);
							}
							const replyId = turn.content === fixture.reply ? setupReplyId : `reply-${turn.content}`;
							return (
								<ChatStep
									key={`assistant-${turn.content}`}
									name={squadmateCharacterName("petra", locale)}
									glyph={<Squadmate agent="petra" state="planning" size={24} locale={locale} />}
									reply={
										<ChatReply
											reply={turn.content}
											locale={locale}
											isStreaming={chat.busy}
											onAction={(event, blockId) => void chat.act(event, `${replyId}/${blockId}`)}
											locked={(blockId) => chat.locked.has(`${setupReplyId}/${blockId}`)}
										/>
									}
								/>
							);
						})}
						{chat.error && (
							<ChatStep
								name={squadmateCharacterName("petra", locale)}
								status={chat.error.message}
								statusVariant="danger"
								onRetry={() => void chat.retry()}
								retryLabel={locale === "ar" ? "إعادة المحاولة" : "Retry"}
							/>
						)}
					</ChatLog>
					<ChatComposer
						locale={locale}
						busy={chat.busy}
						onSend={(message) => void chat.send(message)}
						onStop={chat.stop}
						textareaProps={{ "aria-label": copy.composer }}
					/>
				</Chat>
			</section>
			<p className="chat-page__note">{copy.localOnly}</p>
			<Button variant="ghost" render={<Link to="/components" search={search as never} />}>
				{siteCopy[locale].browse}
			</Button>
		</main>
	);
}

function RoutedSteps({ steps, locale }: { steps: DemoStep[]; locale: Locale }) {
	return (
		<section className="chat-demo__steps" aria-label={locale === "ar" ? "خطوات العمل" : "Work steps"}>
			{steps.map((step) => (
				<ChatStep
					key={step.responseId}
					name={squadmateCharacterName(step.agent as AgentSlug, locale)}
					glyph={<Squadmate agent={step.agent as AgentSlug} state="done" size={24} locale={locale} />}
					status={step.status}
					responseId={step.responseId}
				/>
			))}
		</section>
	);
}

function scriptedTransport(turns: ChatTurn[], locale: Locale, signal: AbortSignal): AsyncIterable<string> {
	return (async function* () {
		if (signal.aborted) return;
		const fixture = scripts[locale];
		const last = turns.at(-1);
		if (last?.role === "action") {
			yield* streamReply(fillFollowup(fixture.followup, last, locale), signal);
		} else if (turns.filter((turn) => turn.role === "user").length === 1) {
			yield* streamReply(fixture.reply, signal);
		} else {
			yield fixture.freeReply;
		}
	})();
}

async function* streamReply(reply: string, signal: AbortSignal) {
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		yield reply;
		return;
	}
	const openUiStart = reply.indexOf("\n\n```openui");
	if (openUiStart < 0) {
		yield reply;
		return;
	}
	yield reply.slice(0, openUiStart);
	await playbackPause(signal);
	if (!signal.aborted) yield reply.slice(openUiStart);
}

function playbackPause(signal: AbortSignal) {
	return new Promise<void>((resolve) => {
		const timer = window.setTimeout(() => {
			signal.removeEventListener("abort", stop);
			resolve();
		}, 320);
		const stop = () => {
			window.clearTimeout(timer);
			resolve();
		};
		signal.addEventListener("abort", stop, { once: true });
	});
}

function fillFollowup(template: string, turn: ChatActionTurn, locale: Locale) {
	const store = findValue(turn.action.values, "storeName") ?? "Store";
	const frequency = findValue(turn.action.values, "frequency") ?? "Weekly";
	const email = findValue(turn.action.values, "emailUpdates");
	const emailLabel =
		email === true
			? locale === "ar"
				? "مفعّلة"
				: "on"
			: email === false
				? locale === "ar"
					? "غير مفعّلة"
					: "off"
				: "unchanged";
	return template
		.replace("{store}", String(store))
		.replace("{frequency}", String(frequency))
		.replace("{email}", emailLabel);
}

function findValue(value: unknown, name: string): unknown {
	if (!value || typeof value !== "object") return undefined;
	if (name in value) {
		const item = (value as Record<string, unknown>)[name];
		if (item && typeof item === "object" && "value" in item) return (item as { value: unknown }).value;
		return item;
	}
	for (const nested of Object.values(value)) {
		const found = findValue(nested, name);
		if (found !== undefined) return found;
	}
	return undefined;
}
