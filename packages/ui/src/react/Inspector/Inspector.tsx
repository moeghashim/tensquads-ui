import {
	Select,
	SelectContent,
	SelectItem,
	SelectItemIndicator,
	SelectTrigger,
	SelectValue,
} from "@ui-sdk/react/select";
import { Textarea } from "@ui-sdk/react/textarea";
import { type ComponentProps, type ReactNode, useEffect, useId, useRef } from "react";
import { Icon } from "../../icons/Icon.js";
import type { IconName } from "../../icons/icons.js";
import { Button } from "../Button/Button.js";
import { Field, FieldLabel } from "../Field/Field.js";
import { Input } from "../Input/Input.js";
import { Switch, SwitchThumb } from "../Switch/Switch.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../Tooltip/Tooltip.js";

export type InspectorAction = { id: string; label: string; icon: IconName; onPress: () => void };
export type InspectorField =
	| {
			type: "text";
			id: string;
			label: string;
			value: string;
			onValueChange: (value: string) => void;
			placeholder?: string;
	  }
	| { type: "switch"; id: string; label: string; checked: boolean; onCheckedChange: (checked: boolean) => void }
	| {
			type: "select";
			id: string;
			label: string;
			value: string;
			options: readonly { value: string; label: string }[];
			onValueChange: (value: string) => void;
	  }
	| {
			type: "chips";
			id: string;
			label: string;
			items: readonly { id: string; label: string; icon?: IconName }[];
			onAdd?: () => void;
			onRemove?: (id: string) => void;
	  }
	| {
			type: "connections";
			id: string;
			label: string;
			targets: readonly { id: string; title: string }[];
			value: readonly string[];
			onValueChange: (value: string[]) => void;
	  }
	| {
			type: "longtext";
			id: string;
			label: string;
			value: string;
			onValueChange: (value: string) => void;
			placeholder?: string;
			actions?: readonly InspectorAction[];
	  };
export type InspectorProps = Omit<ComponentProps<"section">, "title" | "children"> & {
	title: string;
	description: string;
	fields: readonly InspectorField[];
	onDuplicate?: () => void;
	onDelete?: () => void;
	onMore?: () => void;
	onEvaluate?: () => void;
	footer?: ReactNode;
	locale?: "en" | "ar";
};

const labels = {
	en: {
		duplicate: "Duplicate",
		delete: "Delete",
		more: "More",
		evaluate: "Evaluate",
		none: "None",
		add: "Add",
		remove: "Remove",
	},
	ar: {
		duplicate: "تكرار",
		delete: "حذف",
		more: "المزيد",
		evaluate: "تقييم",
		none: "لا شيء",
		add: "إضافة",
		remove: "إزالة",
	},
} as const;

export function Inspector({
	title,
	description,
	fields,
	onDuplicate,
	onDelete,
	onMore,
	onEvaluate,
	footer,
	locale = "en",
	className,
	...props
}: InspectorProps) {
	const titleId = useId();
	const copy = labels[locale];
	const defaultFooter =
		onMore || onEvaluate ? (
			<div className="ts-inspector__footer-actions">
				{onMore && (
					<Button className="ts-inspector__footer-button" variant="ghost" size="sm" onClick={onMore}>
						{copy.more}
						<Icon name="chevron" size={14} />
					</Button>
				)}
				{onEvaluate && (
					<Button className="ts-inspector__footer-button" variant="ghost" size="sm" onClick={onEvaluate}>
						{copy.evaluate}
						<Icon name="external" size={14} />
					</Button>
				)}
			</div>
		) : null;
	const footerContent = footer === undefined ? defaultFooter : footer;

	return (
		<section {...props} aria-labelledby={titleId} className={["ts-inspector", className].filter(Boolean).join(" ")}>
			<header className="ts-inspector__head">
				<div className="ts-inspector__heading">
					<h2 id={titleId} className="ts-inspector__title">
						{title}
					</h2>
					<p className="ts-inspector__description" title={description}>
						{description}
					</p>
				</div>
				<div className="ts-inspector__head-actions">
					{onDuplicate && <IconAction label={copy.duplicate} icon="copy" onPress={onDuplicate} />}
					{onDelete && <IconAction label={copy.delete} icon="trash" onPress={onDelete} />}
				</div>
			</header>
			<div className="ts-inspector__fields">
				{fields.map((field) => {
					if (field.type === "select") return <InspectorSelect key={field.id} field={field} none={copy.none} />;
					if (field.type === "connections")
						return <InspectorConnections key={field.id} field={field} none={copy.none} locale={locale} />;
					if (field.type === "chips") return <InspectorChips key={field.id} field={field} copy={copy} />;
					if (field.type === "text") {
						return (
							<Field key={field.id} className="ts-inspector__row">
								<FieldLabel className="ts-inspector__label">{field.label}</FieldLabel>
								<Input
									className="ts-inspector__input"
									variant="soft"
									value={field.value}
									placeholder={field.placeholder}
									onValueChange={(value) => field.onValueChange(value)}
								/>
							</Field>
						);
					}
					if (field.type === "switch") {
						return (
							<Field key={field.id} className="ts-inspector__row">
								<FieldLabel className="ts-inspector__label">{field.label}</FieldLabel>
								<Switch
									className="ts-inspector__switch"
									checked={field.checked}
									onCheckedChange={(checked) => field.onCheckedChange(checked)}
								>
									<SwitchThumb />
								</Switch>
							</Field>
						);
					}
					return (
						<Field key={field.id} className="ts-inspector__longtext">
							<div className="ts-inspector__longtext-head">
								<FieldLabel className="ts-inspector__label">{field.label}</FieldLabel>
								{field.actions?.length ? (
									<div className="ts-inspector__field-actions">
										{field.actions.map((action) => (
											<IconAction key={action.id} {...action} />
										))}
									</div>
								) : null}
							</div>
							<Textarea
								className="ts-inspector__textarea"
								autoResize
								value={field.value}
								placeholder={field.placeholder}
								onValueChange={(value) => field.onValueChange(value)}
							/>
						</Field>
					);
				})}
			</div>
			{footerContent && <footer className="ts-inspector__footer">{footerContent}</footer>}
		</section>
	);
}

