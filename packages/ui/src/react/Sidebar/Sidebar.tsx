import { Button as UiButton } from "@ui-sdk/react/button";
import { type ComponentProps, createContext, type ReactNode, useContext, useState } from "react";
import type { AgentSlug, AgentState, Locale } from "../../schemas/index.js";
import { Badge } from "../Badge/Badge.js";
import { Dialog, DialogBackdrop, DialogContent, DialogTitle } from "../Dialog/Dialog.js";
import { Squadmate } from "../Squadmate/Squadmate.js";

export type SidebarProps = {
	children: ReactNode;
	label: string;
	mobileLabel?: string;
	className?: string;
};

const SidebarCloseContext = createContext<() => void>(() => undefined);

export function Sidebar({ children, label, mobileLabel = "Open navigation", className }: SidebarProps) {
	const [open, setOpen] = useState(false);
	const nav = (mobile = false) => (
		<SidebarCloseContext.Provider value={mobile ? () => setOpen(false) : () => undefined}>
			<nav
				aria-label={label}
				className={["ts-sidebar", mobile && "ts-sidebar--sheet", className].filter(Boolean).join(" ")}
			>
				{children}
			</nav>
		</SidebarCloseContext.Provider>
	);
	return (
		<div className="ts-sidebar-shell">
			<div className="ts-sidebar-mobile-bar">
				<button className="ts-sidebar-menu" type="button" aria-label={mobileLabel} onClick={() => setOpen(true)}>
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.7"
						strokeLinecap="round"
					>
						<path d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>
				<span>{label}</span>
			</div>
			{nav()}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogBackdrop className="ts-sidebar-backdrop" />
				<DialogContent className="ts-sidebar-dialog">
					<DialogTitle className="ts-sidebar-dialog-title">{label}</DialogTitle>
					{nav(true)}
				</DialogContent>
			</Dialog>
		</div>
	);
}

export type SidebarBrandProps = { icon: ReactNode; title: string; subtitle: string };
export function SidebarBrand({ icon, title, subtitle }: SidebarBrandProps) {
	return (
		<div className="ts-sidebar-brand">
			<span className="ts-sidebar-brand-icon" aria-hidden="true">
				{icon}
			</span>
			<span className="ts-sidebar-brand-copy">
				<strong>{title}</strong>
				<span>{subtitle}</span>
			</span>
		</div>
	);
}

export type SidebarItemProps = Omit<ComponentProps<typeof UiButton>, "render" | "children"> & {
	children: ReactNode;
	icon: ReactNode;
	active?: boolean;
	count?: string | number;
	render?: ComponentProps<typeof UiButton>["render"];
	current?: boolean;
};
export function SidebarItem({
	children,
	icon,
	active = false,
	current = active,
	count,
	render,
	disabled,
	...props
}: SidebarItemProps) {
	const closeSheet = useContext(SidebarCloseContext);
	if (disabled) {
		return (
			<div className="ts-sidebar-item ts-sidebar-item--disabled" aria-disabled="true">
				<span className="ts-sidebar-item-icon" aria-hidden="true">
					{icon}
				</span>
				<span>{children}</span>
			</div>
		);
	}
	return (
		<UiButton
			{...props}
			onClick={(...args) => {
				props.onClick?.(...args);
				closeSheet();
			}}
			render={render}
			aria-current={current ? "page" : undefined}
			className={["ts-sidebar-item", active && "is-active", props.className].filter(Boolean).join(" ")}
		>
			<span className="ts-sidebar-item-icon" aria-hidden="true">
				{icon}
			</span>
			<span className="ts-sidebar-item-label">{children}</span>
			{count !== undefined && (
				<Badge className="ts-sidebar-count" tone="danger">
					{count}
				</Badge>
			)}
		</UiButton>
	);
}

export type SidebarSectionProps = { label: string; children: ReactNode };
export function SidebarSection({ label, children }: SidebarSectionProps) {
	return (
		<section className="ts-sidebar-section">
			<h2>{label}</h2>
			<div>{children}</div>
		</section>
	);
}

export type SidebarUserProps = { initials: string; name: string; userRole: string };
export function SidebarUser({ initials, name, userRole }: SidebarUserProps) {
	return (
		<div className="ts-sidebar-user">
			<span className="ts-sidebar-avatar" aria-hidden="true">
				{initials}
			</span>
			<span className="ts-sidebar-user-copy">
				<strong>{name}</strong>
				<span>{userRole}</span>
			</span>
		</div>
	);
}

export type SidebarAgentProps = {
	agent: AgentSlug;
	state: AgentState;
	name: string;
	roleLabel: string;
	status: "online" | "idle";
	locale?: Locale;
	featured?: boolean;
	meta?: string;
};
export function SidebarAgent({
	agent,
	state,
	name,
	roleLabel,
	status,
	locale = "en",
	featured = false,
	meta,
}: SidebarAgentProps) {
	return (
		<div className={["ts-sidebar-agent", featured && "ts-sidebar-agent--featured"].filter(Boolean).join(" ")}>
			<Squadmate agent={agent} state={state} size={featured ? 40 : 28} locale={locale} />
			<span className="ts-sidebar-agent-copy">
				<strong>{name}</strong>
				{featured ? <span>{meta}</span> : <span>{roleLabel}</span>}
			</span>
			{!featured && (
				<>
					<span className={`ts-sidebar-status ts-sidebar-status--${status}`} aria-hidden="true" />
					<span className="ts-sidebar-visually-hidden">
						{status === "online" ? (locale === "ar" ? "متصل" : "Online") : locale === "ar" ? "خامل" : "Idle"}
					</span>
				</>
			)}
		</div>
	);
}
