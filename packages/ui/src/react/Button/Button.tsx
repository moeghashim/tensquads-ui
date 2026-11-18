import { Button as UiButton } from "@ui-sdk/react/button";
import type { ComponentProps } from "react";

export type ButtonVariant = "solid" | "soft" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ComponentProps<typeof UiButton> & {
	variant?: ButtonVariant;
	size?: ButtonSize;
	pill?: boolean;
	iconOnly?: boolean;
};

export function Button({
	variant = "solid",
	size = "md",
	pill = false,
	iconOnly = false,
	className,
	children,
	...props
}: ButtonProps) {
	if (iconOnly && !props["aria-label"]) {
		throw new Error("Button requires aria-label when iconOnly is true");
	}

	const classes = [
		"ts-button",
		`ts-button--${variant}`,
		`ts-button--${size}`,
		pill && "ts-button--pill",
		iconOnly && "ts-button--icon-only",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<UiButton
			{...props}
			className={
				typeof className === "function"
					? (state) => [classes, className(state)].filter(Boolean).join(" ")
					: [classes, className].filter(Boolean).join(" ")
			}
		>
			{children}
		</UiButton>
	);
}
