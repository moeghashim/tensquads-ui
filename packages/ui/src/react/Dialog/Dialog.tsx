import {
	Dialog as UiDialog,
	DialogBackdrop as UiDialogBackdrop,
	DialogClose as UiDialogClose,
	DialogContent as UiDialogContent,
	DialogDescription as UiDialogDescription,
	DialogTitle as UiDialogTitle,
	DialogTrigger as UiDialogTrigger,
} from "@ui-sdk/react/dialog";
import type { ComponentProps } from "react";

function classes<State>(className: string | ((state: State) => string | undefined) | undefined, own: string) {
	return typeof className === "function"
		? (state: State) => [own, className(state)].filter(Boolean).join(" ")
		: [own, className].filter(Boolean).join(" ");
}

export type DialogProps = ComponentProps<typeof UiDialog>;
export const Dialog = UiDialog;

export type DialogTriggerProps = ComponentProps<typeof UiDialogTrigger>;
export function DialogTrigger({ className, ...props }: DialogTriggerProps) {
	return <UiDialogTrigger {...props} className={classes(className, "ts-dialog__trigger")} />;
}

export type DialogBackdropProps = ComponentProps<typeof UiDialogBackdrop>;
export function DialogBackdrop({ className, ...props }: DialogBackdropProps) {
	return <UiDialogBackdrop {...props} className={classes(className, "ts-dialog__backdrop")} />;
}

export type DialogContentProps = ComponentProps<typeof UiDialogContent>;
export function DialogContent({ className, ...props }: DialogContentProps) {
	return <UiDialogContent {...props} className={classes(className, "ts-dialog__content")} />;
}

export type DialogTitleProps = ComponentProps<typeof UiDialogTitle>;
export function DialogTitle({ className, ...props }: DialogTitleProps) {
	return <UiDialogTitle {...props} className={classes(className, "ts-dialog__title")} />;
}

export type DialogDescriptionProps = ComponentProps<typeof UiDialogDescription>;
export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
	return <UiDialogDescription {...props} className={classes(className, "ts-dialog__description")} />;
}

export type DialogCloseProps = ComponentProps<typeof UiDialogClose>;
export function DialogClose({ className, ...props }: DialogCloseProps) {
	return <UiDialogClose {...props} className={classes(className, "ts-dialog__close")} />;
}
