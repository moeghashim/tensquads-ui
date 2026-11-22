import { Textarea } from "@ui-sdk/react/textarea";
import { type ComponentProps, type ReactNode, useId } from "react";
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
	en: { duplicate: "Duplicate", delete: "Delete", more: "More", evaluate: "Evaluate" },
	ar: { duplicate: "تكرار", delete: "حذف", more: "المزيد", evaluate: "تقييم" },
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
			{footerContent !== null && <footer className="ts-inspector__footer">{footerContent}</footer>}
		</section>
	);
}

function IconAction({ label, icon, onPress }: Pick<InspectorAction, "label" | "icon" | "onPress">) {
	return (
		<Tooltip type="label">
			<Button
				className="ts-inspector__icon-button"
				variant="ghost"
				size="sm"
				iconOnly
				aria-label={label}
				onClick={onPress}
				render={<TooltipTrigger />}
			>
				<Icon name={icon} />
			</Button>
			<TooltipContent>{label}</TooltipContent>
		</Tooltip>
	);
}
