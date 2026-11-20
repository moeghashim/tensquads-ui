import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandGroupLabel,
	CommandInput,
	CommandItem,
	CommandItemIcon,
	CommandList,
} from "@ui-sdk/react/command";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "../../schemas/index.js";
import { Dialog, DialogBackdrop, DialogContent, DialogTitle } from "../Dialog/Dialog.js";

export type CommandPaletteItem = {
	id: string;
	label: string;
	keywords?: readonly string[];
	icon?: React.ReactNode;
	hint?: readonly string[];
	onSelect: () => void;
};

export type CommandPaletteGroup = { id: string; label: string; items: readonly CommandPaletteItem[] };
export type CommandPaletteLabels = {
	placeholder: string;
	empty: string;
	navigate: string;
	select: string;
	close: string;
	title: string;
};
export type CommandPaletteProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	groups: readonly CommandPaletteGroup[];
	locale?: Locale;
	labels: CommandPaletteLabels;
	className?: string;
};

export function CommandPalette({ open, onOpenChange, groups, locale = "en", labels, className }: CommandPaletteProps) {
	const [query, setQuery] = useState("");
	const openRef = useRef(open);
	const returnFocus = useRef<HTMLElement | null>(null);
	openRef.current = open;
	useEffect(() => {
		if (open) setQuery("");
	}, [open]);
	useEffect(() => {
		const rememberFocus = () => {
			if (!openRef.current && document.activeElement instanceof HTMLElement)
				returnFocus.current = document.activeElement;
		};
		rememberFocus();
		document.addEventListener("focusin", rememberFocus);
		return () => document.removeEventListener("focusin", rememberFocus);
	}, []);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogBackdrop className="ts-command-palette__backdrop" />
			<DialogContent
				finalFocus={() => returnFocus.current}
				className={["ts-command-palette", className].filter(Boolean).join(" ")}
			>
				<DialogTitle className="ts-command-palette__title">{labels.title}</DialogTitle>
				<Command
					query={query}
					onQueryChange={setQuery}
					filter="contains"
					loop
					dir={locale === "ar" ? "rtl" : "ltr"}
					onAction={(id) => {
						groups
							.flatMap((group) => group.items)
							.find((item) => item.id === id)
							?.onSelect();
						onOpenChange(false);
					}}
				>
					<div className="ts-command-palette__search">
						<svg aria-hidden="true" viewBox="0 0 24 24">
							<circle cx="10.8" cy="10.8" r="6.8" />
							<path d="m16 16 5 5" />
						</svg>
						<CommandInput aria-label={labels.placeholder} placeholder={labels.placeholder} />
						<kbd>esc</kbd>
					</div>
					<CommandEmpty>{labels.empty}</CommandEmpty>
					<CommandList className="ts-command-palette__list">
						{groups.map((group) => (
							<CommandGroup key={group.id}>
								<CommandGroupLabel>{group.label}</CommandGroupLabel>
								{group.items.map((item) => (
									<CommandItem
										key={item.id}
										value={item.id}
										label={item.label}
										keywords={[...(item.keywords ?? [])]}
									>
										<span className="ts-command-palette__icon-slot">
											{item.icon && <CommandItemIcon>{item.icon}</CommandItemIcon>}
										</span>
										<span className="ts-command-palette__item-label">{item.label}</span>
										{item.hint && (
											<span className="ts-command-palette__hint">
												{item.hint.map((key) => (
													<kbd key={key}>{key}</kbd>
												))}
											</span>
										)}
									</CommandItem>
								))}
							</CommandGroup>
						))}
					</CommandList>
					<div className="ts-command-palette__footer">
						<span>
							<kbd>↑↓</kbd> {labels.navigate}
						</span>
						<span>
							<kbd>↵</kbd> {labels.select}
						</span>
						<span>
							<kbd>esc</kbd> {labels.close}
						</span>
					</div>
				</Command>
			</DialogContent>
		</Dialog>
	);
}

export function useCommandPaletteShortcut(onOpen: () => void) {
	useEffect(() => {
		const apple = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.isComposing || event.key.toLowerCase() !== "k") return;
			if (apple ? event.metaKey : event.ctrlKey) {
				event.preventDefault();
				onOpen();
			}
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [onOpen]);
}
