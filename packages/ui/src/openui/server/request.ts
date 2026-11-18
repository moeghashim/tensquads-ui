export const MAX_BODY_BYTES = 16 * 1024;
export const MAX_TURNS = 12;

export interface OpenUIRequestTurn {
	role: "user" | "assistant";
	content: string;
}

export interface OpenUIRequest {
	turns: OpenUIRequestTurn[];
}

export class OpenUIServerError extends Error {
	readonly name = "OpenUIServerError";
	constructor(
		readonly code: "body_too_large" | "invalid_json" | "invalid_request" | "too_many_turns",
		readonly status: 400 | 413,
		message: string,
	) {
		super(message);
	}
}

/** Read, size-check, decode, and validate the request body from a Worker Request. */
export async function readOpenUIRequest(request: Request): Promise<OpenUIRequest> {
	const declaredLength = Number(request.headers.get("content-length") ?? "0");
	if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
		throw new OpenUIServerError("body_too_large", 413, "Request body is too large.");
	}
	const reader = request.body?.getReader();
	const chunks: Uint8Array[] = [];
	let byteLength = 0;
	if (reader) {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			byteLength += value.byteLength;
			if (byteLength > MAX_BODY_BYTES) {
				await reader.cancel();
				throw new OpenUIServerError("body_too_large", 413, "Request body is too large.");
			}
			chunks.push(value);
		}
	}
	const bytes = new Uint8Array(byteLength);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.byteLength;
	}
	let body: unknown;
	try {
		body = JSON.parse(new TextDecoder().decode(bytes));
	} catch {
		throw new OpenUIServerError("invalid_json", 400, "Request body must be valid JSON.");
	}
	if (!body || typeof body !== "object" || !Array.isArray((body as { turns?: unknown }).turns)) {
		throw new OpenUIServerError("invalid_request", 400, "Request must contain a turns array.");
	}
	const turns = (body as { turns: unknown[] }).turns;
	if (turns.length > MAX_TURNS) {
		throw new OpenUIServerError("too_many_turns", 400, `A request can contain at most ${MAX_TURNS} turns.`);
	}
	if (
		!turns.every(
			(turn) =>
				!!turn &&
				typeof turn === "object" &&
				((turn as OpenUIRequestTurn).role === "user" || (turn as OpenUIRequestTurn).role === "assistant") &&
				typeof (turn as OpenUIRequestTurn).content === "string",
		)
	) {
		throw new OpenUIServerError(
			"invalid_request",
			400,
			"Each turn needs a user or assistant role and string content.",
		);
	}
	return { turns: turns as OpenUIRequestTurn[] };
}
