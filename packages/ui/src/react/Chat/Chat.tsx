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
	const contentRef = useRef<HTMLDivElement>(null);
	const pinned = useRef(true);
	useEffect(() => {
		const log = ref.current;
		const content = contentRef.current;
		if (!log || !content) return;
		const follow = () => {
			if (pinned.current) log.scrollTop = log.scrollHeight;
		};
		const observer = new ResizeObserver(follow);
		observer.observe(content);
		observer.observe(log);
		follow();
		return () => observer.disconnect();
	}, []);
	return (
		<div
			{...props}
			ref={ref}
			role="log"
			aria-live="polite"
			tabIndex={props.tabIndex ?? 0}
			className={["ts-chat__log", className].filter(Boolean).join(" ")}
			onScroll={(event) => {
				props.onScroll?.(event);
				const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
				pinned.current = scrollHeight - scrollTop - clientHeight < 24;
			}}
		>
			<div ref={contentRef} className="ts-chat__log-content">
				{children}
			</div>
		</div>
	);
}

export type ChatUserMessageProps = ComponentProps<"div">;
export function ChatUserMessage({ className, ...props }: ChatUserMessageProps) {
	return <div {...props} className={["ts-chat__user-message", className].filter(Boolean).join(" ")} />;
}

export type ChatAssistantMessageProps = ComponentProps<"div">;
/** An agent reply in the thread: the content alone, with no avatar or name row. */
export function ChatAssistantMessage({ className, ...props }: ChatAssistantMessageProps) {
	return <div {...props} className={["ts-chat__assistant", className].filter(Boolean).join(" ")} />;
}

export type ChatWorkingProps = ComponentProps<"div"> & { glyph?: ReactNode; label?: string; locale?: Locale };
/** The status line shown while the agent works and before its reply text arrives. */
export function ChatWorking({ glyph, label, locale = "en", className, ...props }: ChatWorkingProps) {
	return (
		<div {...props} role="status" className={["ts-chat__working", className].filter(Boolean).join(" ")}>
			{glyph != null && (
				<span className="ts-chat__working-glyph" aria-hidden="true">
					{glyph}
				</span>
			)}
			<span className="ts-chat__working-label">{label ?? (locale === "ar" ? "جارٍ العمل" : "Working")}</span>
		</div>
	);
}

export type ChatErrorProps = ComponentProps<"div"> & {
	title?: string;
	onRetry?: () => void;
	retryLabel?: string;
	locale?: Locale;
};
/** A failed turn: what went wrong, and a retry when the host offers one. */
export function ChatError({
	title,
	onRetry,
	retryLabel,
	locale = "en",
	children,
	className,
	...props
}: ChatErrorProps) {
	return (
		<div {...props} role="alert" className={["ts-chat__error", className].filter(Boolean).join(" ")}>
			<strong className="ts-chat__error-title">
				{title ?? (locale === "ar" ? "حدث خطأ" : "Something went wrong")}
			</strong>
			{children != null && <div className="ts-chat__error-message">{children}</div>}
			{onRetry && (
				<Button type="button" variant="ghost" size="sm" onClick={onRetry} className="ts-chat__error-retry">
					{retryLabel ?? (locale === "ar" ? "إعادة المحاولة" : "Retry")}
				</Button>
			)}
		</div>
	);
}

export type ChatStepProps = ComponentProps<"article"> & {
	name: string;
	glyph?: ReactNode;
	status?: string;
	statusVariant?: "default" | "danger";
	responseId?: string;
	running?: boolean;
	reply?: ReactNode;
	onRetry?: () => void;
	retryLabel?: string;
};
export function ChatStep({
	name,
	glyph,
	status,
	statusVariant = "default",
	responseId,
	running = false,
	reply,
	onRetry,
	retryLabel,
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
					{onRetry && (
						<Button type="button" variant="ghost" size="sm" onClick={onRetry}>
							{retryLabel ?? "Retry"}
						</Button>
					)}
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
				placeholder={placeholder ?? (locale === "ar" ? "اكتب رسالة" : "Ask anything")}
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
						onClick={(event) => {
							// onStop can turn this button into a submit control before click activation ends.
							event.preventDefault();
							onStop?.();
						}}
						className="ts-chat__send"
					>
						<svg aria-hidden="true" viewBox="0 0 12 12" fill="currentColor">
							<rect x="2" y="2" width="8" height="8" rx="1.5" />
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
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M12 19V5M5 12l7-7 7 7" />
						</svg>
					</Button>
				)}
			</div>
		</form>
	);
}
