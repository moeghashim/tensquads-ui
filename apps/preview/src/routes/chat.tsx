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
	OwnerMessageView,
	squadmateCharacterName,
	useChat,
} from "@tensquads/ui/react";
import type { ChatActionTurn, ChatTurn, Direction, Locale } from "@tensquads/ui/schemas";
import { Squadmate } from "@tensquads/ui/squadmates";
import { type CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { partPages } from "../chat-parts";
import { siteCopy } from "../copy";
import { getPreviewState } from "../state";

type DemoStep = { agent: "pisa" | "angkor" | "petra"; responseId: string; seconds: number };
type ChatFixture = {
	request: string;
	steps: DemoStep[];
	reply: string;
	followup: string;
	revision: string;
	freeReply: string;
};

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
	const [draft, setDraft] = useState("");
	const composer = useRef<HTMLTextAreaElement>(null);
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
		setDraft("");
		setReplayNumber((number) => number + 1);
	};

	useEffect(() => {
		const runKey = `${locale}-${replayNumber}`;
		if (startedRun.current === runKey) return;
		startedRun.current = runKey;
		void chat.send(fixture.request);
	}, [chat.send, fixture.request, locale, replayNumber]);

	const firstReply = chat.turns[1];
	const plan = firstReply?.role === "assistant" && firstReply.content ? splitScriptedPlan(firstReply.content) : null;

	return (
		<main id="main" className="design-wrap chat-page" dir={direction}>
			<header className="chat-page__intro">
				<p className="eyebrow">{copy.eyebrow}</p>
				<h1>{copy.title}</h1>
				<p className="chat-page__lead">{copy.intro}</p>
			</header>
			<div className="chat-demo-layout">
				<Chat className="chat-demo__surface" lang={locale} dir={direction} aria-label={copy.eyebrow}>
					<header className="chat-demo__header">
						<span aria-hidden="true">
							<Squadmate agent="petra" state="idle" size={36} locale={locale} />
						</span>
						<div className="chat-demo__identity">
							<strong>{squadmateCharacterName("petra", locale)}</strong>
							<small>{copy.leadRole}</small>
						</div>
						<span className="chat-demo__scripted">{copy.scripted}</span>
						<Button variant="soft" size="sm" pill onClick={replay}>
							<svg aria-hidden="true" viewBox="0 0 16 16">
								<path d="M13 8a5 5 0 1 1-1.5-3.6M13 3v3h-3" />
							</svg>
							{copy.newChat}
						</Button>
					</header>
					<ChatLog>
						{chat.turns.map((turn, position) => {
							const requestTurn = turn.role === "assistant" ? chat.turns[position - 1]! : turn;
							let requestId = turnIds.current.get(requestTurn);
							if (requestId === undefined) {
								requestId = nextTurnId.current++;
								turnIds.current.set(requestTurn, requestId);
							}
							const turnId = `${turn.role}-${requestId}`;
							if (turn.role === "action")
								return <ChatUserMessage key={turnId}>{turn.action.summary}</ChatUserMessage>;
							if (turn.role === "user") {
								return <ChatUserMessage key={turnId}>{turn.content}</ChatUserMessage>;
							}
							if (position === 1) {
								return (
									<ChatAssistantMessage key={turnId} className="chat-demo__turn chat-demo__turn--opening">
										<span aria-hidden="true">
											<Squadmate agent="petra" state="idle" size={32} locale={locale} />
										</span>
										<div className="chat-demo__turn-body">
											<RoutedSteps steps={fixture.steps} locale={locale} />
											{plan && <ChatReply reply={plan.prose} locale={locale} />}
											{plan?.stream && (
												<section
													className="chat-demo__plan"
													aria-labelledby="chat-plan-title"
													style={
														{ "--chat-cadence-label": JSON.stringify(copy.frequency) } as CSSProperties
													}
												>
													<header>
														<h2 id="chat-plan-title">{copy.launchPlan}</h2>
														<span lang="en">OpenUI</span>
													</header>
													<ChatReply
														reply={plan.stream}
														locale={locale}
														isStreaming={chat.busy && position === chat.turns.length - 1}
														onAction={(event, blockId) => chat.act(event, `${turnId}/${blockId}`)}
														locked={(blockId) => chat.locked.has(`${turnId}/${blockId}`)}
													/>
												</section>
											)}
										</div>
									</ChatAssistantMessage>
								);
							}
							if (!turn.content) return null;
							return (
								<div className="chat-demo__turn" key={turnId}>
									<span aria-hidden="true">
										<Squadmate agent="petra" state="idle" size={32} locale={locale} />
									</span>
									{turn.content === fixture.freeReply ? (
										<OwnerMessageView
											locale={locale}
											messages={[
												{
													type: "reply",
													seq: position,
													at: "2026-11-24T00:00:00.000Z",
													text: turn.content,
												},
											]}
										/>
									) : (
										<ChatAssistantMessage>
											<ChatReply
												reply={turn.content}
												locale={locale}
												isStreaming={chat.busy && position === chat.turns.length - 1}
											/>
										</ChatAssistantMessage>
									)}
								</div>
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
					<div className="chat-demo__compose">
						<fieldset className="chat-demo__suggestions" aria-label={copy.suggestionsLabel}>
							{copy.suggestions.map((suggestion) => (
								<Button
									key={suggestion}
									variant="outline"
									pill
									size="sm"
									onClick={() => {
										setDraft(suggestion);
										composer.current?.focus();
									}}
								>
									{suggestion}
								</Button>
							))}
						</fieldset>
						<ChatComposer
							locale={locale}
							busy={chat.busy}
							value={draft}
							onValueChange={setDraft}
							onSend={(message) => void chat.send(message)}
							onStop={chat.stop}
							placeholder={copy.placeholder}
							textareaProps={{ "aria-label": copy.composer, ref: composer }}
						/>
						<p className="chat-page__note">{copy.localOnly}</p>
					</div>
				</Chat>
				<ChatGuide locale={locale} search={search} direction={direction} />
			</div>
		</main>
	);
}

const planStart = "\n\n```openui";
function splitScriptedPlan(content: string) {
	const fence = content.indexOf(planStart);
	return fence < 0
		? { prose: content, stream: "" }
		: {
				prose: content.slice(0, fence),
				stream: content.slice(fence).trimStart(),
			};
}

function RoutedSteps({ steps, locale }: { steps: DemoStep[]; locale: Locale }) {
	const copy = siteCopy[locale].chat;
	const roles = { pisa: copy.ordersRole, angkor: copy.websiteRole, petra: copy.leadRole };
	const number = new Intl.NumberFormat(locale);
	return (
		<section className="chat-demo__steps" aria-label={copy.workSteps}>
			<header>
				<span>{copy.worked.replace("{count}", number.format(steps.length))}</span>
				<span className="chat-demo__done">{copy.done}</span>
			</header>
			{steps.map((step) => (
				<ChatStep
					key={step.responseId}
					name={squadmateCharacterName(step.agent, locale)}
					glyph={<Squadmate agent={step.agent} state="done" size={28} locale={locale} />}
					status={roles[step.agent]}
					responseId={step.responseId}
					reply={copy.duration.replace("{seconds}", number.format(step.seconds))}
				/>
			))}
		</section>
	);
}

function ChatGuide({
	locale,
	search,
	direction,
}: {
	locale: Locale;
	search: Record<string, unknown>;
	direction: Direction;
}) {
	const copy = siteCopy[locale].chat;
	const number = new Intl.NumberFormat(locale);
	const parts = Object.entries(partPages) as [keyof typeof partPages, readonly string[]][];
	return (
		<aside className="chat-guide" aria-labelledby="chat-guide-title">
			<h2 id="chat-guide-title">{copy.sideHeading}</h2>
			<ol>
				{parts.map(([id, names], index) => (
					<li key={id} data-part={id}>
						<span className="chat-guide__number" aria-hidden="true">
							{number.format(index + 1)}
						</span>
						<div>
							<div className="chat-guide__links">
								{names.map((name) => (
									<Link to="/components/$name" params={{ name }} search={search} key={name}>
										{id === "fields" ? <bdi>{name}</bdi> : copy.parts[id].title}
									</Link>
								))}
							</div>
							<p>{copy.parts[id].detail}</p>
						</div>
					</li>
				))}
			</ol>
			<Link className="chat-guide__browse" to="/components" search={search}>
				{siteCopy[locale].browse} <span aria-hidden="true">{direction === "rtl" ? "←" : "→"}</span>
			</Link>
		</aside>
	);
}

function scriptedTransport(turns: ChatTurn[], locale: Locale, signal: AbortSignal): AsyncIterable<string> {
	return (async function* () {
		if (signal.aborted) return;
		const fixture = scripts[locale];
		const last = turns.at(-1);
		if (last?.role === "action") {
			const reply =
				last.action.name === "ReviseStorePlan" ? fixture.revision : fillFollowup(fixture.followup, last, locale);
			yield* streamReply(reply, signal);
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
	const openUiStart = reply.indexOf(planStart);
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
