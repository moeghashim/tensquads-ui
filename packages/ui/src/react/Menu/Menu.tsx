import {
	Menu as UiMenu,
	MenuContent as UiMenuContent,
	MenuGroup as UiMenuGroup,
	MenuGroupLabel as UiMenuGroupLabel,
	MenuItem as UiMenuItem,
	MenuItemIcon as UiMenuItemIcon,
	MenuSeparator as UiMenuSeparator,
	MenuShortcut as UiMenuShortcut,
	MenuTrigger as UiMenuTrigger,
} from "@ui-sdk/react/menu";
import type { ComponentProps, ComponentType } from "react";
import { Button } from "../Button/Button.js";

export type MenuProps = ComponentProps<typeof UiMenu>;
export type MenuTriggerProps = ComponentProps<typeof UiMenuTrigger>;
export type MenuContentProps = ComponentProps<typeof UiMenuContent>;
export type MenuItemProps = ComponentProps<typeof UiMenuItem>;
export type MenuGroupProps = ComponentProps<typeof UiMenuGroup>;
export type MenuGroupLabelProps = ComponentProps<typeof UiMenuGroupLabel>;
export type MenuSeparatorProps = ComponentProps<typeof UiMenuSeparator>;
export type MenuItemIconProps = ComponentProps<typeof UiMenuItemIcon>;
export type MenuShortcutProps = ComponentProps<typeof UiMenuShortcut>;

export const Menu = UiMenu;
export const MenuContent = UiMenuContent;
export const MenuItem = UiMenuItem;
export const MenuGroup = UiMenuGroup;
export const MenuGroupLabel = UiMenuGroupLabel;
export const MenuSeparator: ComponentType<MenuSeparatorProps> = UiMenuSeparator;
export const MenuItemIcon = UiMenuItemIcon;
export const MenuShortcut: ComponentType<MenuShortcutProps> = UiMenuShortcut;

export function MenuTrigger({ children, className, render, ...props }: MenuTriggerProps) {
	if (render) {
		return (
			<UiMenuTrigger {...props} className={className} render={render}>
				{children ?? "Actions"}
			</UiMenuTrigger>
		);
	}
	const classes = ["ts-menu-trigger", typeof className === "string" ? className : undefined].filter(Boolean).join(" ");
	return (
		<Button
			className={classes}
			render={(buttonProps) => {
				const baseClassName = typeof buttonProps.className === "string" ? buttonProps.className : "";
				const triggerClassName =
					typeof className === "function"
						? (state: Parameters<typeof className>[0]) =>
								[baseClassName, "ts-menu-trigger", className(state)].filter(Boolean).join(" ")
						: baseClassName;
				return (
					<UiMenuTrigger {...buttonProps} {...props} className={triggerClassName}>
						{children ?? "Actions"}
					</UiMenuTrigger>
				);
			}}
		/>
	);
}
