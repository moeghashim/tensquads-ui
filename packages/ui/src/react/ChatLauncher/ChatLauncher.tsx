import type { ComponentProps, ReactNode } from "react";
import type { Locale } from "../../schemas/index.js";
import { Badge } from "../Badge/Badge.js";
import { Button } from "../Button/Button.js";
import { Squadmate } from "../Squadmate/Squadmate.js";

export type ChatLauncherProps = Omit<ComponentProps<typeof Button>, "children" | "variant" | "pill" | "className"> & {
	label?: string;
	waiting?: number;
	locale?: Locale;
	children?: ReactNode;
	className?: string;
};

export function ChatLauncher({ label, waiting, locale = "en", className, children, ...props }: ChatLauncherProps) {
	const title = label ?? (locale === "ar" ? "اسأل بيترا" : "Ask Petra");
	const countLabel = locale === "ar" ? "بانتظارك" : "waiting";
	const count =
		waiting === undefined
			? undefined
			: new Intl.NumberFormat(locale === "ar" ? "ar-EG-u-nu-arab" : "en-US").format(waiting);
	return (
		<Button
			{...props}
			type={props.type ?? "button"}
			variant="solid"
			pill
			className={["ts-chat-launcher", className].filter(Boolean).join(" ")}
		>
			<span className="ts-chat-launcher__avatar" aria-hidden="true">
				<Squadmate agent="petra" state="idle" size={32} locale={locale} />
			</span>
			<span className="ts-chat-launcher__label">{children ?? title}</span>
			{waiting !== undefined && waiting > 0 && (
				<Badge className="ts-chat-launcher__count" tone="danger" aria-hidden="true">
					{count}
				</Badge>
			)}
			{waiting !== undefined && waiting > 0 && (
				<span className="ts-visually-hidden">
					{locale === "ar" ? "، " : ", "}
					{count} {countLabel}
				</span>
			)}
		</Button>
	);
}
