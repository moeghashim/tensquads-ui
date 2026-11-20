import { Toggle, ToggleIcon } from "@ui-sdk/react/toggle";
import { ToolbarButton, ToolbarSeparator, Toolbar as UiToolbar } from "@ui-sdk/react/toolbar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui-sdk/react/tooltip";
import type { ComponentProps, ReactNode } from "react";

export type ToolbarItem =
	| {
			type: "toggle";
			id: string;
			label: string;
			icon: ReactNode;
			pressed: boolean;
			onPressedChange: (pressed: boolean) => void;
			disabled?: boolean;
	  }
	| {
			type: "button";
			id: string;
			label: string;
			icon: ReactNode;
			onClick: () => void;
			disabled?: boolean;
	  }
	| { type: "separator"; id: string };

export type ToolbarProps = Omit<ComponentProps<typeof UiToolbar>, "children" | "aria-label"> & {
	label: string;
	items: readonly ToolbarItem[];
};

export function Toolbar({ label, items, className, ...props }: ToolbarProps) {
	return (
		<UiToolbar
			{...props}
			aria-label={label}
			className={
				typeof className === "function"
					? (state) => `ts-toolbar ${className(state)}`
					: ["ts-toolbar", className].filter(Boolean).join(" ")
			}
		>
			{items.map((item) => {
				if (item.type === "separator") return <ToolbarSeparator key={item.id} />;
				return (
					<Tooltip key={item.id} type="label">
						{item.type === "toggle" ? (
							<Toggle
								aria-label={item.label}
								className="ts-toolbar__control"
								disabled={item.disabled}
								onPressedChange={item.onPressedChange}
								pressed={item.pressed}
								render={<TooltipTrigger aria-label={item.label} />}
							>
								<ToggleIcon>{item.icon}</ToggleIcon>
							</Toggle>
						) : (
							<ToolbarButton
								aria-label={item.label}
								className="ts-toolbar__control"
								disabled={item.disabled}
								onClick={item.onClick}
								render={<TooltipTrigger aria-label={item.label} />}
							>
								{item.icon}
							</ToolbarButton>
						)}
						<TooltipContent>{item.label}</TooltipContent>
					</Tooltip>
				);
			})}
		</UiToolbar>
	);
}
