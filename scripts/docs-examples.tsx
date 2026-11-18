import { createTensquadsLibrary, TensquadsRenderer } from "../packages/ui/src/openui/index.js";
import {
	buildSystemPrompt,
	createAnthropicProvider,
	OpenUIServerError,
	readOpenUIRequest,
	streamOpenUIResponse,
} from "../packages/ui/src/openui/server/index.js";
import { Button, Field, FieldLabel, Input } from "../packages/ui/src/react/index.js";
import { Squadmate } from "../packages/ui/src/squadmates/index.js";

export function ProfileForm() {
	return (
		<form>
			<Field name="displayName">
				<FieldLabel>Display name</FieldLabel>
				<Input placeholder="Your name" />
			</Field>
			<Button type="submit">Save profile</Button>
		</form>
	);
}

export function AgentStatus() {
	return <Squadmate agent="petra" state="planning" locale="ar" size={64} />;
}

export function GeneratedPanel({ stream }: { stream: string | null }) {
	return <TensquadsRenderer stream={stream} locale="en" onError={(errors) => console.error(errors)} />;
}

export async function handleOpenUI(request: Request, apiKey: string): Promise<Response> {
	try {
		const { turns } = await readOpenUIRequest(request);
		if (turns.length === 0 || turns.at(-1)?.role !== "user") {
			return new Response("A user turn is required.", { status: 400 });
		}
		const locale = "ar" as const;
		const library = createTensquadsLibrary(locale);
		const system = buildSystemPrompt({ library, locale });
		const provider = createAnthropicProvider(apiKey);
		return await streamOpenUIResponse({ provider, system, turns, signal: request.signal });
	} catch (error) {
		if (error instanceof OpenUIServerError) {
			return Response.json({ error: error.code }, { status: error.status });
		}
		throw error;
	}
}
