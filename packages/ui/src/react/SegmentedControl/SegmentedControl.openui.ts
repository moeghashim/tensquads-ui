"use client";

import { createElement, useEffect, useState } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { useFormValue } from "../../openui/use-form-value.js";
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
		disabled: z.boolean().default(false),
		name: z.string().min(1).optional(),
	})
	.refine(
		({ options, value }) => value === undefined || options.includes(value),
		"Initial value must be one of the options.",
	);

const optionSlots = ["first", "second", "third", "fourth"] as const;

export const SegmentedControlOpenUI = defineComponent({
	name: "SegmentedControl",
	description:
		"An accessible exclusive selection control for two or more modes. Inside a Form it submits its selected value by name.",
	props: segmentedProps,
	component: function StreamedSegmentedControl({ props }) {
		const name = props.name ?? props.label;
		const initialValue = props.value ?? props.options?.[0] ?? "";
		const field = useFormValue(name, initialValue, "SegmentedControl", true);
		const [userSlot, setUserSlot] = useState<string | null>(null);
		const [focusedSlot, setFocusedSlot] = useState<string | null>(null);
		const disabled = props.disabled || field.isStreaming;
		const options = optionSlots.flatMap((id, position) => {
			const label = props.options?.[position];
			if (!label) return [];
			return [{ id, label }];
		});
		useEffect(() => {
			const selectedOption = options.find(({ id }) => id === userSlot);
			if (selectedOption && selectedOption.label !== field.value) field.onValueChange(selectedOption.label);
		}, [field.onValueChange, field.value, options, userSlot]);
		const selected =
			options.find(({ id }) => id === userSlot) ?? options.find(({ label }) => label === field.value) ?? options[0];
		const items = options.map((option) => {
			const duplicates = options.filter(({ label }) => label === option.label);
			const owner =
				duplicates.find(({ id }) => id === focusedSlot) ??
				duplicates.find(({ id }) => id === userSlot) ??
				duplicates.find(({ label }) => label === field.value) ??
				duplicates[0];
			return { ...option, disabled: owner?.id !== option.id };
		});
		return createElement(
			SegmentedControl,
			{
				"aria-label": props.label,
				value: selected?.id ?? null,
				disabled,
				onValueChange: (id: string | null) => {
					const option = options.find((item) => item.id === id);
					if (option) {
						setUserSlot(id);
						field.onValueChange(option.label);
					}
				},
			},
			createElement(SegmentedControlIndicator),
			...items.map(({ id, label, disabled: duplicateDisabled }) =>
				createElement(
					SegmentedControlItem,
					{
						key: id,
						value: id,
						disabled: disabled || duplicateDisabled,
						onClick: () => {
							if (!disabled && !duplicateDisabled) {
								setUserSlot(id);
								field.onValueChange(label);
							}
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
