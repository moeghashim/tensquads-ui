import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "../../../../templates/app-shell/AppShell";
import { ChatPage } from "../../../../templates/chat/ChatPage";
import { Dashboard } from "../../../../templates/dashboard/Dashboard";
import { List, type ListProps } from "../../../../templates/list/List";
import { ListDetail, type ListDetailProps, type Order } from "../../../../templates/list-detail/ListDetail";
import { Settings, type SettingsProps, settingsCopy } from "../../../../templates/settings/Settings";
import { CopyCodeButton } from "../components/copy-code-button";
import { siteCopy } from "../copy";
import { getPreviewState, type Locale } from "../state";
import { isTemplate, type TemplateName, templateCopy, templatePath, templates } from "../template-catalog";
import "../../../../templates/app-shell/app-shell.css";
import "../../../../templates/chat/chat.css";
import "../../../../templates/dashboard/dashboard.css";
import "../../../../templates/list/list.css";
import "../../../../templates/list-detail/list-detail.css";
import "../../../../templates/settings/settings.css";
import "../styles/templates.css";

const sources = import.meta.glob<string>("../../../../templates/*/*.{tsx,css}", {
	query: "?raw",
	import: "default",
	eager: true,
});

export const Route = createFileRoute("/templates/$name")({
	loader: ({ params: { name } }) => {
		if (!isTemplate(name)) throw notFound();
		return { name };
	},
	component: TemplatePage,
});

function ListPreview({ locale }: { locale: Locale }) {
	const [filters, setFilters] = useState<NonNullable<ListProps["filters"]>>({ query: "", activeOnly: false });
	return <List locale={locale} filters={filters} onFiltersChange={setFilters} />;
}

function exportOrders(orders: readonly Order[], locale: Locale) {
	const rows = orders.map((order) => [order.id, order.customer[locale], order.date, order.status]);
	const csv = [["Order", "Customer", "Date", "Status"], ...rows]
		.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
		.join("\r\n");
	const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
	const link = document.createElement("a");
	link.href = url;
	link.download = "orders.csv";
	link.click();
	URL.revokeObjectURL(url);
}

function ListDetailPreview({ locale, links }: { locale: Locale; links: ListDetailProps["links"] }) {
	return (
		<ListDetail
			locale={locale}
			links={links}
			onExport={(orders) => exportOrders(orders, locale)}
			onRefundRequest={() => window.alert(locale === "ar" ? "هذا الطلب للعرض فقط." : "This is a sample order.")}
			onContact={() => window.alert(locale === "ar" ? "هذا العميل للعرض فقط." : "This is a sample customer.")}
		/>
	);
}

function SettingsPreview({ locale }: { locale: Locale }) {
	const [rules, setRules] = useState<NonNullable<SettingsProps["rules"]>>(settingsCopy[locale].rules);
	const [saved, setSaved] = useState(false);
	return (
		<Settings
			locale={locale}
			rules={rules}
			saved={saved}
			onToggleRule={(id, enabled) =>
				setRules((rules) => rules.map((rule) => (rule.id === id ? { ...rule, enabled } : rule)))
			}
			onSave={({ name, approval, enabled }) => {
				const copy = settingsCopy[locale];
				setRules((rules) => [
					...rules,
					{ id: `local-${rules.length}`, name, enabled, detail: approval === "ask" ? copy.ask : copy.under },
				]);
				setSaved(true);
			}}
		/>
	);
}

function ChatPreview({ locale }: { locale: Locale }) {
	const [session, setSession] = useState(0);
	return <ChatPage key={session} locale={locale} onReplay={() => setSession((value) => value + 1)} />;
}

const pages = { dashboard: Dashboard, list: ListPreview, settings: SettingsPreview, chat: ChatPreview };
const destinations = {
	"app-shell": "overview",
	dashboard: "overview",
	list: "accounts",
	settings: "rules",
	chat: "chat",
} as const;

function TemplatePage() {
	const { name } = Route.useLoaderData();
	const search = Route.useSearch();
	const router = useRouter();
	const { locale } = getPreviewState(search);
	const copy = templateCopy[locale];
	const { title } = templates[name][locale];
	const path = templatePath(name);
	const file = `${path}/${templates[name].file}`;
	const styleFile = `${path}/${name}.css`;
	const source = sources[`../../../../${file}`];
	const styles = sources[`../../../../${styleFile}`];
	if (source === undefined || styles === undefined) throw new Error(`Missing source for template ${name}`);
	const href = (name: TemplateName) => router.buildLocation({ to: "/templates/$name", params: { name }, search }).href;
	const links = {
		overview: href(name === "app-shell" ? "app-shell" : "dashboard"),
		accounts: href("list"),
		rules: href("settings"),
		chat: href("chat"),
	};
	const Page = name === "app-shell" || name === "list-detail" ? null : pages[name];
	const clipboard = siteCopy[locale].getStartedPage;

	return (
		<div
			className={
				name === "list-detail"
					? "design-wrap template-preview template-preview--list-detail"
					: "design-wrap template-preview"
			}
		>
			<div className="template-preview__toolbar">
				<nav aria-label={copy.title}>
					<Link to="/templates" search={search}>
						{copy.title}
					</Link>
					<span aria-current="page">{title}</span>
				</nav>
				<section className="template-preview__tools" aria-label={copy.files}>
					<CopyCodeButton
						code={source}
						copyLabel={copy.source}
						copiedLabel={clipboard.copied}
						failedLabel={copy.copyFailed}
					/>
					<CopyCodeButton
						code={styles}
						copyLabel={copy.styles}
						copiedLabel={clipboard.copied}
						failedLabel={copy.copyFailed}
					/>
					<a href={`https://github.com/moeghashim/tensquads-ui/blob/main/${file}`}>{copy.github}</a>
				</section>
			</div>
			{name === "list-detail" ? (
				<ListDetailPreview key={locale} locale={locale} links={{ ...links, orders: href(name) }} />
			) : (
				<AppShell current={destinations[name]} locale={locale} links={links}>
					{Page && <Page key={`${name}-${locale}`} locale={locale} />}
				</AppShell>
			)}
			{name === "app-shell" && (
				<section id="detail-pages" className="template-preview__detail" aria-labelledby="detail-heading">
					<h2 id="detail-heading">{copy.detail}</h2>
					<p>{copy.detailBody}</p>
				</section>
			)}
		</div>
	);
}
