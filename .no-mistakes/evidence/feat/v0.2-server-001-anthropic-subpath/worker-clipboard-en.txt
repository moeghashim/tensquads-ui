import { createTensquadsLibrary } from "@tensquads/ui/openui";
import {
  buildSystemPrompt,
  OpenUIServerError,
  readOpenUIRequest,
  streamOpenUIResponse,
} from "@tensquads/ui/openui/server";
import { createAnthropicProvider } from "@tensquads/ui/openui/server/anthropic";

type Env = { ANTHROPIC_API_KEY: string };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const { turns } = await readOpenUIRequest(request);
      if (turns.length === 0 || turns.at(-1)?.role !== "user") {
        return new Response("A user turn is required.", { status: 400 });
      }
      const locale = "en" as const;
      const library = createTensquadsLibrary(locale);
      const system = buildSystemPrompt({ library, locale });
      const provider = createAnthropicProvider(env.ANTHROPIC_API_KEY);
      return await streamOpenUIResponse({ provider, system, turns, signal: request.signal });
    } catch (error) {
      if (error instanceof OpenUIServerError) {
        return Response.json({ error: error.code }, { status: error.status });
      }
      throw error;
    }
  },
};