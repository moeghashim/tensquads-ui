import Anthropic from "@anthropic-ai/sdk";
import type { OpenUIRequestTurn } from "../request.js";
import type { OpenUIStreamProvider } from "../types.js";

export const DEFAULT_ANTHROPIC_MODEL = "claude-haiku-5-5";
const MAX_OUTPUT_TOKENS = 1024;

/** Create the Anthropic adapter; callers supply credentials in their Worker environment. */
export function createAnthropicProvider(apiKey: string, model = DEFAULT_ANTHROPIC_MODEL): OpenUIStreamProvider {
	const client = new Anthropic({ apiKey, maxRetries: 1, timeout: 30_000 });
	return {
		stream({ system, turns, signal }) {
			const stream = client.messages.stream(
				{
					model,
					max_tokens: MAX_OUTPUT_TOKENS,
					system,
					messages: toMessages(turns),
					thinking: { type: "disabled" },
					output_config: { effort: "low" },
				},
				{ signal },
			);
			const text = (async function* () {
				for await (const event of stream) {
					if (event.type === "content_block_delta" && event.delta.type === "text_delta" && event.delta.text) {
						yield event.delta.text;
					}
				}
			})();
			return Object.assign(text, { abort: () => stream.abort() });
		},
	};
}

function toMessages(turns: OpenUIRequestTurn[]): Array<{ role: "user" | "assistant"; content: string }> {
	return turns.map(({ role, content }) => ({ role, content }));
}
