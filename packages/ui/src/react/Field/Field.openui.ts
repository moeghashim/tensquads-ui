import { createElement, useEffect, useState } from "react";
import { z } from "zod/v4";
import { defineComponent } from "../../openui/define-component.js";
import { registerComponent } from "../../openui/registration-store.js";
import { Input } from "../Input/Input.js";
import { Field, FieldDescription, FieldError, FieldLabel } from "./Field.js";

export const FieldOpenUI = defineComponent({
	name: "Field",
	description: "A labeled text input with optional description and validation message.",
	props: z.object({
		label: z.string().min(1).describe("Visible field label"),
		name: z.string().min(1),
		placeholder: z.string().optional(),
		value: z.string().optional(),
		description: z.string().optional(),
		error: z.string().optional(),
		disabled: z.boolean().default(false),
		readOnly: z.boolean().default(false),
	}),
	component: ({ props }) => {
		const [currentValue, setCurrentValue] = useState(props.value ?? "");
		useEffect(() => setCurrentValue(props.value ?? ""), [props.value]);
		return createElement(
			Field,
			{ name: props.name, disabled: props.disabled, invalid: Boolean(props.error) },
			createElement(FieldLabel, null, props.label),
			createElement(Input, {
				name: props.name,
				placeholder: props.placeholder,
				value: currentValue,
				onValueChange: setCurrentValue,
				disabled: props.disabled,
				readOnly: props.readOnly,
			}),
			props.description ? createElement(FieldDescription, null, props.description) : null,
			props.error ? createElement(FieldError, { match: true }, props.error) : null,
		);
	},
});

registerComponent(FieldOpenUI);
