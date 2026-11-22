import {
	Select,
	SelectContent,
	SelectItem,
	SelectItemIndicator,
	SelectTrigger,
	SelectValue,
} from "@ui-sdk/react/select";
import { Textarea } from "@ui-sdk/react/textarea";
import { type ComponentProps, type ReactNode, useId } from "react";
import { Icon } from "../../icons/Icon.js";
import type { IconName } from "../../icons/icons.js";
import { Button } from "../Button/Button.js";
import { Chip } from "../Chip/Chip.js";
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
					if (field.type === "select")
						return <InspectorSelect key={field.id} field={field} placeholder={copy.none} />;
					if (field.type === "connections")
						return <InspectorConnections key={field.id} field={field} placeholder={copy.none} />;
					if (field.type === "chips") {
						return (
							<div key={field.id} className="ts-inspector__chips-field">
								<div className="ts-inspector__chips-head">
									<span className="ts-inspector__label">{field.label}</span>
									{field.onAdd && (
										<IconAction label={`${copy.add} ${field.label}`} icon="plus" onPress={field.onAdd} />
									)}
								</div>
								{field.items.length ? (
									<ul aria-label={field.label} className="ts-inspector__chips-list">
										{field.items.map((item) => (
											<li key={item.id}>
												{field.onRemove ? (
													<Chip
														name={item.label}
														icon={<Icon name={item.icon ?? "schema"} size={14} />}
														aria-label={`${copy.remove} ${item.label}`}
														onClick={() => field.onRemove?.(item.id)}
													/>
												) : (
													<span className="ts-inspector__static-chip">
														<Icon name={item.icon ?? "schema"} size={14} />
														<span>{item.label}</span>
													</span>
												)}
											</li>
										))}
									</ul>
								) : !field.onAdd ? (
									<span className="ts-inspector__empty">{copy.none}</span>
								) : null}
							</div>
						);
					}
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

function InspectorSelect({
	field,
	placeholder,
}: {
	field: Extract<InspectorField, { type: "select" }>;
	placeholder: string;
}) {
	return (
		<Field className="ts-inspector__row ts-inspector__select-row">
			<FieldLabel className="ts-inspector__label">{field.label}</FieldLabel>
			<Select
				items={[...field.options]}
				value={field.value}
				onValueChange={(value) => {
					if (typeof value === "string") field.onValueChange(value);
				}}
			>
				<SelectTrigger className="ts-inspector__select-trigger">
					<SelectValue placeholder={placeholder} />
					<Icon name="updown" size={14} />
				</SelectTrigger>
				<InspectorSelectContent items={field.options} />
			</Select>
		</Field>
	);
}

function InspectorConnections({
	field,
	placeholder,
}: {
	field: Extract<InspectorField, { type: "connections" }>;
	placeholder: string;
}) {
	const items = field.targets.map((target) => ({ value: target.id, label: target.title }));
	return (
		<Field className="ts-inspector__row ts-inspector__select-row">
			<FieldLabel className="ts-inspector__label">{field.label}</FieldLabel>
			<Select
				items={items}
				value={[...field.value]}
				multiple
				disabled={items.length === 0}
				onValueChange={(value) => {
					const ordered = field.targets.map((target) => target.id).filter((id) => value.includes(id));
					field.value
						.filter((id) => !field.targets.some((target) => target.id === id) && value.includes(id))
						.forEach((id) => {
							ordered.push(id);
						});
					field.onValueChange(ordered);
				}}
			>
				<SelectTrigger className="ts-inspector__select-trigger">
					<SelectValue placeholder={placeholder} maxLabels={1} getMoreLabel={(count) => `, +${count}`} />{" "}
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
