import { createElement } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { Bars } from "./Bars.js";

export const BarsOpenUI = defineComponent({
	name: "Bars",
	description: "Ranked horizontal bars or compact progress rows.",
	props: z.object({
		rows: z.array(
			z.object({
				label: z.string(),
				value: z.number().nonnegative(),
				display: z.string(),
				tone: z.enum(["default", "info"]).optional(),
			}),
		),
		style: z.enum(["ranked", "progress"]).optional(),
		caption: z.string().optional(),
	}),
	component: ({ props }) => createElement(Bars, props),
});
registerComponent(BarsOpenUI);
