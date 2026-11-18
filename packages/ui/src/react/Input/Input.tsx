import { Input as UiInput, InputClear as UiInputClear, InputGroup as UiInputGroup } from "@ui-sdk/react/input";
import type { ComponentProps } from "react";

export type InputVariant = "soft" | "outline";
export type InputProps = ComponentProps<typeof UiInput> & { variant?: InputVariant };

export function Input({ variant = "soft", className, ...props }: InputProps) {
	const classes = ["ts-input", `ts-input--${variant}`].join(" ");
	return (
		<UiInput
			{...props}
			className={
				typeof className === "function"
					? (state) => [classes, className(state)].join(" ")
					: [classes, className].filter(Boolean).join(" ")
			}
		/>
	);
}

export type InputGroupProps = ComponentProps<typeof UiInputGroup>;
export function InputGroup(props: InputGroupProps) {
	return <UiInputGroup {...props} />;
}

export type InputClearProps = ComponentProps<typeof UiInputClear>;
export function InputClear(props: InputClearProps) {
	return <UiInputClear {...props} />;
}
