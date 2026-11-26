import {
	Menu as UiMenu,
	MenuCheckboxItem as UiMenuCheckboxItem,
	MenuContent as UiMenuContent,
	MenuContextTrigger as UiMenuContextTrigger,
	MenuGroup as UiMenuGroup,
	MenuGroupLabel as UiMenuGroupLabel,
	MenuItem as UiMenuItem,
	MenuItemIcon as UiMenuItemIcon,
	MenuItemIndicator as UiMenuItemIndicator,
	MenuItems as UiMenuItems,
	MenuRadioGroup as UiMenuRadioGroup,
	MenuRadioItem as UiMenuRadioItem,
	MenuSeparator as UiMenuSeparator,
	MenuShortcut as UiMenuShortcut,
	MenuSub as UiMenuSub,
	MenuSubContent as UiMenuSubContent,
	MenuSubTrigger as UiMenuSubTrigger,
	MenuTrigger as UiMenuTrigger,
} from "@ui-sdk/react/menu";
import type { ComponentProps, ComponentType } from "react";
import { Button, type ButtonVariant } from "../Button/Button.js";

export type MenuCheckboxItemProps = ComponentProps<typeof UiMenuCheckboxItem>;
export type MenuContextTriggerProps = ComponentProps<typeof UiMenuContextTrigger>;
export type MenuItemIndicatorProps = ComponentProps<typeof UiMenuItemIndicator>;
export type MenuItemsProps = ComponentProps<typeof UiMenuItems>;
export type MenuRadioGroupProps = ComponentProps<typeof UiMenuRadioGroup>;
export type MenuRadioItemProps = ComponentProps<typeof UiMenuRadioItem>;
export type MenuSubProps = ComponentProps<typeof UiMenuSub>;
export type MenuSubContentProps = ComponentProps<typeof UiMenuSubContent>;
export type MenuSubTriggerProps = ComponentProps<typeof UiMenuSubTrigger>;
export type MenuProps = ComponentProps<typeof UiMenu>;
export type MenuTriggerProps = ComponentProps<typeof UiMenuTrigger> & {
	variant?: Extract<ButtonVariant, "solid" | "soft" | "ghost">;
};
export type MenuContentProps = ComponentProps<typeof UiMenuContent>;
export type MenuItemProps = ComponentProps<typeof UiMenuItem>;
export type MenuGroupProps = ComponentProps<typeof UiMenuGroup>;
export type MenuGroupLabelProps = ComponentProps<typeof UiMenuGroupLabel>;
export type MenuSeparatorProps = ComponentProps<typeof UiMenuSeparator>;
export type MenuItemIconProps = ComponentProps<typeof UiMenuItemIcon>;
export type MenuShortcutProps = ComponentProps<typeof UiMenuShortcut>;

export const MenuCheckboxItem = UiMenuCheckboxItem;
export const MenuContextTrigger = UiMenuContextTrigger;
export const MenuItemIndicator = UiMenuItemIndicator;
export const MenuItems = UiMenuItems;
export const MenuRadioGroup = UiMenuRadioGroup;
export const MenuRadioItem = UiMenuRadioItem;
export const MenuSub = UiMenuSub;
export const MenuSubContent = UiMenuSubContent;
export const MenuSubTrigger = UiMenuSubTrigger;
export const Menu = UiMenu;
export const MenuContent = UiMenuContent;
export const MenuItem = UiMenuItem;
export const MenuGroup = UiMenuGroup;
export const MenuGroupLabel = UiMenuGroupLabel;
export const MenuSeparator: ComponentType<MenuSeparatorProps> = UiMenuSeparator;
export const MenuItemIcon = UiMenuItemIcon;
export const MenuShortcut: ComponentType<MenuShortcutProps> = UiMenuShortcut;

export function MenuTrigger({ children, className, render, variant, ...props }: MenuTriggerProps) {
	if (render) {
		return (
			<UiMenuTrigger {...props} className={className} render={render}>
				{children}
			</UiMenuTrigger>
		);
	}
	const classes = ["ts-menu-trigger", typeof className === "string" ? className : undefined].filter(Boolean).join(" ");
	return (
		<Button
			className={classes}
			variant={variant}
			render={(buttonProps) => {
				const baseClassName = typeof buttonProps.className === "string" ? buttonProps.className : "";
				const triggerClassName =
					typeof className === "function"
						? (state: Parameters<typeof className>[0]) =>
								[baseClassName, "ts-menu-trigger", className(state)].filter(Boolean).join(" ")
						: baseClassName;
				return (
					<UiMenuTrigger {...buttonProps} {...props} className={triggerClassName}>
						{children}
					</UiMenuTrigger>
				);
			}}
		/>
	);
}
