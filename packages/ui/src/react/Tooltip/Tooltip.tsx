import {
	Tooltip as UiTooltip,
	TooltipArrow as UiTooltipArrow,
	TooltipContent as UiTooltipContent,
	TooltipShortcut as UiTooltipShortcut,
	TooltipTrigger as UiTooltipTrigger,
} from "@ui-sdk/react/tooltip";
import type { ComponentProps, ComponentType } from "react";

export type TooltipProps = ComponentProps<typeof UiTooltip>;
export type TooltipTriggerProps = ComponentProps<typeof UiTooltipTrigger>;
export type TooltipContentProps = ComponentProps<typeof UiTooltipContent>;
export type TooltipArrowProps = ComponentProps<typeof UiTooltipArrow>;
export type TooltipShortcutProps = ComponentProps<typeof UiTooltipShortcut>;

export const Tooltip = UiTooltip;
export const TooltipTrigger: ComponentType<TooltipTriggerProps> = UiTooltipTrigger;
export const TooltipContent: ComponentType<TooltipContentProps> = UiTooltipContent;
export const TooltipArrow: ComponentType<TooltipArrowProps> = UiTooltipArrow;
export const TooltipShortcut: ComponentType<TooltipShortcutProps> = UiTooltipShortcut;
