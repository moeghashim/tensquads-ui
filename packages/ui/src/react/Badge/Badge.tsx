import type { ComponentProps } from "react";

export type BadgeTone = "default" | "success" | "warning" | "danger" | "info";

export type BadgeProps = ComponentProps<"span"> & {
	tone?: BadgeTone;
};

export function Badge({ tone = "default", className, ...props }: BadgeProps) {
	return (
		<span
			{...props}
			data-slot="badge"
			className={["ts-badge", `ts-badge--${tone}`, className].filter(Boolean).join(" ")}
		/>
	);
}
