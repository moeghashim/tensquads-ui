import type { ChatActionTurn, Locale } from "../../schemas/index.js";

export const MAX_BODY_BYTES = 16 * 1024;
export const MAX_TURNS = 12;

export interface OpenUIRequestTurn {
	role: "user" | "assistant";
	content: string;
}

export interface OpenUIRequest {
	turns: OpenUIRequestTurn[];
	locale: Locale;
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
	const requestBody = body as { turns: unknown[]; locale?: unknown };
	if (requestBody.locale !== undefined && requestBody.locale !== "en" && requestBody.locale !== "ar") {
		throw new OpenUIServerError("invalid_request", 400, "Locale must be en or ar.");
	}
	const locale: Locale = requestBody.locale === "ar" ? "ar" : "en";
	const turns = requestBody.turns;
	if (turns.length > MAX_TURNS) {
		throw new OpenUIServerError("too_many_turns", 400, `A request can contain at most ${MAX_TURNS} turns.`);
	}
	if (!turns.every(isRequestTurn)) {
		throw new OpenUIServerError(
			"invalid_request",
			400,
			"Each turn needs a user or assistant role and string content, or a valid action turn.",
		);
	}
	return {
		locale,
		turns: turns.map((turn) =>
			(turn as ChatActionTurn).role === "action"
				? { role: "user", content: renderActionTurn(turn as ChatActionTurn, locale) }
				: (turn as OpenUIRequestTurn),
		),
	};
}

function isRequestTurn(turn: unknown): boolean {
	if (!turn || typeof turn !== "object") return false;
	const candidate = turn as Record<string, unknown>;
	if ((candidate.role === "user" || candidate.role === "assistant") && typeof candidate.content === "string")
		return true;
	if (candidate.role !== "action" || !candidate.action || typeof candidate.action !== "object") return false;
	const action = candidate.action as Record<string, unknown>;
	return (
		typeof action.name === "string" &&
		typeof action.source === "string" &&
		typeof action.summary === "string" &&
		!!action.values &&
		typeof action.values === "object" &&
		!Array.isArray(action.values)
	);
}

function stableJson(value: unknown): string {
	if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
	if (value && typeof value === "object") {
		return `{${Object.entries(value)
			.sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
			.map(([key, entry]) => `${JSON.stringify(key)}:${stableJson(entry)}`)
			.join(",")}}`;
	}
	return JSON.stringify(value) ?? "null";
}

function renderActionTurn(turn: ChatActionTurn, locale: Locale): string {
	const { action } = turn;
	const values = stableJson(action.values);
	return locale === "ar"
		? `اختار المستخدم الإجراء «${action.summary}» في مكوّن «${action.source}». اسم الإجراء: ${action.name}. القيم: ${values}`
		: `The user chose the action “${action.summary}” in the “${action.source}” component. Action name: ${action.name}. Values: ${values}`;
}
