import type { ComponentProps } from "react";
import { FieldSet } from "../Field/Field.js";

export type FormProps = ComponentProps<"form"> & { disabled?: boolean };

export function Form({ children, disabled = false, onSubmit, className, ...props }: FormProps) {
	return (
		<form
			{...props}
			className={["ts-form", className].filter(Boolean).join(" ")}
			onSubmit={(event) => {
				event.preventDefault();
				if (!disabled) onSubmit?.(event);
			}}
		>
			<FieldSet disabled={disabled}>{children}</FieldSet>
		</form>
	);
}
