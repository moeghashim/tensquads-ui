"use client";

import { useIsStreaming } from "@openuidev/react-lang";
import { createElement, useContext } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { OpenUILocaleContext } from "../../openui/locale.js";
import { registerComponent } from "../../openui/registration-store.js";
import { DateRangePicker } from "./DateRangePicker.js";

const range = z.object({ start: z.iso.date(), end: z.iso.date() });

export const DateRangePickerOpenUI = defineComponent({
	name: "DateRangePicker",
	description: "A labeled picker for a start and end date. Give dates as Gregorian YYYY-MM-DD strings.",
	props: z.object({
		label: z.string().min(1),
		defaultValue: range.nullable().optional(),
		min: z.iso.date().optional(),
		max: z.iso.date().optional(),
		presets: z.array(z.object({ label: z.string().min(1), value: range })).optional(),
		disabled: z.boolean().default(false),
		invalid: z.boolean().default(false),
	}),
	component: function StreamedDateRangePicker({ props: { label, ...props } }) {
		const locale = useContext(OpenUILocaleContext);
		const isStreaming = useIsStreaming();
		const initial = props.defaultValue;
		return createElement(DateRangePicker, {
			...props,
			key: initial ? `${initial.start}/${initial.end}` : "empty",
			disabled: props.disabled || isStreaming,
			locale,
			"aria-label": label,
		});
	},
});

registerComponent(DateRangePickerOpenUI);
