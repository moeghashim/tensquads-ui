import { createElement } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { SegmentedControl, SegmentedControlIndicator, SegmentedControlItem } from "./SegmentedControl.js";

export const SegmentedControlOpenUI = defineComponent({
	name: "SegmentedControl",
	description: "An accessible exclusive selection control for two or more modes.",
	props: z.object({
		label: z.string().min(1),
		options: z.array(z.string().min(1)).min(2).max(4),
		value: z.string().optional(),
	}),
	component: ({ props }) =>
		createElement(
			SegmentedControl,
			{ "aria-label": props.label, defaultValue: props.value ?? props.options[0] },
			createElement(SegmentedControlIndicator),
			...props.options.map((option) => createElement(SegmentedControlItem, { key: option, value: option }, option)),
		),
});
registerComponent(SegmentedControlOpenUI);
