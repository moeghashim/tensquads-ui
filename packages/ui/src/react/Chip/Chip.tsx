import { Button as UiButton } from "@ui-sdk/react/button";
import type { ComponentProps, ReactNode } from "react";

export type ChipProps = Omit<ComponentProps<typeof UiButton>, "children"> & {
	name: string;
	icon: ReactNode;
};

export function Chip({ name, icon, className, ...props }: ChipProps) {
	return (
		<UiButton
			{...props}
			className={
				typeof className === "function"
					? (state) => ["ts-chip", className(state)].filter(Boolean).join(" ")
					: ["ts-chip", className].filter(Boolean).join(" ")
			}
		>
			<span className="ts-chip__icon" aria-hidden="true">
				{icon}
			</span>
			<span className="ts-chip__name">{name}</span>
		</UiButton>
	);
}
