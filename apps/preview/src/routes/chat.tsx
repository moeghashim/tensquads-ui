import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import {
	Button,
	Chat,
	ChatAssistantMessage,
	ChatComposer,
	ChatError,
	ChatLog,
	ChatReply,
	ChatStep,
	type ChatTransport,
	ChatUserMessage,
	ChatWorking,
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
	const turnIds = useRef(new WeakMap<ChatTurn, number>());
	const nextTurnId = useRef(0);
	const transport = useCallback<ChatTransport>(
		(request, { signal }) => scriptedTransport(request.turns, request.locale, signal),
		[],
	);
	const chat = useChat({ endpoint: "/scripted-chat", locale, transport });
	const lastTurn = chat.turns.at(-1);
	const waiting = chat.busy && !(lastTurn?.role === "assistant" && lastTurn.content);
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
		<main id="main" className="content-page chat-page" dir={direction}>
			<header className="chat-page__intro">
				<p className="eyebrow">{copy.eyebrow}</p>
				<h1>{copy.title}</h1>
				<p>{copy.intro}</p>
			</header>
			<section className="chat-demo" aria-label={copy.eyebrow}>
				<Chat className="chat-demo__surface" lang={locale} dir={direction}>
					<ChatLog>
						{chat.turns.map((turn, position) => {
							const requestTurn = turn.role === "assistant" ? chat.turns[position - 1]! : turn;
							let requestId = turnIds.current.get(requestTurn);
							if (requestId === undefined) {
								requestId = nextTurnId.current++;
								turnIds.current.set(requestTurn, requestId);
							}
							const turnId = `${turn.role}-${requestId}`;
							if (turn.role === "user") {
								return (
									<Fragment key={turnId}>
										<ChatUserMessage>{turn.content}</ChatUserMessage>
										{turn === chat.turns[0] && <RoutedSteps steps={fixture.steps} locale={locale} />}
									</Fragment>
								);
							}
							if (turn.role === "action") {
								return <ChatUserMessage key={turnId}>{turn.action.summary}</ChatUserMessage>;
							}
							if (!turn.content) return null;
							return (
								<ChatAssistantMessage key={turnId}>
									<ChatReply
										reply={turn.content}
										locale={locale}
										isStreaming={chat.busy}
										onAction={(event, blockId) => chat.act(event, `${turnId}/${blockId}`)}
										locked={(blockId) => chat.locked.has(`${turnId}/${blockId}`)}
									/>
								</ChatAssistantMessage>
							);
						})}
						{waiting && (
							<ChatWorking
								locale={locale}
								glyph={<Squadmate agent="petra" state="planning" size={24} locale={locale} />}
							/>
						)}
						{chat.error && (
							<ChatError locale={locale} onRetry={() => void chat.retry()}>
								{chat.error.message}
							</ChatError>
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
			<div className="chat-page__footer">
				<p className="chat-page__note">{copy.localOnly}</p>
				<Button variant="ghost" size="sm" onClick={replay}>
					{copy.newChat}
				</Button>
				<Button variant="ghost" size="sm" render={<Link to="/components" search={search as never} />}>
					{siteCopy[locale].browse}
				</Button>
			</div>
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
	// A short wait first, so the visitor sees the working state a live agent shows.
	await playbackPause(signal, 700);
	if (signal.aborted) return;
	const openUiStart = reply.indexOf("\n\n```openui");
	if (openUiStart < 0) {
		yield reply;
		return;
	}
	yield reply.slice(0, openUiStart);
	await playbackPause(signal);
	if (!signal.aborted) yield reply.slice(openUiStart);
}

function playbackPause(signal: AbortSignal, delay = 320) {
	return new Promise<void>((resolve) => {
		const timer = window.setTimeout(() => {
			signal.removeEventListener("abort", stop);
			resolve();
		}, delay);
		const stop = () => {
			window.clearTimeout(timer);
			resolve();
		};
		signal.addEventListener("abort", stop, { once: true });
	});
}

function fillFollowup(template: string, turn: ChatActionTurn, locale: Locale) {
	// An empty answer falls back to a plain phrase; an empty value would leave bare ** markers in the reply.
	const store = textValue(findValue(turn.action.values, "storeName")) ?? (locale === "ar" ? "متجرك" : "your store");
	const frequency = textValue(findValue(turn.action.values, "frequency")) ?? (locale === "ar" ? "أسبوعي" : "Weekly");
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
	const values: Record<string, unknown> = { store, frequency, email: emailLabel };
	return template.replace(/\{(store|frequency|email)\}/g, (_, name: string) =>
		String(values[name]).replace(/[\\`*_[\]{}()#+.!<>~|-]/g, "\\$&"),
	);
}

function textValue(value: unknown): string | undefined {
	if (value == null) return undefined;
	const text = String(value).trim();
	return text || undefined;
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
