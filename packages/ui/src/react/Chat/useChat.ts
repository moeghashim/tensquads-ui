import type { ActionEvent } from "@openuidev/react-lang";
import { useCallback, useRef, useState } from "react";
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
	locked: boolean;
	send: (text: string) => Promise<void>;
	act: (event: ActionEvent) => Promise<boolean>;
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
	const [locked, setLocked] = useState(false);
	const abortRef = useRef<AbortController | null>(null);
	const retryRef = useRef<ChatTurn[] | null>(null);
	const run = useCallback(
		async (nextTurns: ChatTurn[]) => {
			retryRef.current = nextTurns;
			const controller = new AbortController();
			abortRef.current?.abort();
			abortRef.current = controller;
			setBusy(true);
			setError(null);
			try {
				const output = await transport({ endpoint, turns: nextTurns, locale }, { signal: controller.signal });
				let reply = "";
				if (Symbol.asyncIterator in Object(output)) {
					for await (const chunk of output as AsyncIterable<string>) {
						if (controller.signal.aborted) break;
						reply += chunk;
					}
				} else {
					const response = output as Response;
					if (!response.ok) {
						const body = (await response.json().catch(() => ({}))) as { error?: string };
						throw new Error(body.error ?? `Request failed (${response.status})`);
					}
					if (!response.body) reply = await response.text();
					else {
						const reader = response.body.getReader();
						const decoder = new TextDecoder();
						while (true) {
							const { done, value } = await reader.read();
							if (done || controller.signal.aborted) break;
							reply += decoder.decode(value, { stream: true });
						}
						reply += decoder.decode();
					}
				}
				if (!controller.signal.aborted && reply) setTurns([...nextTurns, { role: "assistant", content: reply }]);
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
			if (!content || busy) return;
			const next = [...turns, { role: "user" as const, content }];
			setTurns(next);
			setLocked(false);
			await run(next);
		},
		[busy, run, turns],
	);
	const act = useCallback(
		async (event: ActionEvent) => {
			if (busy || locked) return false;
			if ((await onAction?.(event)) === false) return false;
			const summary = event.humanFriendlyMessage || event.type;
			const actionTurn: ChatActionTurn = {
				role: "action",
				action: {
					name: event.type,
					source:
						(event as ActionEvent & { sourceComponent?: string }).sourceComponent ?? event.formName ?? "OpenUI",
					values: event.formState ?? event.params,
					summary,
				},
			};
			const next = [...turns, actionTurn];
			setTurns(next);
			setLocked(true);
			await run(next);
			return true;
		},
		[busy, locked, onAction, run, turns],
	);
	const stop = useCallback(() => abortRef.current?.abort(), []);
	const retry = useCallback(async () => {
		if (!busy && retryRef.current) await run(retryRef.current);
	}, [busy, run]);
	const reset = useCallback(() => {
		abortRef.current?.abort();
		abortRef.current = null;
		setTurns([]);
		setBusy(false);
		setError(null);
		setLocked(false);
		retryRef.current = null;
	}, []);
	return { turns, busy, error, locked, send, act, stop, reset, retry };
}
