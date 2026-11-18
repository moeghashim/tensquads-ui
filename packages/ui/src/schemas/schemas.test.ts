import { describe, expect, it } from "vitest";
import {
	AGENT_ROLE_TO_SLUG,
	AGENT_SLUG_TO_ROLE,
	AgentRoleSchema,
	AgentSlugSchema,
	AgentStateSchema,
	DirectionSchema,
	LocaleSchema,
} from "./index";

describe("shared schemas", () => {
	it("accepts the supported locales and directions", () => {
		expect(LocaleSchema.options).toEqual(["en", "ar"]);
		expect(DirectionSchema.options).toEqual(["ltr", "rtl"]);
	});

	it("accepts the mascot slugs and loop states", () => {
		expect(AgentRoleSchema.options).toEqual([
			"master",
			"orders",
			"support",
			"marketing",
			"finance",
			"inventory",
			"market",
			"website",
			"analytics",
			"hr",
			"places",
			"catalog",
			"channels",
		]);
		expect(AGENT_ROLE_TO_SLUG).toEqual({
			master: "petra",
			orders: "pisa",
			support: "kyoto",
			marketing: "rio",
			finance: "zurich",
			inventory: "giza",
			market: "machu",
			website: "angkor",
			analytics: "delphi",
			hr: "sydney",
			places: "greenwich",
			catalog: "alexandria",
			channels: "venice",
		});
		expect(AGENT_SLUG_TO_ROLE.petra).toBe("master");
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
