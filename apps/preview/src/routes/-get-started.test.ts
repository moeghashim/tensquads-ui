import { describe, expect, it } from "vitest";
import { createTensquadsLibrary } from "../../../../packages/ui/src/openui/index";
import {
	buildSystemPrompt,
	createAnthropicProvider,
	OpenUIServerError,
	readOpenUIRequest,
	streamOpenUIResponse,
} from "../../../../packages/ui/src/openui/server/index";
import { Button, Field, FieldLabel, Input } from "../../../../packages/ui/src/react/index";

describe("getting started example exports", () => {
	it("exports each React and Worker API shown in the examples", () => {
		expect([Button, Field, FieldLabel, Input].every((value) => typeof value === "function")).toBe(true);
		expect(
			[
				createTensquadsLibrary,
				buildSystemPrompt,
				createAnthropicProvider,
				OpenUIServerError,
				readOpenUIRequest,
				streamOpenUIResponse,
			].every((value) => typeof value === "function"),
		).toBe(true);
	});
});
