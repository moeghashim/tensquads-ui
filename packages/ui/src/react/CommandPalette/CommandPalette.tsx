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

function searchText(value: string) {
	return value.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase();
}

// Label matches rank above keyword matches. Zero hides the item.
function matchScore(item: { label: string; keywords?: readonly string[] }, query: string) {
	const needle = searchText(query);
	if (!needle) return 1;
	const label = searchText(item.label);
	if (label.startsWith(needle)) return 3;
	if (label.includes(needle)) return 2;
	return (item.keywords ?? []).some((text) => searchText(text).includes(needle)) ? 1 : 0;
}

// Composed commands keep their markup order, so sort them here: the best match comes first and is highlighted.
function rankGroups(groups: readonly CommandPaletteGroup[], query: string) {
	if (!searchText(query)) return groups;
	const ranked = groups.map((group, index) => {
		const items = group.items
			.map((item, order) => ({ item, order, score: matchScore(item, query) }))
			.sort((a, b) => b.score - a.score || a.order - b.order)
			.map(({ item }) => item);
		const best = Math.max(0, ...group.items.map((item) => matchScore(item, query)));
		return { group: { ...group, items }, index, best };
	});
	return ranked.sort((a, b) => b.best - a.best || a.index - b.index).map(({ group }) => group);
}

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
					filter={(item, query) => matchScore(item, query)}
					onKeyDown={(event) => {
						if (event.key === "Escape") {
							event.preventDefault();
							onOpenChange(false);
						}
					}}
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
						{rankGroups(groups, query).map((group) => {
							// A group without icons drops the icon column, so its labels align with the group label.
							const hasIcons = group.items.some((item) => item.icon);
							return (
								<CommandGroup key={group.id}>
									<CommandGroupLabel>{group.label}</CommandGroupLabel>
									{group.items.map((item) => (
										<CommandItem
											key={item.id}
											value={item.id}
											label={item.label}
											keywords={[...(item.keywords ?? [])]}
										>
											{hasIcons && (
												<span className="ts-command-palette__icon-slot">
													{item.icon && <CommandItemIcon>{item.icon}</CommandItemIcon>}
												</span>
											)}
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
							);
						})}
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
