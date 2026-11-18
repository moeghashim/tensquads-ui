import { describe, expect, it, vi } from "vitest";
import { createAnthropicProvider } from "./anthropic.js";

const fake = vi.hoisted(() => ({ construct: vi.fn(), stream: vi.fn() }));

vi.mock("@anthropic-ai/sdk", () => ({
	default: class {
		constructor(options: unknown) {
			fake.construct(options);
		}
		messages = { stream: fake.stream };
	},
}));

describe("Anthropic provider", () => {
	it.each([undefined, "custom-model"])("maps the SDK stream with model %s without network access", async (model) => {
		fake.construct.mockClear();
		fake.stream.mockClear();
		const abort = vi.fn();
		const events = Object.assign(
			(async function* () {
				yield { type: "message_start" };
				yield { type: "content_block_delta", delta: { type: "thinking_delta", thinking: "hidden" } };
				yield { type: "content_block_delta", delta: { type: "text_delta", text: "root = " } };
				yield { type: "content_block_delta", delta: { type: "text_delta", text: "" } };
				yield { type: "content_block_delta", delta: { type: "text_delta", text: 'Example("مرحبا")' } };
				yield { type: "message_stop" };
			})(),
			{ abort },
		);
		fake.stream.mockReturnValue(events);
		const provider = createAnthropicProvider("test-key", model);
		const signal = new AbortController().signal;
		const stream = provider.stream({
			system: "System instructions",
			turns: [
				{ role: "user", content: "Hello" },
				{ role: "assistant", content: "Welcome" },
			],
			signal,
		});
		const chunks: string[] = [];
		for await (const chunk of stream) chunks.push(chunk);
		expect(chunks).toEqual(["root = ", 'Example("مرحبا")']);
		expect(fake.construct).toHaveBeenCalledExactlyOnceWith({ apiKey: "test-key", maxRetries: 1, timeout: 30_000 });
		expect(fake.stream).toHaveBeenCalledExactlyOnceWith(
			{
				model: model ?? "claude-haiku-5-5",
				max_tokens: 1024,
				system: "System instructions",
				messages: [
					{ role: "user", content: "Hello" },
					{ role: "assistant", content: "Welcome" },
				],
				thinking: { type: "disabled" },
				output_config: { effort: "low" },
			},
			{ signal },
		);
		stream.abort?.();
		expect(abort).toHaveBeenCalledOnce();
	});
});
