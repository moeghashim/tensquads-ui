import { createElement } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { AgentSlugSchema, AgentStateSchema, LocaleSchema } from "../../schemas/index.js";
import { Squadmate } from "./Squadmate.js";

export const SquadmateOpenUI = defineComponent({
	name: "Squadmate",
	description: "An accessible image of a tensquads agent in a loop state.",
	props: z.object({
		agent: AgentSlugSchema.describe("Character slug"),
		state: AgentStateSchema.describe("Agent loop state"),
		size: z.number().positive().default(64).describe("Image width and height in pixels"),
		locale: LocaleSchema.default("en").describe("Locale for the accessible image name"),
	}),
	component: ({ props }) => createElement(Squadmate, props),
});

registerComponent(SquadmateOpenUI);
