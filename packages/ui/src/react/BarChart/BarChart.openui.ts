import { createElement } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { BarChart } from "./BarChart.js";

export const BarChartOpenUI = defineComponent({
	name: "BarChart",
	description: "A vertical chart of values over time, with optional stacked series.",
	props: z.object({
		points: z.array(
			z.object({
				label: z.string(),
				value: z.number().optional(),
				segments: z.array(z.object({ key: z.string(), value: z.number() })).optional(),
			}),
		),
		keys: z
			.array(
				z.object({
					key: z.string(),
					label: z.string(),
					tone: z.enum(["muted", "strong", "success", "danger"]),
				}),
			)
			.optional(),
		highlight: z.tuple([z.number(), z.number()]).nullable().optional(),
		label: z.string().optional(),
	}),
	component: ({ props }) => createElement(BarChart, props),
});
registerComponent(BarChartOpenUI);
