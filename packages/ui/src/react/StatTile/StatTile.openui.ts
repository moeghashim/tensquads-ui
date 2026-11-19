import { createElement } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { StatTile } from "./StatTile.js";

export const StatTileOpenUI = defineComponent({
	name: "StatTile",
	description: "A headline metric with an optional delta, unit, footnote and trend sparkline.",
	props: z.object({
		label: z.string().min(1),
		value: z.string().min(1),
		glyph: z.string().optional(),
		unit: z.string().optional(),
		foot: z.string().optional(),
		delta: z
			.object({ text: z.string().min(1), tone: z.enum(["positive", "negative", "neutral"]) })
			.nullable()
			.optional(),
		series: z.array(z.number()).nullable().optional(),
	}),
	component: ({ props }) => createElement(StatTile, props),
});

registerComponent(StatTileOpenUI);
