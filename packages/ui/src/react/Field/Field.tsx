import {
	Field as UiField,
	FieldControl as UiFieldControl,
	FieldDescription as UiFieldDescription,
	FieldError as UiFieldError,
	FieldLabel as UiFieldLabel,
} from "@ui-sdk/react/field";
import type { ComponentProps } from "react";

function classes<State>(className: string | ((state: State) => string | undefined) | undefined, own: string) {
	return typeof className === "function"
		? (state: State) => [own, className(state)].filter(Boolean).join(" ")
		: [own, className].filter(Boolean).join(" ");
}

export type FieldProps = ComponentProps<typeof UiField>;
export function Field({ className, ...props }: FieldProps) {
	return <UiField {...props} className={classes(className, "ts-field")} />;
}

export type FieldLabelProps = ComponentProps<typeof UiFieldLabel>;
export function FieldLabel({ className, ...props }: FieldLabelProps) {
	return <UiFieldLabel {...props} className={classes(className, "ts-field__label")} />;
}

export type FieldControlProps = ComponentProps<typeof UiFieldControl>;
export function FieldControl({ className, ...props }: FieldControlProps) {
	return <UiFieldControl {...props} className={classes(className, "ts-field__control")} />;
}

export type FieldDescriptionProps = ComponentProps<typeof UiFieldDescription>;
export function FieldDescription({ className, ...props }: FieldDescriptionProps) {
	return <UiFieldDescription {...props} className={classes(className, "ts-field__description")} />;
}

export type FieldErrorProps = ComponentProps<typeof UiFieldError>;
export function FieldError({ className, ...props }: FieldErrorProps) {
	return <UiFieldError {...props} className={classes(className, "ts-field__error")} />;
}
