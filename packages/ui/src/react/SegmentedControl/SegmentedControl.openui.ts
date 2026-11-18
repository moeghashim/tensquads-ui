"use client";

import { createElement, useState } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { SegmentedControl, SegmentedControlIndicator, SegmentedControlItem } from "./SegmentedControl.js";

const segmentedProps = z
	.object({
		label: z.string().min(1),
		options: z
			.array(z.string().min(1))
			.min(2)
			.max(4)
			.refine((options) => new Set(options).size === options.length, "Options must be distinct."),
		value: z.string().optional(),
	})
	.refine(
		({ options, value }) => value === undefined || options.includes(value),
		"Initial value must be one of the options.",
	);

export const SegmentedControlOpenUI = defineComponent({
	name: "SegmentedControl",
	description: "An accessible exclusive selection control for two or more modes.",
	props: segmentedProps,
	component: function StreamedSegmentedControl({ props }) {
		const [userValue, setUserValue] = useState<string | null | undefined>(undefined);
		const parsed = segmentedProps.safeParse(props);
		if (!parsed.success) return null;
		const { label, options, value } = parsed.data;
		return createElement(
			SegmentedControl,
			{
				"aria-label": label,
				value: userValue === undefined ? value ?? options[0] : userValue,
				onValueChange: setUserValue,
			},
			createElement(SegmentedControlIndicator),
			...options.map((option) => createElement(SegmentedControlItem, { key: option, value: option }, option)),
		);
	},
});
registerComponent(SegmentedControlOpenUI);
