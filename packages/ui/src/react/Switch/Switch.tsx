import { Switch as UiSwitch, SwitchThumb as UiSwitchThumb } from "@ui-sdk/react/switch";
import type { ComponentProps } from "react";

export type SwitchProps = ComponentProps<typeof UiSwitch>;
export type SwitchThumbProps = ComponentProps<typeof UiSwitchThumb>;

export function Switch(props: SwitchProps) {
	return <UiSwitch {...props} className={joinClassName("ts-switch", props.className)} />;
}

export function SwitchThumb(props: SwitchThumbProps) {
	return <UiSwitchThumb {...props} className={joinClassName("ts-switch__thumb", props.className)} />;
}

function joinClassName(base: string, className: SwitchProps["className"]): SwitchProps["className"] {
	if (typeof className === "function") return (state) => `${base} ${className(state)}`;
	return [base, className].filter(Boolean).join(" ");
}
