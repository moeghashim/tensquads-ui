import { Textarea as UiTextarea } from "@ui-sdk/react/textarea";
import type { ComponentProps, FormEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "../../schemas/index.js";
import { Button } from "../Button/Button.js";

export type ChatProps = ComponentProps<"section">;
export function Chat({ className, ...props }: ChatProps) {
	return <section {...props} className={["ts-chat", className].filter(Boolean).join(" ")} />;
}

export type ChatHeaderProps = ComponentProps<"header"> & {
	onNewChat?: () => void;
	newChatLabel?: string;
	locale?: Locale;
};
export function ChatHeader({ children, onNewChat, newChatLabel, locale = "en", className, ...props }: ChatHeaderProps) {
	return (
		<header {...props} className={["ts-chat__header", className].filter(Boolean).join(" ")}>
			{children}
			<Button variant="ghost" size="sm" onClick={onNewChat}>
				{newChatLabel ?? (locale === "ar" ? "محادثة جديدة" : "New chat")}
			</Button>
		</header>
	);
}

export type ChatLogProps = ComponentProps<"div"> & { children?: ReactNode };
export function ChatLog({ children, className, ...props }: ChatLogProps) {
	const ref = useRef<HTMLDivElement>(null);
	const pinned = useRef(true);
	useEffect(() => {
		const log = ref.current;
		if (!log || !pinned.current) return;
		log.scrollTop = log.scrollHeight;
	}, [children]);
	return (
		<div
			{...props}
			ref={ref}
			role="log"
			aria-live="polite"
			className={["ts-chat__log", className].filter(Boolean).join(" ")}
			onScroll={(event) => {
				props.onScroll?.(event);
				const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
				pinned.current = scrollHeight - scrollTop - clientHeight < 24;
			}}
		>
			{children}
		</div>
	);
}

export type ChatUserMessageProps = ComponentProps<"div">;
export function ChatUserMessage({ className, ...props }: ChatUserMessageProps) {
	return <div {...props} className={["ts-chat__user-message", className].filter(Boolean).join(" ")} />;
}

export type ChatStepProps = ComponentProps<"article"> & {
	name: string;
	glyph?: ReactNode;
	status?: string;
	statusVariant?: "default" | "danger";
	responseId?: string;
	running?: boolean;
	reply?: ReactNode;
};
export function ChatStep({
	name,
	glyph,
	status,
	statusVariant = "default",
	responseId,
	running = false,
	reply,
	className,
	...props
}: ChatStepProps) {
	return (
		<article {...props} className={["ts-chat__step", className].filter(Boolean).join(" ")}>
			<div className="ts-chat__step-glyph" aria-hidden="true">
				{running ? <span className="ts-chat__spinner" /> : glyph}
			</div>
			<div className="ts-chat__step-content">
				<div className="ts-chat__step-heading">
					<strong>{name}</strong>
					{status && <span className={`ts-chat__status ts-chat__status--${statusVariant}`}>{status}</span>}
				</div>
				{responseId && <div className="ts-chat__response-id">{responseId}</div>}
				{reply != null && <div className="ts-chat__reply">{reply}</div>}
			</div>
		</article>
	);
}

export type ChatEmptyStateProps = ComponentProps<"div"> & {
	title?: string;
	description?: string;
	glyph?: ReactNode;
	locale?: Locale;
};
export function ChatEmptyState({ title, description, glyph, locale = "en", className, ...props }: ChatEmptyStateProps) {
	return (
		<div {...props} className={["ts-chat__empty", className].filter(Boolean).join(" ")}>
			<div className="ts-chat__empty-glyph" aria-hidden="true">
				{glyph}
			</div>
			<strong>{title ?? (locale === "ar" ? "معاينة الوكيل" : "Preview your agent")}</strong>
			<p>
				{description ??
					(locale === "ar" ? "جرّب مطالبة الوكيل كما لو كنت المستخدم." : "Prompt the agent as if you're the user.")}
			</p>
		</div>
	);
}

export type ChatComposerProps = Omit<ComponentProps<"form">, "onSubmit"> & {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	onSend: (value: string) => void;
	onStop?: () => void;
	busy?: boolean;
	locale?: Locale;
	attach?: ReactNode;
	placeholder?: string;
	sendLabel?: string;
	stopLabel?: string;
	textareaProps?: Omit<
		ComponentProps<typeof UiTextarea>,
		"value" | "defaultValue" | "onValueChange" | "onSubmit" | "submitShortcut" | "autoResize"
	>;
};
export function ChatComposer({
	value: controlledValue,
	defaultValue = "",
	onValueChange,
	onSend,
	onStop,
	busy = false,
	locale = "en",
	attach,
	placeholder,
	sendLabel,
	stopLabel,
	textareaProps,
	className,
	...props
}: ChatComposerProps) {
	const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
	const value = controlledValue ?? uncontrolledValue;
	const change = (next: string) => {
		if (controlledValue === undefined) setUncontrolledValue(next);
		onValueChange?.(next);
	};
	const send = () => {
		const message = value.trim();
		if (message && !busy) {
			onSend(message);
			change("");
		}
	};
	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		send();
	};
	return (
		<form {...props} className={["ts-chat__composer", className].filter(Boolean).join(" ")} onSubmit={submit}>
			<UiTextarea
				{...textareaProps}
				aria-label={textareaProps?.["aria-label"] ?? (locale === "ar" ? "رسالة" : "Message")}
				className="ts-chat__textarea"
				value={value}
				onValueChange={change}
				autoResize
				submitShortcut="enter"
				onSubmit={send}
				placeholder={placeholder ?? (locale === "ar" ? "اكتب رسالة" : undefined)}
			/>
			<div className="ts-chat__composer-actions">
				<div className="ts-chat__attach">{attach}</div>
				{busy ? (
					<Button
						type="button"
						variant="solid"
						pill
						iconOnly
						aria-label={stopLabel ?? (locale === "ar" ? "إيقاف" : "Stop")}
						onClick={onStop}
						className="ts-chat__send"
					>
						<svg aria-hidden="true" viewBox="0 0 12 12" fill="currentColor">
							<rect x="1" y="1" width="10" height="10" rx="1" />
						</svg>
					</Button>
				) : (
					<Button
						type="submit"
						variant="solid"
						pill
						iconOnly
						aria-label={sendLabel ?? (locale === "ar" ? "إرسال" : "Send")}
						disabled={!value.trim()}
						className="ts-chat__send"
					>
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.7"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M4 12h15M13 5l7 7-7 7" />
						</svg>
					</Button>
				)}
			</div>
		</form>
	);
}
