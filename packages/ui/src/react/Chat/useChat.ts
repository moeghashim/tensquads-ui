import type { ActionEvent } from "@openuidev/react-lang";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChatActionTurn, ChatTurn, Locale } from "../../schemas/index.js";

export type ChatTransport = (
	request: { endpoint: string; turns: ChatTurn[]; locale: Locale },
	options: { signal: AbortSignal },
) => Promise<Response> | AsyncIterable<string>;

export type UseChatOptions = {
	endpoint: string;
	locale?: Locale;
	transport?: ChatTransport;
	onAction?: (event: ActionEvent) => boolean | undefined | Promise<boolean | undefined>;
};

export type UseChatResult = {
	turns: ChatTurn[];
	busy: boolean;
	error: Error | null;
	locked: ReadonlySet<string>;
	send: (text: string) => Promise<void>;
	act: (event: ActionEvent, elementId: string) => Promise<boolean>;
	stop: () => void;
	reset: () => void;
	retry: () => Promise<void>;
};

const fetchTransport: ChatTransport = ({ endpoint, turns, locale }, { signal }) =>
	fetch(endpoint, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ turns, locale }),
		signal,
	});

export function useChat({
	endpoint,
	locale = "en",
	transport = fetchTransport,
	onAction,
}: UseChatOptions): UseChatResult {
	const [turns, setTurns] = useState<ChatTurn[]>([]);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const [locked, setLocked] = useState<ReadonlySet<string>>(new Set());
	const abortRef = useRef<AbortController | null>(null);
	const retryRef = useRef<ChatTurn[] | null>(null);
	// Abandoned conversations stop their request and ignore late approvals.
	useEffect(
		() => () => {
			abortRef.current?.abort();
			abortRef.current = null;
		},
		[],
	);
	const run = useCallback(
		async (nextTurns: ChatTurn[], controller = new AbortController()) => {
			retryRef.current = nextTurns;
			abortRef.current = controller;
			setTurns(nextTurns);
			setBusy(true);
			setError(null);
			try {
				const output = await transport({ endpoint, turns: nextTurns, locale }, { signal: controller.signal });
				let reply = "";
				const publish = (chunk: string) => {
					if (controller.signal.aborted || abortRef.current !== controller) return;
					reply += chunk;
					if (reply) setTurns([...nextTurns, { role: "assistant", content: reply }]);
				};
				if (Symbol.asyncIterator in Object(output)) {
					for await (const chunk of output as AsyncIterable<string>) {
						if (controller.signal.aborted) break;
						publish(chunk);
					}
				} else {
					const response = output as Response;
					if (!response.ok) {
						const body = (await response.json().catch(() => ({}))) as { error?: string };
						throw new Error(body.error ?? `Request failed (${response.status})`);
					}
					if (!response.body) publish(await response.text());
					else {
						const reader = response.body.getReader();
						const decoder = new TextDecoder();
						while (true) {
							const { done, value } = await reader.read();
							if (done || controller.signal.aborted) break;
							publish(decoder.decode(value, { stream: true }));
						}
						publish(decoder.decode());
					}
				}
			} catch (caught) {
				if (!controller.signal.aborted) setError(caught instanceof Error ? caught : new Error(String(caught)));
			} finally {
				if (abortRef.current === controller) {
					abortRef.current = null;
					setBusy(false);
				}
			}
		},
		[endpoint, locale, transport],
	);
	const send = useCallback(
		async (text: string) => {
			const content = text.trim();
			if (!content || abortRef.current) return;
			const next = [...turns, { role: "user" as const, content }];
			await run(next);
		},
		[run, turns],
	);
	const act = useCallback(
		async (event: ActionEvent, elementId: string) => {
			if (abortRef.current || locked.has(elementId)) return false;
			const controller = new AbortController();
			abortRef.current = controller;
			setBusy(true);
			try {
				if ((await onAction?.(event)) === false) return false;
				if (controller.signal.aborted || abortRef.current !== controller) return false;
				const summary = event.humanFriendlyMessage || event.type;
				const actionTurn: ChatActionTurn = {
					role: "action",
					action: {
						name: event.type,
						source:
							(event as ActionEvent & { sourceComponent?: string }).sourceComponent ??
							event.formName ??
							"OpenUI",
						values: { ...event.params, ...event.formState },
						summary,
					},
				};
				const next = [...turns, actionTurn];
				setLocked((previous) => new Set([...previous, elementId]));
				await run(next, controller);
				return true;
			} finally {
				if (abortRef.current === controller) {
					abortRef.current = null;
					setBusy(false);
				}
			}
		},
		[locked, onAction, run, turns],
	);
	const stop = useCallback(() => {
		abortRef.current?.abort();
		abortRef.current = null;
		setBusy(false);
	}, []);
	const retry = useCallback(async () => {
		if (!abortRef.current && retryRef.current) await run(retryRef.current);
	}, [run]);
	const reset = useCallback(() => {
		abortRef.current?.abort();
		abortRef.current = null;
		setTurns([]);
		setBusy(false);
		setError(null);
		setLocked(new Set());
		retryRef.current = null;
	}, []);
	return { turns, busy, error, locked, send, act, stop, reset, retry };
}
