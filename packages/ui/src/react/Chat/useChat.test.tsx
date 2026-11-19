import type { ActionEvent } from "@openuidev/react-lang";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useChat } from "./useChat.js";

describe("useChat", () => {
	it("turns an accepted action into a structured user turn and streams the next reply", async () => {
		let requestBody: unknown;
		const transport = vi.fn(async function* (request: { turns: unknown[] }) {
			requestBody = request.turns;
			yield "Next ";
			yield "step";
		});
		const event: ActionEvent = {
			type: "Approve",
			params: { approved: true },
			humanFriendlyMessage: "Approve plan",
			formName: "ApprovalCard",
			formState: { approved: true },
		};
		const onAction = vi.fn();
		const { result } = renderHook(() => useChat({ endpoint: "/chat", transport, onAction }));
		await act(async () => {
			expect(await result.current.act(event)).toBe(true);
		});
		expect(onAction).toHaveBeenCalledWith(event);
		expect(requestBody).toEqual([
			{
				role: "action",
				action: { name: "Approve", source: "ApprovalCard", values: { approved: true }, summary: "Approve plan" },
			},
		]);
		expect(result.current.turns).toEqual([
			{
				role: "action",
				action: { name: "Approve", source: "ApprovalCard", values: { approved: true }, summary: "Approve plan" },
			},
			{ role: "assistant", content: "Next step" },
		]);
		expect(result.current.locked).toBe(true);
	});

	it("lets the host veto an action", async () => {
		const transport = vi.fn(async function* () {
			yield "unused";
		});
		const { result } = renderHook(() => useChat({ endpoint: "/chat", transport, onAction: () => false }));
		await act(async () => {
			expect(await result.current.act({ type: "Custom", params: {}, humanFriendlyMessage: "Continue" })).toBe(false);
		});
		expect(result.current.turns).toEqual([]);
		expect(transport).not.toHaveBeenCalled();
	});

	it("aborts a running request with stop", async () => {
		let signal: AbortSignal | undefined;
		let finish!: () => void;
		const transport = vi.fn((_request: unknown, options: { signal: AbortSignal }) => {
			signal = options.signal;
			return new Promise<Response>((resolve) => {
				finish = () => resolve(new Response("ignored"));
			});
		});
		const { result } = renderHook(() => useChat({ endpoint: "/chat", transport }));
		act(() => {
			void result.current.send("hello");
		});
		await waitFor(() => expect(result.current.busy).toBe(true));
		act(() => result.current.stop());
		expect(signal?.aborted).toBe(true);
		finish();
		await waitFor(() => expect(result.current.busy).toBe(false));
		expect(result.current.turns).toEqual([{ role: "user", content: "hello" }]);
	});

	it("exposes server errors and retries the same turn list", async () => {
		let attempts = 0;
		const transport = vi.fn(() => {
			attempts += 1;
			return attempts === 1
				? Promise.resolve(Response.json({ error: "too_many_turns" }, { status: 400 }))
				: (async function* () {
						yield "Recovered";
					})();
		});
		const { result } = renderHook(() => useChat({ endpoint: "/chat", transport }));
		await act(async () => result.current.send("hello"));
		expect(result.current.error?.message).toBe("too_many_turns");
		await act(async () => result.current.retry());
		expect(result.current.error).toBeNull();
		expect(result.current.turns.at(-1)).toEqual({ role: "assistant", content: "Recovered" });
		expect(transport).toHaveBeenCalledTimes(2);
	});
});
