import {
	Badge,
	Button,
	Card,
	EmptyState,
	Field,
	FieldLabel,
	Form,
	Input,
	PageHeader,
	SegmentedControl,
	SegmentedControlIndicator,
	SegmentedControlItem,
	Switch,
	SwitchThumb,
} from "@tensquads/ui/react";
import type { Locale } from "@tensquads/ui/schemas";

type Rule = { id: string; name: string; detail: string; enabled: boolean };

export const settingsCopy = {
	en: {
		title: "Rules",
		subtitle: "Decide what your squad can do and when it should ask you.",
		existing: "Rulebook",
		empty: "No rules yet",
		emptyDetail: "Add your first rule using the form below.",
		rules: [
			{ id: "refund", name: "Refund requests", detail: "Kyoto handles refunds within your limit.", enabled: true },
			{
				id: "tracking",
				name: "Order tracking",
				detail: "Pisa updates tracking when an order ships.",
				enabled: true,
			},
			{ id: "stock", name: "Low stock", detail: "Giza drafts a reorder when stock runs low.", enabled: false },
		],
		create: "New rule",
		createDetail: "Choose how this rule handles approval.",
		name: "Rule name",
		approval: "Approval mode",
		ask: "Ask first",
		under: "Within limit",
		enable: "Enable this rule",
		save: "Save rule",
		saved: "Rule saved",
		limits: "Limits",
		limitsDetail: "Maximum amounts the squad can use without approval.",
		refund: "Refund per order",
		adSpend: "Daily ad spend",
		reorder: "Stock reorder",
	},
	ar: {
		title: "القواعد",
		subtitle: "حدّد ما يمكن لفريقك تنفيذه ومتى يحتاج إلى موافقتك.",
		existing: "سجل القواعد",
		empty: "لا توجد قواعد بعد",
		emptyDetail: "أضف قاعدتك الأولى باستخدام النموذج أدناه.",
		rules: [
			{
				id: "refund",
				name: "طلبات الاسترداد",
				detail: "يتولى كيوتو طلبات الاسترداد ضمن الحد المحدد.",
				enabled: true,
			},
			{ id: "tracking", name: "تتبّع الطلبات", detail: "يحدّث بيزا بيانات التتبع عند شحن الطلب.", enabled: true },
			{ id: "stock", name: "انخفاض المخزون", detail: "يعدّ الجيزة طلب توريد عندما ينخفض المخزون.", enabled: false },
		],
		create: "قاعدة جديدة",
		createDetail: "اختر متى تتطلب هذه القاعدة موافقتك.",
		name: "اسم القاعدة",
		approval: "طريقة الموافقة",
		ask: "طلب الموافقة أولاً",
		under: "ضمن الحد",
		enable: "تفعيل القاعدة",
		save: "حفظ القاعدة",
		saved: "تم حفظ القاعدة",
		limits: "الحدود",
		limitsDetail: "أقصى مبالغ يمكن للفريق استخدامها دون موافقة.",
		refund: "الاسترداد لكل طلب",
		adSpend: "الإنفاق اليومي على الإعلانات",
		reorder: "إعادة طلب المخزون",
	},
};

export type SettingsProps = {
	locale?: Locale;
	copy?: typeof settingsCopy.en;
	rules?: Rule[];
	saved?: boolean;
	onToggleRule?: (id: string, enabled: boolean) => void;
	onSave?: (rule: { name: string; approval: string; enabled: boolean }) => void;
};

export function Settings({
	locale = "en",
	copy = settingsCopy[locale],
	rules = copy.rules,
	saved = false,
	onToggleRule,
	onSave,
}: SettingsProps) {
	const numberLocale = locale === "ar" ? "ar-EG-u-nu-arab" : "en-US";
	const money = new Intl.NumberFormat(numberLocale, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
	return (
		<section className="template-settings">
			<PageHeader title={copy.title} subtitle={copy.subtitle} />
			<Card title={copy.existing} count={new Intl.NumberFormat(numberLocale).format(rules.length)}>
				{rules.length ? (
					<ul className="template-settings__rules">
						{rules.map(({ id, name, detail, enabled }) => (
							<li key={id}>
								<div>
									<strong>{name}</strong>
									<p>{detail}</p>
								</div>
								<Switch
									aria-label={name}
									checked={onToggleRule ? enabled : undefined}
									defaultChecked={onToggleRule ? undefined : enabled}
									onCheckedChange={(checked) => onToggleRule?.(id, checked)}
								>
									<SwitchThumb />
								</Switch>
							</li>
						))}
					</ul>
				) : (
					<EmptyState title={copy.empty} description={copy.emptyDetail} />
				)}
			</Card>
			<div className="template-settings__grid">
				<Card title={copy.create} subtitle={copy.createDetail}>
					<Form
						aria-label={copy.create}
						onSubmit={(event) => {
							const form = event.currentTarget;
							const data = new FormData(form);
							const name = String(data.get("name") ?? "").trim();
							if (!name || !onSave) return;
							onSave({ name, approval: String(data.get("approval") ?? "ask"), enabled: data.has("enabled") });
							form.reset();
						}}
					>
						<Field name="name">
							<FieldLabel>{copy.name}</FieldLabel>
							<Input required />
						</Field>
						<div className="template-settings__field">
							<span>{copy.approval}</span>
							<SegmentedControl name="approval" aria-label={copy.approval} defaultValue="ask">
								<SegmentedControlIndicator />
								<SegmentedControlItem value="ask">{copy.ask}</SegmentedControlItem>
								<SegmentedControlItem value="under">{copy.under}</SegmentedControlItem>
							</SegmentedControl>
						</div>
						<div className="template-settings__field template-settings__switch">
							<span>{copy.enable}</span>
							<Switch name="enabled" aria-label={copy.enable} defaultChecked>
								<SwitchThumb />
							</Switch>
						</div>
						<div className="template-settings__save">
							<Button type="submit" disabled={!onSave}>
								{copy.save}
							</Button>
							<div role="status">{saved && <Badge tone="success">{copy.saved}</Badge>}</div>
						</div>
					</Form>
				</Card>
				<Card title={copy.limits} subtitle={copy.limitsDetail}>
					<dl className="template-settings__limits">
						{[
							[copy.refund, 50],
							[copy.adSpend, 200],
							[copy.reorder, 500],
						].map(([label, amount]) => (
							<div key={label}>
								<dt>{label}</dt>
								<dd>{money.format(Number(amount))}</dd>
							</div>
						))}
					</dl>
				</Card>
			</div>
		</section>
	);
}
