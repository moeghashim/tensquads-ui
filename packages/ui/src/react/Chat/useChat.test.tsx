import type { ActionEvent } from "@openuidev/react-lang";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { type OpenUIRequest, readOpenUIRequest } from "../../openui/server/request.js";
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
			expect(await result.current.act(event, "approval")).toBe(true);
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
		expect(result.current.locked.has("approval")).toBe(true);
	});

	it.each(["en", "ar"] as const)("preserves action and form values in %s requests", async (locale) => {
		const scenarios = [
			{
				formState: undefined,
				values: { planId: "p1", approved: false },
				json: '{"approved":false,"planId":"p1"}',
			},
			{ formState: {}, values: { planId: "p1", approved: false }, json: '{"approved":false,"planId":"p1"}' },
			{
				formState: { note: "Ready" },
				values: { planId: "p1", approved: false, note: "Ready" },
				json: '{"approved":false,"note":"Ready","planId":"p1"}',
			},
			{
				formState: { approved: true },
				values: { planId: "p1", approved: true },
				json: '{"approved":true,"planId":"p1"}',
			},
		];
		for (const scenario of scenarios) {
			let requestBody: unknown;
			let normalized: OpenUIRequest | undefined;
			const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (_input, init) => {
				requestBody = JSON.parse(String(init?.body));
				normalized = await readOpenUIRequest(new Request("https://example.com/chat", init));
				return new Response("Next step");
			});
			const { result, unmount } = renderHook(() => useChat({ endpoint: "/chat", locale }));
			const event: ActionEvent = {
				type: "Approve",
				params: { planId: "p1", approved: false },
				formState: scenario.formState,
				formName: "ApprovalCard",
				humanFriendlyMessage: "Approve plan",
			};
			try {
				await act(async () => {
					expect(await result.current.act(event, "approval")).toBe(true);
				});
				const actionTurn = {
					role: "action",
					action: { name: "Approve", source: "ApprovalCard", values: scenario.values, summary: "Approve plan" },
				};
				expect(result.current.turns[0]).toEqual(actionTurn);
				expect(requestBody).toEqual({ locale, turns: [actionTurn] });
				expect(normalized).toEqual({
					locale,
					turns: [
						{
							role: "user",
							content:
								locale === "ar"
									? `اختار المستخدم الإجراء «Approve plan» في مكوّن «ApprovalCard». اسم الإجراء: Approve. القيم: ${scenario.json}`
									: `The user chose the action “Approve plan” in the “ApprovalCard” component. Action name: Approve. Values: ${scenario.json}`,
						},
					],
				});
			} finally {
				fetchMock.mockRestore();
				unmount();
			}
		}
	});

	it("lets the host veto an action", async () => {
		const transport = vi.fn(async function* () {
			yield "unused";
		});
		const { result } = renderHook(() => useChat({ endpoint: "/chat", transport, onAction: () => false }));
		await act(async () => {
			expect(
				await result.current.act({ type: "Custom", params: {}, humanFriendlyMessage: "Continue" }, "continue"),
			).toBe(false);
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

	it.each(["iterable", "response"] as const)(
		"publishes %s chunks before completion and retains them on stop",
		async (kind) => {
			let release!: () => void;
			const pending = new Promise<void>((resolve) => {
				release = resolve;
			});
			const transport = () =>
				kind === "iterable"
					? (async function* () {
							yield "Next ";
							await pending;
							yield "ignored";
						})()
					: Promise.resolve(
							new Response(
								new ReadableStream({
									async start(controller) {
										controller.enqueue(new TextEncoder().encode("Next "));
										await pending;
										controller.enqueue(new TextEncoder().encode("ignored"));
										controller.close();
									},
								}),
							),
						);
			const { result } = renderHook(() => useChat({ endpoint: "/chat", transport }));
			let request!: Promise<void>;
			act(() => {
				request = result.current.send("hello");
			});
			await waitFor(() => expect(result.current.turns.at(-1)).toEqual({ role: "assistant", content: "Next " }));
			expect(result.current.busy).toBe(true);
			act(() => result.current.stop());
			await act(async () => {
				release();
				await request;
			});
			expect(result.current.turns.at(-1)).toEqual({ role: "assistant", content: "Next " });
			expect(result.current.busy).toBe(false);
		},
	);

	it.each(["iterable", "response"] as const)(
		"retains partial %s replies on error and replaces them on retry",
		async (kind) => {
			let fail!: () => void;
			const pending = new Promise<void>((resolve) => {
				fail = resolve;
			});
			let attempts = 0;
			const transport = () => {
				if (++attempts > 1) return Promise.resolve(new Response("Recovered"));
				return kind === "iterable"
					? (async function* () {
							yield "Partial";
							await pending;
							throw new Error("offline");
						})()
					: Promise.resolve(
							new Response(
								new ReadableStream({
									async start(controller) {
										controller.enqueue(new TextEncoder().encode("Partial"));
										await pending;
										controller.error(new Error("offline"));
									},
								}),
							),
						);
			};
			const { result } = renderHook(() => useChat({ endpoint: "/chat", transport }));
			let request!: Promise<void>;
			act(() => {
				request = result.current.send("hello");
			});
			await waitFor(() => expect(result.current.turns.at(-1)).toEqual({ role: "assistant", content: "Partial" }));
			await act(async () => {
				fail();
				await request;
			});
			expect(result.current.error?.message).toBe("offline");
			expect(result.current.turns.at(-1)).toEqual({ role: "assistant", content: "Partial" });
			await act(async () => result.current.retry());
			expect(result.current.turns).toEqual([
				{ role: "user", content: "hello" },
				{ role: "assistant", content: "Recovered" },
			]);
		},
	);

	it("keeps used elements locked across later actions and text turns", async () => {
		const transport = vi.fn(async function* () {
			yield "Next";
		});
		const event: ActionEvent = { type: "Continue", params: {}, humanFriendlyMessage: "Continue" };
		const { result } = renderHook(() => useChat({ endpoint: "/chat", transport }));
		await act(async () => {
			expect(await result.current.act(event, "first/button")).toBe(true);
		});
		await act(async () => {
			expect(await result.current.act(event, "second/button")).toBe(true);
		});
		await act(async () => result.current.send("hello"));
		await act(async () => {
			expect(await result.current.act(event, "first/button")).toBe(false);
		});
		expect([...result.current.locked]).toEqual(["first/button", "second/button"]);
		expect(transport).toHaveBeenCalledTimes(3);
		act(() => result.current.reset());
		expect(result.current.locked.size).toBe(0);
	});

	it.each(["stop", "reset"] as const)(
		"invalidates pending approval on %s without disturbing a new request",
		async (cancel) => {
			let approve!: (approved: boolean) => void;
			const onAction = () =>
				new Promise<boolean>((resolve) => {
					approve = resolve;
				});
			let finish!: (response: Response) => void;
			const transport = vi.fn(
				() =>
					new Promise<Response>((resolve) => {
						finish = resolve;
					}),
			);
			const event: ActionEvent = { type: "Approve", params: {}, humanFriendlyMessage: "Approve" };
			const { result } = renderHook(() => useChat({ endpoint: "/chat", transport, onAction }));
			let approval!: Promise<boolean>;
			act(() => {
				approval = result.current.act(event, "old");
			});
			expect(result.current.busy).toBe(true);
			await act(async () => {
				expect(await result.current.act(event, "other")).toBe(false);
				await result.current.send("blocked");
				await result.current.retry();
			});
			expect(transport).not.toHaveBeenCalled();
			act(() => result.current[cancel]());
			let request!: Promise<void>;
			act(() => {
				request = result.current.send("new");
			});
			await act(async () => {
				approve(true);
				expect(await approval).toBe(false);
			});
			expect(result.current.busy).toBe(true);
			expect(result.current.turns).toEqual([{ role: "user", content: "new" }]);
			expect(result.current.locked.size).toBe(0);
			await act(async () => {
				finish(new Response("Reply"));
				await request;
			});
			expect(transport).toHaveBeenCalledTimes(1);
			expect(result.current.turns.at(-1)).toEqual({ role: "assistant", content: "Reply" });
		},
	);
});
