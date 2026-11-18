import type { OpenUIRequestTurn } from "./request.js";

export interface OpenUIStreamProvider {
	stream(input: {
		system: string;
		turns: OpenUIRequestTurn[];
		signal?: AbortSignal;
	}): AsyncIterable<string> & { abort?: () => void };
}

export interface OpenUIStreamInput {
	provider: OpenUIStreamProvider;
	system: string;
	turns: OpenUIRequestTurn[];
	signal?: AbortSignal;
}
