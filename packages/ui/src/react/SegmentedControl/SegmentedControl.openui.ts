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

const optionSlots = ["first", "second", "third", "fourth"] as const;

export const SegmentedControlOpenUI = defineComponent({
	name: "SegmentedControl",
	description: "An accessible exclusive selection control for two or more modes.",
	props: segmentedProps,
	component: function StreamedSegmentedControl({ props }) {
		const [userSlot, setUserSlot] = useState<string | null>(null);
		const [focusedSlot, setFocusedSlot] = useState<string | null>(null);
		const options = optionSlots.flatMap((id, position) => {
			const label = props.options?.[position];
			if (!label) return [];
			return [{ id, label }];
		});
		const items = options.map((option) => {
			const duplicates = options.filter(({ label }) => label === option.label);
			const owner =
				duplicates.find(({ id }) => id === focusedSlot) ??
				duplicates.find(({ id }) => id === userSlot) ??
				duplicates[0];
			return { ...option, disabled: owner?.id !== option.id };
		});
		const selectable = items.filter(({ disabled }) => !disabled);
		const userOption = options.find(({ id }) => id === userSlot);
		const selected =
			selectable.find(({ label }) => label === userOption?.label) ??
			selectable.find(({ label }) => label === props.value) ??
			selectable[0];
		return createElement(
			SegmentedControl,
			{
				"aria-label": props.label,
				value: selected?.id ?? null,
				onValueChange: setUserSlot,
			},
			createElement(SegmentedControlIndicator),
			...items.map(({ id, label, disabled }) =>
				createElement(
					SegmentedControlItem,
					{
						key: id,
						value: id,
						disabled,
						onClick: () => {
							if (!disabled) setUserSlot(id);
						},
						onFocus: () => setFocusedSlot(id),
						onBlur: () => setFocusedSlot(null),
					},
					label,
				),
			),
		);
	},
});
registerComponent(SegmentedControlOpenUI);