function IconAction({ label, icon, onPress }: Pick<InspectorAction, "label" | "icon" | "onPress">) {
	return (
		<Tooltip type="label">
			<TooltipTrigger
				render={
					<Button
						className="ts-inspector__icon-button"
						variant="ghost"
						size="sm"
						iconOnly
						aria-label={label}
						onClick={onPress}
					/>
				}
			>
				<Icon name={icon} />
			</TooltipTrigger>
			<TooltipContent>{label}</TooltipContent>
		</Tooltip>
	);
}

type FieldOf<Type extends InspectorField["type"]> = Extract<InspectorField, { type: Type }>;

function InspectorSelect({ field, none }: { field: FieldOf<"select">; none: string }) {
	return (
		<Field className="ts-inspector__row ts-inspector__select-row">
			<FieldLabel className="ts-inspector__label">{field.label}</FieldLabel>
			<Select
				items={[...field.options]}
				value={field.value}
				placeholder={none}
				onValueChange={(value) => {
					if (typeof value === "string") field.onValueChange(value);
				}}
			>
				<SelectTrigger className="ts-inspector__select-trigger">
					<SelectValue />
					<Icon name="updown" size={14} />
				</SelectTrigger>
				<InspectorSelectContent items={field.options} />
			</Select>
		</Field>
	);
}

function InspectorConnections({
	field,
	none,
	locale,
}: {
	field: FieldOf<"connections">;
	none: string;
	locale: "en" | "ar";
}) {
	const items = field.targets.map((target) => ({ value: target.id, label: target.title }));
	const selected = items.filter((item) => field.value.includes(item.value));
	// The host may offer only some targets. The connections it does not offer stay.
	const kept = field.value.filter((id) => !items.some((item) => item.value === id));
	const comma = locale === "ar" ? "، " : ", ";
	const [first, ...rest] = selected.map((item) => item.label);
	return (
		<Field className="ts-inspector__row ts-inspector__select-row">
			<FieldLabel className="ts-inspector__label">{field.label}</FieldLabel>
			<Select
				multiple
				items={items}
				value={selected.map((item) => item.value)}
				disabled={items.length === 0}
				onValueChange={(value) => {
					const next = items.map((item) => item.value).filter((id) => value.includes(id));
					field.onValueChange([...next, ...kept]);
				}}
			>
				<SelectTrigger className="ts-inspector__select-trigger">
					<SelectValue>
						{() =>
							rest.length ? (
								<>
									<span aria-hidden="true">{`${first}${comma}+${rest.length}`}</span>
									<span className="ts-visually-hidden">{[first, ...rest].join(comma)}</span>
								</>
							) : (
								(first ?? none)
							)
						}
					</SelectValue>
					<Icon name="updown" size={14} />
				</SelectTrigger>
				<InspectorSelectContent items={items} />
			</Select>
		</Field>
	);
}

function InspectorSelectContent({ items }: { items: readonly { value: string; label: string }[] }) {
	return (
		<SelectContent className="ts-inspector__select-content">
			{items.map((item) => (
				<SelectItem key={item.value} value={item.value}>
					{item.label}
					<SelectItemIndicator>
						<Icon name="check" size={14} />
					</SelectItemIndicator>
				</SelectItem>
			))}
		</SelectContent>
	);
}

function InspectorChips({ field, copy }: { field: FieldOf<"chips">; copy: (typeof labels)[keyof typeof labels] }) {
	const root = useRef<HTMLDivElement>(null);
	const removed = useRef<{ id: string; index: number } | null>(null);
	const { items } = field;
	// A removed chip that held focus passes it to the chip that takes its place, the last chip, or the add button.
	useEffect(() => {
		const last = removed.current;
		if (!last || !root.current || items.some((item) => item.id === last.id)) return;
		removed.current = null;
		const active = root.current.ownerDocument.activeElement;
		if (active && active !== root.current.ownerDocument.body) return;
		const buttons = root.current.querySelectorAll<HTMLElement>(".ts-inspector__chip-remove");
		const next = buttons[Math.min(last.index, buttons.length - 1)];
		(next ?? root.current.querySelector<HTMLElement>(".ts-inspector__icon-button"))?.focus();
	}, [items]);
	return (
		<div ref={root} className="ts-inspector__chips">
			<div className="ts-inspector__longtext-head">
				<span className="ts-inspector__label">{field.label}</span>
				{field.onAdd ? (
					<IconAction label={`${copy.add} ${field.label}`} icon="plus" onPress={field.onAdd} />
				) : (
					items.length === 0 && <span className="ts-inspector__empty">{copy.none}</span>
				)}
			</div>
			{items.length > 0 && (
				<ul aria-label={field.label} className="ts-inspector__chips-list">
					{items.map((item, index) => (
						<li key={item.id} className="ts-inspector__chip" data-removable={field.onRemove ? "" : undefined}>
							{item.icon && <Icon name={item.icon} />}
							<span className="ts-inspector__chip-name">{item.label}</span>
							{field.onRemove && (
								<Button
									className="ts-inspector__chip-remove"
									variant="ghost"
									size="sm"
									iconOnly
									aria-label={`${copy.remove} ${item.label}`}
									onClick={() => {
										removed.current = { id: item.id, index };
										field.onRemove?.(item.id);
									}}
								>
									<Icon name="close" size={14} />
								</Button>
							)}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
