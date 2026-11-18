import {
	SegmentedControl as UiSegmentedControl,
	SegmentedControlIndicator as UiSegmentedControlIndicator,
	SegmentedControlItem as UiSegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import type { ComponentProps } from "react";

export type SegmentedControlProps = ComponentProps<typeof UiSegmentedControl>;
export type SegmentedControlItemProps = ComponentProps<typeof UiSegmentedControlItem>;
export type SegmentedControlIndicatorProps = ComponentProps<typeof UiSegmentedControlIndicator>;

export function SegmentedControl(props: SegmentedControlProps) {
	const className = props.className;
	return (
		<UiSegmentedControl
			{...props}
			className={
				typeof className === "function"
					? (state) => `ts-segmented-control ${className(state) ?? ""}`
					: ["ts-segmented-control", className].filter(Boolean).join(" ")
			}
		/>
	);
}

export function SegmentedControlItem(props: SegmentedControlItemProps) {
	const className = props.className;
	return (
		<UiSegmentedControlItem
			{...props}
			className={
				typeof className === "function"
					? (state) => `ts-segmented-control__item ${className(state) ?? ""}`
					: ["ts-segmented-control__item", className].filter(Boolean).join(" ")
			}
		/>
	);
}

export function SegmentedControlIndicator(props: SegmentedControlIndicatorProps) {
	const className = props.className;
	return (
		<UiSegmentedControlIndicator
			{...props}
			className={
				typeof className === "function"
					? (state) => `ts-segmented-control__indicator ${className(state) ?? ""}`
					: ["ts-segmented-control__indicator", className].filter(Boolean).join(" ")
			}
		/>
	);
}
