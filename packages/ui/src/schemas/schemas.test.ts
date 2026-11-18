import { describe, expect, it } from "vitest";
import { AgentSlugSchema, AgentStateSchema, DirectionSchema, LocaleSchema } from "./index";

describe("shared schemas", () => {
	it("accepts the supported locales and directions", () => {
		expect(LocaleSchema.options).toEqual(["en", "ar"]);
		expect(DirectionSchema.options).toEqual(["ltr", "rtl"]);
	});

	it("accepts the mascot slugs and loop states", () => {
		expect(AgentSlugSchema.options).toEqual([
			"petra",
			"pisa",
			"kyoto",
			"rio",
			"zurich",
			"giza",
			"machu",
			"angkor",
			"delphi",
			"sydney",
			"greenwich",
			"alexandria",
			"venice",
		]);
		expect(AgentStateSchema.options).toEqual([
			"blocked",
			"checking",
			"done",
			"dropped",
			"escalated",
			"idle",
			"planning",
			"running",
			"sentback",
			"waiting",
		]);
	});
});
