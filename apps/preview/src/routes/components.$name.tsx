import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { getRegisteredComponents, TensquadsRenderer } from "@tensquads/ui/openui";
import { useEffect, useState } from "react";
import { ApprovalCard } from "../../../../packages/ui/src/react/ApprovalCard/ApprovalCard";
import { Badge } from "../../../../packages/ui/src/react/Badge/Badge";
import { Button } from "../../../../packages/ui/src/react/Button/Button";
import { Canvas } from "../../../../packages/ui/src/react/Canvas/Canvas";
import { Card } from "../../../../packages/ui/src/react/Card/Card";
import {
	Chat,
	ChatComposer,
	ChatHeader,
	ChatLog,
	ChatStep,
	ChatUserMessage,
} from "../../../../packages/ui/src/react/Chat/Chat";
import { useChat } from "../../../../packages/ui/src/react/Chat/useChat";
import { ChatReply } from "../../../../packages/ui/src/react/ChatReply/ChatReply";
import { Chip } from "../../../../packages/ui/src/react/Chip/Chip";
import { CommandPalette } from "../../../../packages/ui/src/react/CommandPalette/CommandPalette";
import {
	DataTable,
	EntityCell,
	PersonCell,
	StackCell,
	StatusCell,
} from "../../../../packages/ui/src/react/DataTable/DataTable";
import {
	Dialog,
	DialogBackdrop,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "../../../../packages/ui/src/react/Dialog/Dialog";
import { EmptyState } from "../../../../packages/ui/src/react/EmptyState/EmptyState";
import { Field, FieldDescription, FieldError, FieldLabel } from "../../../../packages/ui/src/react/Field/Field";
import { Input } from "../../../../packages/ui/src/react/Input/Input";
import {
	Menu,
	MenuContent,
	MenuItem,
	MenuItemIcon,
	MenuSeparator,
	MenuTrigger,
} from "../../../../packages/ui/src/react/Menu/Menu";
import { Node } from "../../../../packages/ui/src/react/Node/Node";
import { OwnerMessageView } from "../../../../packages/ui/src/react/OwnerMessage/OwnerMessage";
import { PageHeader } from "../../../../packages/ui/src/react/PageHeader/PageHeader";
import {
	SegmentedControl,
	SegmentedControlIndicator,
	SegmentedControlItem,
} from "../../../../packages/ui/src/react/SegmentedControl/SegmentedControl";
import {
	Sidebar,
	SidebarAgent,
	SidebarBrand,
	SidebarItem,
	SidebarSection,
	SidebarUser,
} from "../../../../packages/ui/src/react/Sidebar/Sidebar";
import {
	Squadmate,
	squadmateCharacterName,
	squadmateStateLabel,
} from "../../../../packages/ui/src/react/Squadmate/Squadmate";
import { StatTile } from "../../../../packages/ui/src/react/StatTile/StatTile";
import { Switch, SwitchThumb } from "../../../../packages/ui/src/react/Switch/Switch";
import { ThemeToggle } from "../../../../packages/ui/src/react/ThemeToggle/ThemeToggle";
import { Toolbar, type ToolbarItem } from "../../../../packages/ui/src/react/Toolbar/Toolbar";
import {
	Tooltip,
	TooltipArrow,
	TooltipContent,
	TooltipShortcut,
	TooltipTrigger,
} from "../../../../packages/ui/src/react/Tooltip/Tooltip";
import { AGENT_ROLE_TO_SLUG, type AgentState } from "../../../../packages/ui/src/schemas";
import type { WorkflowGraph } from "../../../../packages/ui/src/schemas/workflow";
import { AGENT_LOOP_STATES, SQUADMATES } from "../../../../packages/ui/src/squadmates";
import { CopyCodeButton } from "../components/copy-code-button";
import { MarkdownDocument } from "../components/docs/markdown-document";
import { siteCopy } from "../copy";
import { getPreviewState } from "../state";

const fixtures = import.meta.glob<string>("../../../../packages/ui/src/react/*/*.fixture.*.txt", {
	eager: true,
	query: "?raw",
	import: "default",
});
const documents = import.meta.glob<string>("../../../../packages/ui/src/react/*/*.md", {
	eager: true,
	query: "?raw",
	import: "default",
});
const componentOrder = [
	...getRegisteredComponents().map(({ name }) => name),
	"OwnerMessageView",
	"Chat",
	"ChatReply",
	"Sidebar",
	"ThemeToggle",
	"Toolbar",
	"CommandPalette",
	"Node",
	"Canvas",
];

export const Route = createFileRoute("/components/$name")({ component: ComponentPage });

function ComponentPage() {
	const { name } = Route.useParams();
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const { locale, direction } = getPreviewState(search);
	const copy = siteCopy[locale].componentPage;
	const sourceName = name === "OwnerMessageView" ? "OwnerMessage" : name;
	const markdown = documents[`../../../../packages/ui/src/react/${sourceName}/${sourceName}.md`];
	const stream = fixtures[`../../../../packages/ui/src/react/${sourceName}/${sourceName}.fixture.${locale}.txt`];
	const index = componentOrder.indexOf(name);
	const previous = index > 0 ? componentOrder[index - 1] : undefined;
	const next = index >= 0 ? componentOrder[index + 1] : undefined;
	const noFixtureReason = markdown?.match(/(?:OpenUI[^.]*does not[^.]*\.|without an OpenUI definition[^.]*\.)/i)?.[0];
	if (!markdown)
		return (
			<main className="content-page">
				<h1>{name}</h1>
				<p className="intro">{copy.unavailable}</p>
			</main>
		);
	return (
		<main className="component-doc-page">
			<div className="component-doc-page__header">
				<Link className="back-link" to="/components" search={search as never}>
					{copy.backToComponents}
				</Link>
				<p className="eyebrow">{siteCopy[locale].nav.components}</p>
				<h1>{name}</h1>
			</div>
			<section className="component-doc-page__section" aria-label={copy.apiReference}>
				<MarkdownDocument
					markdown={markdown}
					labels={{
						copy: copy.copy,
						copied: copy.copied,
						copyFailed: copy.copyFailed,
						codeLabel: copy.code,
						description: copy.description,
						props: copy.props,
						usage: copy.usage,
					}}
				/>
			</section>
			<section className="component-doc-page__section" aria-labelledby="component-preview-heading">
				<h2 id="component-preview-heading">{copy.preview}</h2>
				<ComponentExample />
			</section>
			{(name === "Chat" || name === "ChatReply") && (
				<section className="component-doc-page__section" aria-labelledby="chat-action-example-heading">
					<h2 id="chat-action-example-heading">{locale === "ar" ? "مثال الإجراء" : "Action turn example"}</h2>
					<ChatActionExample locale={locale} />
				</section>
			)}
			{name !== "Sidebar" && (
				<div className="component-doc-page__section">
					<h2 id="component-fixture-heading">{copy.fixture}</h2>
					{!stream && <p>{noFixtureReason ?? copy.noFixture}</p>}
					{stream && (
						<details className="fixture-source">
							<summary>{copy.fixtureSource}</summary>
							<ExampleCodeBlock code={stream.trim()} />
						</details>
					)}
				</div>
			)}
			<nav className="component-doc-nav" aria-label={copy.pageNavigation}>
				{previous ? (
					<Link to="/components/$name" params={{ name: previous }} search={search as never} rel="prev">
						<span aria-hidden="true">{direction === "rtl" ? "→" : "←"}</span> {copy.previous}: {previous}
					</Link>
				) : (
					<span />
				)}
				{next ? (
					<Link to="/components/$name" params={{ name: next }} search={search as never} rel="next">
						{copy.next}: {next} <span aria-hidden="true">{direction === "rtl" ? "←" : "→"}</span>
					</Link>
				) : (
					<span />
				)}
			</nav>
		</main>
	);
}

function ChatActionExample({ locale }: { locale: "en" | "ar" }) {
	const ar = locale === "ar";
	const chat = useChat({
		endpoint: "mock://chat",
		locale,
		transport: async function* () {
			yield ar ? "تم تسجيل موافقتك. سأبدأ بالخطوة التالية." : "Approval recorded. I will start the next step.";
		},
	});
	return (
		<div className="component-list" data-testid="chat-action-example">
			<p>{ar ? "معاينة محلية؛ لا يتم إرسال أي طلب شبكة." : "Local mock; no network request is sent."}</p>
			{chat.turns.length === 0 && (
				<ChatReply locale={locale} reply={ar ? "الخطة جاهزة للمراجعة." : "The plan is ready for review."} />
			)}
			{chat.turns.map((turn, turnIndex) => {
				if (turn.role === "action") {
					return (
						<div className="ts-chat__user-message" key={`action:${turn.action.name}:${turn.action.summary}`}>
							{turn.action.summary}
						</div>
					);
				}
				if (turn.role === "assistant") {
					return (
						<ChatReply
							key={`assistant:${turn.content}`}
							locale={locale}
							reply={turn.content}
							locked={(blockId) => chat.locked.has(`${turnIndex}/${blockId}`)}
							onAction={(event, blockId) => chat.act(event, `${turnIndex}/${blockId}`)}
						/>
					);
				}
				return (
					<div className="ts-chat__user-message" key={`user:${turn.content}`}>
						{turn.content}
					</div>
				);
			})}
			{chat.error && <p role="status">{ar ? "تعذر إكمال الخطوة." : "The step is blocked."}</p>}
			<div className="component-example">
				<Button
					disabled={chat.busy || chat.locked.has("plan")}
					onClick={() => {
						void chat.act(
							{
								type: "Approve",
								params: {},
								humanFriendlyMessage: ar ? "الموافقة على الخطة" : "Approve plan",
								formName: "PlanCard",
							},
							"plan",
						);
					}}
				>
					{chat.locked.has("plan")
						? ar
							? "تمت الموافقة"
							: "Approved"
						: ar
							? "الموافقة على الخطة"
							: "Approve plan"}
				</Button>
				{chat.error && (
					<Button variant="ghost" onClick={() => void chat.retry()}>
						{ar ? "إعادة المحاولة" : "Retry"}
					</Button>
				)}
			</div>
		</div>
	);
}

function FormExample({ locale, stream }: { locale: "en" | "ar"; stream: string }) {
	const ar = locale === "ar";
	const chat = useChat({
		endpoint: "mock://form",
		locale,
		transport: async function* () {
			yield ar ? "تم حفظ المشروع." : "Project saved.";
		},
	});
	return (
		<div className="component-list" data-testid="form-example">
			<ChatReply
				reply={`\`\`\`openui\n${stream}\n\`\`\``}
				locale={locale}
				isStreaming={chat.busy}
				locked={(id) => chat.locked.has(id)}
				onAction={(event, id) => chat.act(event, id)}
			/>
			{chat.turns.map((turn) =>
				turn.role === "action" ? (
					<ChatUserMessage key="action" data-values={JSON.stringify(turn.action.values)}>
						{turn.action.summary}
					</ChatUserMessage>
				) : turn.role === "assistant" ? (
					<p key="reply">{turn.content}</p>
				) : null,
			)}
		</div>
	);
}

function CompaniesPreview({ locale, stream, empty }: { locale: "en" | "ar"; stream: string | null; empty: boolean }) {
	const [selectedId, setSelectedId] = useState("acme");
	const [query, setQuery] = useState(empty ? (locale === "ar" ? "شركة غير موجودة" : "Unmatched company") : "");
	const [filter, setFilter] = useState<string | null>("all");
	const ar = locale === "ar";
	const companies = [
		{
			id: "acme",
			name: "Acme Studio",
			status: "active",
			cells: {
				company: (
					<EntityCell
						initials="AC"
						name="Acme Studio"
						detail={
							ar
								? "متجر تجريبي / الوصول إلى مليون دولار من المبيعات السنوية"
								: "DS / Demo store / Reach $1M in annual sales"
						}
						tint="primary"
					/>
				),
				owner: <PersonCell name="Maya Chen" email="maya@example.com" />,
				plan: (
					<StackCell
						primary={ar ? "١٤٩ دولاراً / شهرياً" : "$149 / mo"}
						secondary={ar ? "الفوترة شهرياً" : "Billed monthly"}
					/>
				),
				status: <StatusCell label={ar ? "نشطة" : "Active"} />,
			},
		},
		{
			id: "northstar",
			name: "Northstar",
			status: "trial",
			cells: {
				company: (
					<EntityCell
						initials="NS"
						name="Northstar"
						detail={ar ? "متجر إلكتروني / ٣ أعضاء في الفريق" : "Online store / 3 team members"}
						tint="success"
					/>
				),
				owner: <PersonCell name="Omar Saleh" email="omar@example.com" />,
				plan: (
					<StackCell
						primary={ar ? "٧٩ دولاراً / شهرياً" : "$79 / mo"}
						secondary={ar ? "الفوترة شهرياً" : "Billed monthly"}
					/>
				),
				status: <StatusCell label={ar ? "تجربة" : "Trial"} />,
			},
		},
	];
	const visibleCompanies = companies.filter(
		(company) =>
			(filter === "all" || company.status === filter) &&
			company.name.toLowerCase().includes(query.trim().toLowerCase()),
	);
	const number = new Intl.NumberFormat(locale);
	return (
		<div className="gallery dashboard-component-preview component-list">
			<Card
				flush
				title={
					ar
						? `كل الشركات (${number.format(visibleCompanies.length)} من ${number.format(companies.length)})`
						: `All companies (${visibleCompanies.length} of ${companies.length})`
				}
				actions={
					<div className="ts-data-table__toolbar">
						<Input
							value={query}
							onValueChange={setQuery}
							aria-label={ar ? "البحث عن الشركات" : "Search companies"}
							placeholder={ar ? "البحث عن الشركات" : "Search companies"}
						/>
						<SegmentedControl
							aria-label={ar ? "حالة الشركة" : "Company status"}
							value={filter}
							onValueChange={setFilter}
						>
							<SegmentedControlIndicator />
							{["all", "active", "trial", "paused"].map((value, index) => (
								<SegmentedControlItem key={value} value={value}>
									{(ar ? ["الكل", "نشطة", "تجربة", "متوقفة"] : ["All", "Active", "Trial", "Paused"])[index]}
								</SegmentedControlItem>
							))}
						</SegmentedControl>
					</div>
				}
			>
				{visibleCompanies.length === 0 ? (
					<EmptyState
						title={ar ? "لا تطابق أي شركة البحث" : "No companies match"}
						description={ar ? "امسح البحث لعرض جميع الشركات." : "Clear the search to see all companies."}
						action={
							<Button
								pill
								onClick={() => {
									setQuery("");
									setFilter("all");
								}}
							>
								{ar ? "مسح البحث" : "Clear search"}
							</Button>
						}
					/>
				) : (
					<DataTable
						caption={ar ? "الشركات" : "Companies"}
						columns={[
							{ key: "company", label: ar ? "الشركة" : "Company" },
							{ key: "owner", label: ar ? "المالك" : "Owner" },
							{ key: "plan", label: ar ? "الخطة" : "Plan", align: "end" },
							{ key: "status", label: ar ? "الحالة" : "Status" },
						]}
						rows={visibleCompanies}
						selectedId={selectedId}
						onRowSelect={setSelectedId}
					/>
				)}
			</Card>
			<section className="component-list" aria-label={ar ? "عينة OpenUI" : "OpenUI fixture"}>
				<TensquadsRenderer stream={stream} locale={locale} />
			</section>
		</div>
	);
}

function ComponentExample() {
	const { name } = Route.useParams();
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const { locale } = getPreviewState(search);
	const stream = fixtures[`../../../../packages/ui/src/react/${name}/${name}.fixture.${locale}.txt`];
	if (name === "Node") return <NodePreview locale={locale} />;
	if (name === "Canvas") return <CanvasPreview locale={locale} />;
	if (name === "Sidebar") return <SidebarPreview locale={locale} />;
	if (name === "ThemeToggle") return <ThemeTogglePreview locale={locale} />;
	if (name === "Toolbar") return <ToolbarPreview locale={locale} />;
	if (name === "CommandPalette") return <CommandPalettePreview locale={locale} />;
	if (name === "DataTable" || name === "EmptyState") {
		return <CompaniesPreview key={name} locale={locale} stream={stream ?? null} empty={name === "EmptyState"} />;
	}
	if (name === "ApprovalCard") return <ApprovalCardPreview locale={locale} stream={stream ?? null} />;
	if (name === "OwnerMessageView") return <OwnerMessagePreview locale={locale} />;
	if (["Card", "PageHeader", "StatTile"].includes(name)) {
		const ar = locale === "ar";
		const tileLabels = ar
			? ["الإيرادات", "الطلبات", "التحويل", "متوسط الطلب", "الزيارات", "العملاء"]
			: ["Revenue", "Orders", "Conversion", "Avg. order", "Visits", "Customers"];
		return (
			<div className="gallery dashboard-component-preview">
				{name === "PageHeader" ? (
					<PageHeader
						headingLevel={2}
						title={ar ? "نظرة عامة" : "Overview"}
						subtitle={ar ? "ملخص نشاط المتجر خلال هذا الأسبوع" : "A summary of store activity this week"}
						actions={<Button pill>{ar ? "تصدير التقرير" : "Export report"}</Button>}
						meta={
							<>
								<Badge tone="info">{ar ? "بيانات تجريبية" : "Demo data"}</Badge>
								<span>{ar ? "٥٣ متجراً متصلاً الآن" : "53 stores online now"}</span>
							</>
						}
					/>
				) : name === "Card" ? (
					<div className="dashboard-component-preview__cards">
						<Card
							title={ar ? "الطلبات المفتوحة" : "Open orders"}
							subtitle={ar ? "خلال آخر ٧ أيام" : "Over the last 7 days"}
							count="3"
							legend={[{ label: ar ? "مكتمل" : "Complete" }, { label: ar ? "قيد الانتظار" : "Pending" }]}
							footer={ar ? "عرض كل الطلبات" : "View all orders"}
						>
							<div className="dashboard-component-preview__body">{ar ? "محتوى البطاقة" : "Card body"}</div>
						</Card>
						<Card flush title={ar ? "تفاصيل الطلبات" : "Order details"}>
							<div className="dashboard-component-preview__body">
								{ar ? "محتوى بعرض البطاقة" : "Edge-to-edge content"}
							</div>
						</Card>
						<Card variant="inset" title={ar ? "عنصر موافقة" : "Approval item"}>
							<p>{ar ? "تم تحديث تفاصيل الطلب" : "Order details were updated"}</p>
						</Card>
					</div>
				) : (
					<div className="ts-stat-grid">
						{tileLabels.map((label, index) => (
							<StatTile
								key={label}
								label={label}
								value={["$14,568", "1,284", "3.8%", "$68.40", "14,568", "936"][index] ?? "0"}
								delta={
									index % 3 === 1
										? { text: ar ? "−٢٫١٪ مقارنة بالأسبوع الماضي" : "−2.1% vs last week", tone: "negative" }
										: { text: ar ? "+١٢٪ مقارنة بالأسبوع الماضي" : "+12% vs last week", tone: "positive" }
								}
								series={index === 5 ? null : [3, 5, 4, 8, 6, 9, 7]}
							/>
						))}
					</div>
				)}
				<section className="component-list" aria-label={ar ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</div>
		);
	}
	if (name === "Form" && stream) return <FormExample locale={locale} stream={stream} />;
	if (name === "Chat") {
		const ar = locale === "ar";
		return (
			<div className="gallery chat-preview">
				<Chat className="chat-preview__surface">
					<ChatHeader locale={locale}>{ar ? "محادثة الوكيل" : "Agent chat"}</ChatHeader>
					<ChatLog>
						<ChatUserMessage>{ar ? "ساعدني في تخطيط المشروع" : "Help me plan the project"}</ChatUserMessage>
						<ChatStep
							name={ar ? "المخطط" : "Planner"}
							glyph={<span aria-hidden="true">◇</span>}
							status={ar ? "تم التوجيه" : "Routed"}
							responseId="resp_8f31"
							reply={
								<>
									<p>{ar ? "سأقسّم العمل إلى خطوات واضحة." : "I will break the work into clear steps."}</p>
									<ul>
										<li>{ar ? "تحديد الهدف" : "Define the goal"}</li>
										<li>{ar ? "ترتيب الخطوات" : "Order the steps"}</li>
									</ul>
								</>
							}
						/>
						<ChatStep name={ar ? "البحث" : "Research"} glyph={<span aria-hidden="true">⌕</span>} running />
					</ChatLog>
					<ChatComposer
						placeholder={ar ? "اكتب رسالة" : "Write a message"}
						locale={locale}
						sendLabel={ar ? "إرسال" : "Send"}
						stopLabel={ar ? "إيقاف" : "Stop"}
						onSend={() => undefined}
						attach={
							<Button variant="ghost" iconOnly aria-label={ar ? "إرفاق ملف" : "Attach file"}>
								<svg
									aria-hidden="true"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="1.7"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="m12 5-6.5 6.5a4 4 0 0 0 5.7 5.7l7.2-7.2a2.5 2.5 0 0 0-3.5-3.5l-7.1 7.1a1 1 0 0 0 1.4 1.4l6.4-6.4" />
								</svg>
							</Button>
						}
					/>
				</Chat>
			</div>
		);
	}
	if (name === "ChatReply") {
		return (
			<div className="gallery">
				<p className="eyebrow">{locale === "ar" ? "معاينة المكوّن" : "Component preview"}</p>
				<section className="component-list" aria-label={locale === "ar" ? "معاينة الرد" : "Chat reply preview"}>
					{stream && <ChatReply reply={stream} locale={locale} />}
				</section>
				{stream && <ExampleCodeBlock code={stream.trim()} />}
			</div>
		);
	}
	if (name === "Dialog") {
		const ar = locale === "ar";
		const copy = ar
			? {
					back: "العودة إلى المعرض",
					eyebrow: "معاينة المكوّن",
					simple: "حوار بسيط",
					open: "فتح الحوار",
					close: "إغلاق",
					simpleTitle: "مراجعة الطلب",
					simpleDescription: "طلب عضو جديد الانضمام إلى نورث ستار.",
					body: "راجع ملفه الشخصي قبل إضافته إلى الفريق.",
					form: "حوار مع نموذج",
					formOpen: "تعديل المشروع",
					formTitle: "تعديل المشروع",
					formDescription: "حدّث اسم المشروع ووصفه.",
					name: "اسم المشروع",
					nameValue: "نورث ستار",
					save: "حفظ التغييرات",
					cancel: "إلغاء",
					destructive: "إجراء تدميري",
					deleteOpen: "حذف المشروع",
					deleteTitle: "حذف المشروع؟",
					deleteDescription: "سيؤدي هذا إلى إزالة المشروع نهائياً.",
					deleteBody: "لا يمكن التراجع عن هذا الإجراء.",
					delete: "حذف المشروع",
				}
			: {
					back: "Back to gallery",
					eyebrow: "Component preview",
					simple: "Simple dialog",
					open: "Open dialog",
					close: "Close",
					simpleTitle: "Review request",
					simpleDescription: "A new member asked to join Northstar.",
					body: "Review their profile before adding them to the squad.",
					form: "Dialog with form",
					formOpen: "Edit project",
					formTitle: "Edit project",
					formDescription: "Update the project name and description.",
					name: "Project name",
					nameValue: "Northstar",
					save: "Save changes",
					cancel: "Cancel",
					destructive: "Destructive action",
					deleteOpen: "Delete project",
					deleteTitle: "Delete project?",
					deleteDescription: "This will permanently remove the project.",
					deleteBody: "This action cannot be undone.",
					delete: "Delete project",
				};
		return (
			<div className="gallery dialog-preview">
				<Link className="route-example" to="/components" search={search as never}>
					{copy.back}
				</Link>
				<p className="eyebrow">{copy.eyebrow}</p>
				<section className="dialog-preview__grid" aria-label={ar ? "أمثلة الحوار" : "Dialog examples"}>
					<div className="dialog-preview__item">
						<h2>{copy.simple}</h2>
						<Dialog>
							<DialogTrigger render={<Button variant="outline" />}>{copy.open}</DialogTrigger>
							<DialogBackdrop />
							<DialogContent>
								<DialogTitle>{copy.simpleTitle}</DialogTitle>
								<DialogDescription>{copy.simpleDescription}</DialogDescription>
								<p data-slot="dialog-body">{copy.body}</p>
								<div data-slot="dialog-actions">
									<DialogClose render={<Button variant="solid" />}>{copy.close}</DialogClose>
								</div>
							</DialogContent>
						</Dialog>
						<ExampleCodeBlock
							code={`<Dialog>
  <DialogTrigger render={<Button variant="outline" />}>${copy.open}</DialogTrigger>
  <DialogBackdrop />
  <DialogContent>
    <DialogTitle>${copy.simpleTitle}</DialogTitle>
    <DialogDescription>${copy.simpleDescription}</DialogDescription>
    <p data-slot="dialog-body">${copy.body}</p>
    <div data-slot="dialog-actions">
      <DialogClose render={<Button variant="solid" />}>${copy.close}</DialogClose>
    </div>
  </DialogContent>
</Dialog>`}
						/>
					</div>
					<div className="dialog-preview__item">
						<h2>{copy.form}</h2>
						<Dialog>
							<DialogTrigger render={<Button variant="outline" />}>{copy.formOpen}</DialogTrigger>
							<DialogBackdrop />
							<DialogContent>
								<DialogTitle>{copy.formTitle}</DialogTitle>
								<DialogDescription>{copy.formDescription}</DialogDescription>
								<form data-slot="dialog-form" onSubmit={(event) => event.preventDefault()}>
									<Field name="project-name">
										<FieldLabel>{copy.name}</FieldLabel>
										<Input defaultValue={copy.nameValue} />
									</Field>
									<div data-slot="dialog-actions">
										<DialogClose value="cancel" render={<Button variant="outline" />}>
											{copy.cancel}
										</DialogClose>
										<DialogClose value="save" render={<Button variant="solid" />}>
											{copy.save}
										</DialogClose>
									</div>
								</form>
							</DialogContent>
						</Dialog>
						<ExampleCodeBlock
							code={`<Dialog>
  <DialogTrigger render={<Button variant="outline" />}>${copy.formOpen}</DialogTrigger>
  <DialogBackdrop />
  <DialogContent>
    <DialogTitle>${copy.formTitle}</DialogTitle>
    <DialogDescription>${copy.formDescription}</DialogDescription>
    <form data-slot="dialog-form" onSubmit={(event) => event.preventDefault()}>
      <Field name="project-name">
        <FieldLabel>${copy.name}</FieldLabel>
        <Input defaultValue="${copy.nameValue}" />
      </Field>
      <div data-slot="dialog-actions">
        <DialogClose value="cancel" render={<Button variant="outline" />}>
          ${copy.cancel}
        </DialogClose>
        <DialogClose value="save" render={<Button variant="solid" />}>
          ${copy.save}
        </DialogClose>
      </div>
    </form>
  </DialogContent>
</Dialog>`}
						/>
					</div>
					<div className="dialog-preview__item">
						<h2>{copy.destructive}</h2>
						<Dialog>
							<DialogTrigger render={<Button variant="danger" />}>{copy.deleteOpen}</DialogTrigger>
							<DialogBackdrop />
							<DialogContent>
								<DialogTitle>{copy.deleteTitle}</DialogTitle>
								<DialogDescription>{copy.deleteDescription}</DialogDescription>
								<p data-slot="dialog-body">{copy.deleteBody}</p>
								<div data-slot="dialog-actions">
									<DialogClose value="cancel" render={<Button variant="outline" />}>
										{copy.cancel}
									</DialogClose>
									<DialogClose value="delete" render={<Button variant="danger" />}>
										{copy.delete}
									</DialogClose>
								</div>
							</DialogContent>
						</Dialog>
						<ExampleCodeBlock
							code={`<Dialog>
  <DialogTrigger render={<Button variant="danger" />}>${copy.deleteOpen}</DialogTrigger>
  <DialogBackdrop />
  <DialogContent>
    <DialogTitle>${copy.deleteTitle}</DialogTitle>
    <DialogDescription>${copy.deleteDescription}</DialogDescription>
    <p data-slot="dialog-body">${copy.deleteBody}</p>
    <div data-slot="dialog-actions">
      <DialogClose value="cancel" render={<Button variant="outline" />}>
        ${copy.cancel}
      </DialogClose>
      <DialogClose value="delete" render={<Button variant="danger" />}>
        ${copy.delete}
      </DialogClose>
    </div>
  </DialogContent>
</Dialog>`}
						/>
					</div>
				</section>
				<section className="component-list" aria-label={ar ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</div>
		);
	}
	if (name === "Squadmate") {
		const states: AgentState[] = ["idle", ...AGENT_LOOP_STATES.map(({ id }) => id)];
		return (
			<div className="gallery">
				<Link className="route-example" to="/components" search={search as never}>
					{locale === "ar" ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{locale === "ar" ? "معاينة المكوّن" : "Component preview"}</p>
				<section
					className="squadmate-gallery"
					aria-label={locale === "ar" ? "الزملاء وحالاتهم" : "Squadmates and states"}
				>
					{SQUADMATES.map((mate) => (
						<div className="squadmate-gallery__agent" key={mate.id}>
							<h2>{squadmateCharacterName(AGENT_ROLE_TO_SLUG[mate.id], locale)}</h2>
							<div className="squadmate-gallery__states">
								{states.map((state) => (
									<figure key={state}>
										<Squadmate agent={AGENT_ROLE_TO_SLUG[mate.id]} state={state} size={48} locale={locale} />
										<figcaption>{squadmateStateLabel(state, locale)}</figcaption>
									</figure>
								))}
							</div>
							<ExampleCodeBlock
								code={states
									.map(
										(state) =>
											`<Squadmate agent="${AGENT_ROLE_TO_SLUG[mate.id]}" state="${state}" size={48} locale="${locale}" />`,
									)
									.join("\n")}
							/>
						</div>
					))}
				</section>
				<section className="component-list" aria-label={locale === "ar" ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</div>
		);
	}
	if (name === "Input" || name === "Field") {
		const ar = locale === "ar";
		const labels = ar
			? {
					title: "حالات الإدخال",
					empty: "فارغ",
					placeholder: "عنصر نائب",
					filled: "معبأ",
					description: "وصف",
					error: "خطأ",
					disabled: "معطّل",
					readOnly: "للقراءة فقط",
					label: "اسم المشروع",
					helper: "استخدم اسماً يعرفه فريقك.",
					invalid: "هذا الحقل مطلوب.",
				}
			: {
					title: "Input states",
					empty: "Empty",
					placeholder: "Placeholder",
					filled: "Filled",
					description: "Description",
					error: "Error",
					disabled: "Disabled",
					readOnly: "Read only",
					label: "Project name",
					helper: "Use a name your team recognizes.",
					invalid: "This field is required.",
				};
		const examples = [
			{ label: labels.empty, props: {} },
			{ label: labels.placeholder, props: { placeholder: ar ? "أدخل اسماً" : "Enter a name" } },
			{ label: labels.filled, props: { defaultValue: ar ? "بنّاء" : "Northstar" } },
			{ label: labels.disabled, props: { disabled: true, defaultValue: ar ? "غير متاح" : "Unavailable" } },
			{ label: labels.readOnly, props: { readOnly: true, defaultValue: ar ? "للقراءة" : "Read only" } },
		];
		return (
			<div className="gallery input-preview">
				<Link className="route-example" to="/components" search={search as never}>
					{ar ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{ar ? "معاينة المكوّن" : "Component preview"}</p>
				<section className="input-preview__grid" aria-label={labels.title}>
					{examples.map(({ label, props }) => (
						<div className="input-preview__item" key={label}>
							{name === "Input" && <h2>{label}</h2>}
							{name === "Input" ? (
								<Input aria-label={label} {...props} />
							) : (
								<Field name={label}>
									<FieldLabel>{label}</FieldLabel>
									<Input {...props} />
								</Field>
							)}
							<ExampleCodeBlock
								code={
									name === "Input"
										? `<Input aria-label="${label}"${props.placeholder ? ` placeholder="${props.placeholder}"` : ""}${props.defaultValue ? ` defaultValue="${props.defaultValue}"` : ""}${props.disabled ? " disabled" : ""}${props.readOnly ? " readOnly" : ""} />`
										: `<Field name="${label}">\n  <FieldLabel>${label}</FieldLabel>\n  <Input${props.placeholder ? ` placeholder="${props.placeholder}"` : ""}${props.defaultValue ? ` defaultValue="${props.defaultValue}"` : ""}${props.disabled ? " disabled" : ""}${props.readOnly ? " readOnly" : ""} />\n</Field>`
								}
							/>
						</div>
					))}
					{name === "Field" && (
						<>
							<div className="input-preview__item">
								<h2>{labels.description}</h2>
								<Field name="description">
									<FieldLabel>{labels.label}</FieldLabel>
									<Input defaultValue={ar ? "بنّاء" : "Northstar"} />
									<FieldDescription>{labels.helper}</FieldDescription>
								</Field>
								<ExampleCodeBlock
									code={`<Field name="description">
  <FieldLabel>${labels.label}</FieldLabel>
  <Input defaultValue="${ar ? "بنّاء" : "Northstar"}" />
  <FieldDescription>${labels.helper}</FieldDescription>
</Field>`}
								/>
							</div>
							<div className="input-preview__item">
								<h2>{labels.error}</h2>
								<Field name="error" invalid>
									<FieldLabel>{labels.label}</FieldLabel>
									<Input aria-invalid="true" />
									<FieldError match>{labels.invalid}</FieldError>
								</Field>
								<ExampleCodeBlock
									code={`<Field name="error" invalid>
  <FieldLabel>${labels.label}</FieldLabel>
  <Input aria-invalid="true" />
  <FieldError match>${labels.invalid}</FieldError>
</Field>`}
								/>
							</div>
						</>
					)}
				</section>
				<section className="component-list" aria-label={ar ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</div>
		);
	}
	if (name === "Switch") {
		const label = locale === "ar" ? "تحديثات المنتج" : "Product updates";
		return (
			<div className="gallery component-preview">
				<Link className="route-example" to="/components" search={search as never}>
					{locale === "ar" ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{locale === "ar" ? "معاينة المكوّن" : "Component preview"}</p>
				<section
					className="component-list switch-preview"
					aria-label={locale === "ar" ? "حالات المفتاح" : "Switch states"}
				>
					<div className="switch-preview__example">
						<div className="ts-switch-field">
							<span>{label}</span>
							<Switch aria-label={label} defaultChecked>
								<SwitchThumb />
							</Switch>
						</div>
						<ExampleCodeBlock
							code={`<div className="ts-switch-field">
  <span>${label}</span>
  <Switch aria-label="${label}" defaultChecked>
    <SwitchThumb />
  </Switch>
</div>`}
						/>
					</div>
					<div className="switch-preview__example">
						<div className="ts-switch-field">
							<span>{locale === "ar" ? "الإشعارات" : "Notifications off"}</span>
							<Switch aria-label={locale === "ar" ? "الإشعارات" : "Notifications off"}>
								<SwitchThumb />
							</Switch>
						</div>
						<ExampleCodeBlock
							code={`<div className="ts-switch-field">
  <span>${locale === "ar" ? "الإشعارات" : "Notifications off"}</span>
  <Switch aria-label="${locale === "ar" ? "الإشعارات" : "Notifications off"}">
    <SwitchThumb />
  </Switch>
</div>`}
						/>
					</div>
					<div className="switch-preview__example">
						<div className="ts-switch-field">
							<span>{locale === "ar" ? "مُعطّل" : "Disabled"}</span>
							<Switch aria-label={locale === "ar" ? "مُعطّل" : "Disabled"} disabled defaultChecked>
								<SwitchThumb />
							</Switch>
						</div>
						<ExampleCodeBlock
							code={`<div className="ts-switch-field">
  <span>${locale === "ar" ? "مُعطّل" : "Disabled"}</span>
  <Switch aria-label="${locale === "ar" ? "مُعطّل" : "Disabled"}" disabled defaultChecked>
    <SwitchThumb />
  </Switch>
</div>`}
						/>
					</div>
				</section>
				<section className="component-list" aria-label={locale === "ar" ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</div>
		);
	}
	if (name === "SegmentedControl") {
		const options = locale === "ar" ? ["قائمة", "شبكة", "لوحة"] : ["List", "Grid", "Board"];
		const iconOptions = locale === "ar" ? ["تحرير", "معاينة"] : ["Edit", "Preview"];
		return (
			<div className="gallery component-preview">
				<Link className="route-example" to="/components" search={search as never}>
					{locale === "ar" ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{locale === "ar" ? "معاينة المكوّن" : "Component preview"}</p>
				<section
					className="component-list segmented-preview"
					aria-label={locale === "ar" ? "أوضاع العرض" : "View modes"}
				>
					<SegmentedControl aria-label={locale === "ar" ? "طريقة العرض" : "View"} defaultValue={options[1]}>
						<SegmentedControlIndicator />
						{options.map((option) => (
							<SegmentedControlItem value={option} key={option}>
								{option}
							</SegmentedControlItem>
						))}
					</SegmentedControl>
					<ExampleCodeBlock
						code={`<SegmentedControl aria-label="${locale === "ar" ? "طريقة العرض" : "View"}" defaultValue="${options[1]}">
  <SegmentedControlIndicator />
${options.map((option) => `  <SegmentedControlItem value="${option}">${option}</SegmentedControlItem>`).join("\n")}
</SegmentedControl>`}
					/>
					<SegmentedControl aria-label={locale === "ar" ? "تخطيط" : "Layout"} defaultValue="preview">
						<SegmentedControlIndicator />
						<SegmentedControlItem value="edit" aria-label={iconOptions[0]}>
							<span aria-hidden="true">✎</span>
						</SegmentedControlItem>
						<SegmentedControlItem value="preview" aria-label={iconOptions[1]}>
							<span aria-hidden="true">◉</span>
						</SegmentedControlItem>
					</SegmentedControl>
					<ExampleCodeBlock
						code={`<SegmentedControl aria-label="${locale === "ar" ? "تخطيط" : "Layout"}" defaultValue="preview">
  <SegmentedControlIndicator />
  <SegmentedControlItem value="edit" aria-label="${iconOptions[0]}">
    <span aria-hidden="true">✎</span>
  </SegmentedControlItem>
  <SegmentedControlItem value="preview" aria-label="${iconOptions[1]}">
    <span aria-hidden="true">◉</span>
  </SegmentedControlItem>
</SegmentedControl>`}
					/>
				</section>
				<section className="component-list" aria-label={locale === "ar" ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</div>
		);
	}
	if (name === "Button") {
		const variants = ["solid", "soft", "outline", "ghost", "danger"] as const;
		const sizes = ["sm", "md", "lg"] as const;
		return (
			<div className="gallery button-preview">
				<Link className="route-example" to="/components" search={search as never}>
					{locale === "ar" ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{locale === "ar" ? "معاينة المكوّن" : "Component preview"}</p>
				<section
					className="button-preview__grid"
					aria-label={locale === "ar" ? "أنواع الأزرار" : "Button variants and sizes"}
				>
					{variants.map((variant) => (
						<div className="button-preview__row" key={variant}>
							<h2>{variant}</h2>
							{sizes.map((size) => (
								<Button key={size} variant={variant} size={size}>
									{locale === "ar" ? "متابعة" : "Continue"}
								</Button>
							))}
							<Button variant={variant} pill>
								{locale === "ar" ? "دائري" : "Pill"}
							</Button>
							<Button variant={variant} iconOnly aria-label={locale === "ar" ? "إضافة" : "Add"}>
								<span aria-hidden="true">+</span>
							</Button>
							<Button variant={variant} disabled>
								{locale === "ar" ? "معطّل" : "Disabled"}
							</Button>
							<ExampleCodeBlock
								code={[
									...sizes.map(
										(size) =>
											`<Button variant="${variant}" size="${size}">${locale === "ar" ? "متابعة" : "Continue"}</Button>`,
									),
									`<Button variant="${variant}" pill>${locale === "ar" ? "دائري" : "Pill"}</Button>`,
									`<Button variant="${variant}" iconOnly aria-label="${locale === "ar" ? "إضافة" : "Add"}"><span aria-hidden="true">+</span></Button>`,
									`<Button variant="${variant}" disabled>${locale === "ar" ? "معطّل" : "Disabled"}</Button>`,
								].join("\n")}
							/>
						</div>
					))}
				</section>
				<section className="component-list" aria-label={locale === "ar" ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</div>
		);
	}
	if (name === "Badge") {
		const tones = ["default", "success", "warning", "danger", "info"] as const;
		const labels =
			locale === "ar"
				? { default: "مسودة", success: "مكتمل", warning: "قيد الانتظار", danger: "فشل", info: "معلومات" }
				: { default: "Draft", success: "Complete", warning: "Pending", danger: "Failed", info: "Information" };
		return (
			<div className="gallery badge-preview">
				<Link className="route-example" to="/components" search={search as never}>
					{locale === "ar" ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{locale === "ar" ? "معاينة المكوّن" : "Component preview"}</p>
				<section className="badge-preview__grid" aria-label={locale === "ar" ? "نغمات الشارة" : "Badge tones"}>
					{tones.map((tone) => (
						<div className="component-example" key={tone}>
							<Badge tone={tone}>{labels[tone]}</Badge>
							<ExampleCodeBlock code={`<Badge tone="${tone}">${labels[tone]}</Badge>`} />
						</div>
					))}
				</section>
				<section className="component-list" aria-label={locale === "ar" ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</div>
		);
	}
	if (name === "Chip") {
		return (
			<div className="gallery chip-preview">
				<Link className="route-example" to="/components" search={search as never}>
					{locale === "ar" ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{locale === "ar" ? "معاينة المكوّن" : "Component preview"}</p>
				<section className="chip-preview__grid" aria-label={locale === "ar" ? "حالات الرقاقة" : "Chip states"}>
					<h2>{locale === "ar" ? "مع أيقونة" : "With icon"}</h2>
					<Chip name="response_schema" icon={<span aria-hidden="true">◇</span>} onClick={() => undefined} />
					<Chip name="tool_search" icon={<span aria-hidden="true">⌕</span>} onClick={() => undefined} />
					<ExampleCodeBlock
						code={
							'<Chip name="response_schema" icon={<span aria-hidden="true">◇</span>} onClick={() => undefined} />\n<Chip name="tool_search" icon={<span aria-hidden="true">⌕</span>} onClick={() => undefined} />'
						}
					/>
					<h2>{locale === "ar" ? "من دون أيقونة" : "Without icon"}</h2>
					<Chip name="output_format" icon={null} onClick={() => undefined} />
					<ExampleCodeBlock code={'<Chip name="output_format" icon={null} onClick={() => undefined} />'} />
					<h2>{locale === "ar" ? "معطّل" : "Disabled"}</h2>
					<Chip name="disabled_object" icon={<span aria-hidden="true">◇</span>} disabled />
					<ExampleCodeBlock
						code={'<Chip name="disabled_object" icon={<span aria-hidden="true">◇</span>} disabled />'}
					/>
					<h2>{locale === "ar" ? "معرّف طويل" : "Long identifier"}</h2>
					<Chip
						name="this_is_a_long_object_identifier_that_stays_visible"
						icon={<span aria-hidden="true">◇</span>}
					/>
					<ExampleCodeBlock
						code={
							'<Chip name="this_is_a_long_object_identifier_that_stays_visible" icon={<span aria-hidden="true">◇</span>} />'
						}
					/>
				</section>
				<section className="component-list" aria-label={locale === "ar" ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</div>
		);
	}
	if (name === "Tooltip") {
		const ar = locale === "ar";
		const sides = [
			{ label: "top", side: "top" },
			{ label: "right", side: "end" },
			{ label: "bottom", side: "bottom" },
			{ label: "left", side: "start" },
		] as const;
		const labels = ar
			? { title: "مواضع التلميح", action: "إضافة عنصر", hint: "أنشئ عنصراً جديداً" }
			: { title: "Tooltip placements", action: "Add item", hint: "Create a new item" };
		return (
			<div className="gallery tooltip-preview">
				<Link className="route-example" to="/components" search={search as never}>
					{ar ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{ar ? "معاينة المكوّن" : "Component preview"}</p>
				<section className="tooltip-preview__grid" aria-label={labels.title}>
					{sides.map(({ label, side }) => (
						<div className="tooltip-preview__item" key={side}>
							<h2>{label}</h2>
							<Tooltip shortcut="k">
								<TooltipTrigger render={<Button iconOnly aria-label={labels.action} />}>
									<span aria-hidden="true">+</span>
								</TooltipTrigger>
								<TooltipContent side={side}>
									{labels.hint}
									<TooltipShortcut />
									<TooltipArrow />
								</TooltipContent>
							</Tooltip>
							<ExampleCodeBlock
								code={`<Tooltip shortcut="k">
  <TooltipTrigger render={<Button iconOnly aria-label="${labels.action}" />}>
    <span aria-hidden="true">+</span>
  </TooltipTrigger>
  <TooltipContent side="${side}">
    ${labels.hint}
    <TooltipShortcut />
    <TooltipArrow />
  </TooltipContent>
</Tooltip>`}
							/>
						</div>
					))}
				</section>
				<section className="component-list" aria-label={ar ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</div>
		);
	}
	if (name === "Menu") {
		const labels =
			locale === "ar"
				? {
						trigger: "إجراءات المشروع",
						open: "فتح المشروع",
						duplicate: "نسخ المشروع",
						disabled: "مشاركة",
						danger: "حذف المشروع",
					}
				: {
						trigger: "Project actions",
						open: "Open project",
						duplicate: "Duplicate",
						disabled: "Share",
						danger: "Delete project",
					};
		const icon = (kind: "open" | "duplicate" | "share" | "delete") => {
			const paths = {
				open: <path d="M3 5.5h7l2 2h9v11H3z" />,
				duplicate: (
					<>
						<rect x="7" y="7" width="13" height="13" rx="2" />
						<path d="M5 17H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1" />
					</>
				),
				share: (
					<>
						<circle cx="18" cy="5" r="2" />
						<circle cx="6" cy="12" r="2" />
						<circle cx="18" cy="19" r="2" />
						<path d="m8 11 8-5M8 13l8 5" />
					</>
				),
				delete: <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" />,
			};
			return (
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.7"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					{paths[kind]}
				</svg>
			);
		};
		const menuContentsCode = `<MenuItem value="open">
  <MenuItemIcon><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5.5h7l2 2h9v11H3z" /></svg></MenuItemIcon>
  ${labels.open}
</MenuItem>
<MenuItem value="duplicate">
  <MenuItemIcon><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="7" width="13" height="13" rx="2" /><path d="M5 17H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v1" /></svg></MenuItemIcon>
  ${labels.duplicate}
</MenuItem>
<MenuItem value="share" disabled>
  <MenuItemIcon><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="2" /><circle cx="6" cy="12" r="2" /><circle cx="18" cy="19" r="2" /><path d="m8 11 8-5M8 13l8 5" /></svg></MenuItemIcon>
  ${labels.disabled}
</MenuItem>
<MenuSeparator />
<MenuItem value="delete" destructive>
  <MenuItemIcon><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" /></svg></MenuItemIcon>
  ${labels.danger}
</MenuItem>`;
		const menuContents = (
			<>
				<MenuItem value="open">
					<MenuItemIcon>{icon("open")}</MenuItemIcon>
					{labels.open}
				</MenuItem>
				<MenuItem value="duplicate">
					<MenuItemIcon>{icon("duplicate")}</MenuItemIcon>
					{labels.duplicate}
				</MenuItem>
				<MenuItem value="share" disabled>
					<MenuItemIcon>{icon("share")}</MenuItemIcon>
					{labels.disabled}
				</MenuItem>
				<MenuSeparator />
				<MenuItem value="delete" destructive>
					<MenuItemIcon>{icon("delete")}</MenuItemIcon>
					{labels.danger}
				</MenuItem>
			</>
		);
		return (
			<div className="gallery menu-preview">
				<Link className="route-example" to="/components" search={search as never}>
					{locale === "ar" ? "العودة إلى المعرض" : "Back to gallery"}
				</Link>
				<p className="eyebrow">{locale === "ar" ? "معاينة المكوّن" : "Component preview"}</p>
				<section className="menu-preview__examples" aria-label={locale === "ar" ? "حالات القائمة" : "Menu states"}>
					<div>
						<h2>{locale === "ar" ? "مغلق" : "Closed"}</h2>
						<Menu onAction={() => undefined}>
							<MenuTrigger>{labels.trigger}</MenuTrigger>
							<MenuContent side="bottom" align="start">
								{menuContents}
							</MenuContent>
						</Menu>
						<ExampleCodeBlock
							code={`<Menu onAction={() => undefined}>
  <MenuTrigger>${labels.trigger}</MenuTrigger>
  <MenuContent side="bottom" align="start">
${menuContentsCode}
  </MenuContent>
</Menu>`}
						/>
					</div>
					<div>
						<h2>{locale === "ar" ? "مفتوح" : "Open"}</h2>
						<Menu defaultOpen onAction={() => undefined}>
							<MenuTrigger>{labels.trigger}</MenuTrigger>
							<MenuContent side="bottom" align="start">
								{menuContents}
							</MenuContent>
						</Menu>
						<ExampleCodeBlock
							code={`<Menu defaultOpen onAction={() => undefined}>
  <MenuTrigger>${labels.trigger}</MenuTrigger>
  <MenuContent side="bottom" align="start">
${menuContentsCode}
  </MenuContent>
</Menu>`}
						/>
					</div>
				</section>
				<section className="component-list" aria-label={locale === "ar" ? "عينة OpenUI" : "OpenUI fixture"}>
					<TensquadsRenderer stream={stream ?? null} locale={locale} />
				</section>
			</div>
		);
	}
	return (
		<div className="gallery">
			{!(["BarChart", "Bars", "Distribution"] as string[]).includes(name) && (
				<Link to="/components" search={search as never}>
					Back to gallery
				</Link>
			)}
			<p className="eyebrow">Component preview</p>
			<section className="component-list" aria-label={locale === "ar" ? "عينة OpenUI" : "OpenUI fixture"}>
				{stream ? (
					<TensquadsRenderer stream={stream} locale={locale} />
				) : (
					<p className="empty-state">No {locale} OpenUI fixture is registered for this component.</p>
				)}
			</section>
		</div>
	);
}

function NodePreview({ locale }: { locale: "en" | "ar" }) {
	const labels =
		locale === "ar"
			? [
					"وكيل",
					"تصنيف",
					"إذا / وإلا",
					"أثناء",
					"موافقة المستخدم",
					"البداية",
					"النهاية",
					"ملاحظة",
					"البحث عن الملفات",
					"ضوابط الحماية",
					"MCP",
					"تحويل",
					"تعيين الحالة",
				]
			: [
					"Agent",
					"Classify",
					"If/else",
					"While",
					"User approval",
					"Start",
					"End",
					"Note",
					"File search",
					"Guardrails",
					"MCP",
					"Transform",
					"Set state",
				];
	const kinds = [
		"agent",
		"classify",
		"if-else",
		"while",
		"user-approval",
		"start",
		"end",
		"note",
		"file-search",
		"guardrails",
		"mcp",
		"transform",
		"set-state",
	] as const;
	return (
		<div className="node-preview">
			<div className="node-preview__grid">
				{kinds.map((kind, index) => (
					<Node
						key={kind}
						kind={kind}
						title={labels[index]!}
						meta={locale === "ar" ? "خطوة سير العمل" : "Workflow step"}
					/>
				))}
			</div>
			<div className="node-preview__branches">
				<Node
					kind="if-else"
					title={locale === "ar" ? "هل الطلب متاح؟" : "Is the order available?"}
					meta={locale === "ar" ? "شرطان" : "Two conditions"}
					branches={locale === "ar" ? ["متاح", "طلب مسبق", "وإلا"] : ["In stock", "Preorder", "Else"]}
					selected
				/>
				<Node
					kind="guardrails"
					title={locale === "ar" ? "فحص السياسات" : "Check policies"}
					meta={locale === "ar" ? "فحصان" : "Two checks"}
					branches={locale === "ar" ? ["اجتياز", "إخفاق"] : ["Pass", "Fail"]}
				/>
			</div>
		</div>
	);
}

function CanvasPreview({ locale }: { locale: "en" | "ar" }) {
	const ar = locale === "ar";
	const [mode, setMode] = useState<"select" | "pan">("select");
	const graph: WorkflowGraph = {
		nodes: [
			{ id: "start", kind: "start", title: ar ? "البداية" : "Start", position: { x: 40, y: 110 } },
			{
				id: "classify",
				kind: "classify",
				title: ar ? "تصنيف الطلب" : "Classify request",
				meta: ar ? "ثلاثة مسارات" : "Three paths",
				branches: ar ? ["استرداد", "استفسار", "أخرى"] : ["Refund", "Question", "Other"],
				position: { x: 260, y: 80 },
			},
			{
				id: "refund",
				kind: "agent",
				title: ar ? "وكيل الاسترداد" : "Refund agent",
				meta: ar ? "وكيل" : "Agent",
				position: { x: 520, y: 20 },
			},
			{
				id: "question",
				kind: "agent",
				title: ar ? "وكيل الدعم" : "Support agent",
				meta: ar ? "وكيل" : "Agent",
				position: { x: 520, y: 160 },
			},
			{
				id: "other",
				kind: "agent",
				title: ar ? "وكيل الطلبات" : "Orders agent",
				meta: ar ? "وكيل" : "Agent",
				position: { x: 520, y: 300 },
			},
			{
				id: "approval",
				kind: "user-approval",
				title: ar ? "موافقة المستخدم" : "User approval",
				meta: ar ? "قبل الاسترداد" : "Before refund",
				position: { x: 780, y: 100 },
			},
			{ id: "end", kind: "end", title: ar ? "النهاية" : "End", position: { x: 1020, y: 160 } },
			{ id: "note", kind: "note", title: ar ? "ملاحظة" : "Note", position: { x: 760, y: 330 } },
		],
		edges: [
			{ id: "start-classify", from: "start", to: "classify" },
			{ id: "classify-refund", from: "classify", fromPort: 0, to: "refund" },
			{ id: "classify-question", from: "classify", fromPort: 1, to: "question" },
			{ id: "classify-other", from: "classify", fromPort: 2, to: "other" },
			{ id: "refund-approval", from: "refund", to: "approval" },
			{ id: "question-end", from: "question", to: "end" },
			{ id: "other-end", from: "other", to: "end" },
			{ id: "approval-end", from: "approval", to: "end" },
		],
	};
	return (
		<section className="canvas-preview" aria-label={ar ? "مثال سير العمل" : "Workflow example"}>
			<div className="canvas-preview__surface">
				<Canvas
					graph={graph}
					locale={locale}
					label={ar ? "منشئ سير العمل" : "Workflow builder"}
					mode={mode}
					defaultViewport={{ x: 0, y: 0, zoom: 0.65 }}
				>
					<div className="canvas-preview__toolbar">
						<SegmentedControl
							aria-label={ar ? "وضع اللوحة" : "Canvas mode"}
							value={mode}
							onValueChange={(value) => value && setMode(value as "select" | "pan")}
						>
							<SegmentedControlIndicator />
							<SegmentedControlItem value="select">{ar ? "تحديد" : "Select"}</SegmentedControlItem>
							<SegmentedControlItem value="pan">{ar ? "تحريك" : "Pan"}</SegmentedControlItem>
						</SegmentedControl>
					</div>
				</Canvas>
			</div>
		</section>
	);
}

function SidebarPreview({ locale }: { locale: "en" | "ar" }) {
	const ar = locale === "ar";
	const icon = (path: string) => (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.7"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d={path} />
		</svg>
	);
	return (
		<div className="sidebar-preview">
			<Sidebar label={ar ? "التنقل الجانبي" : "Main navigation"} mobileLabel={ar ? "فتح التنقل" : "Open navigation"}>
				<SidebarBrand
					icon={icon("M4 5h16v14H4z M8 9h8 M8 13h5")}
					title={ar ? "منصة الإدارة" : "Platform admin"}
					subtitle={ar ? "حساب شركتك" : "Your company account"}
				/>
				<SidebarSection label={ar ? "المساحة" : "Workspace"}>
					<SidebarItem icon={icon("M3 10.5 12 3l9 7.5v9H3z M9 19v-6h6v6")} active>
						{ar ? "نظرة عامة" : "Overview"}
					</SidebarItem>
					<SidebarItem icon={icon("M4 5h16v14H4z M8 9h8 M8 13h5")} count={8}>
						{ar ? "الشركات" : "Companies"}
					</SidebarItem>
					<SidebarItem icon={icon("M5 19V9l7-5 7 5v10 M9 19v-5h6v5")} render={<a href="#squads" />}>
						{ar ? "الفرق" : "Squads"}
					</SidebarItem>
				</SidebarSection>
				<SidebarSection label={ar ? "قريباً" : "Coming next"}>
					<SidebarItem icon={icon("M4 5h16v14H4z")} disabled>
						{ar ? "الفوترة" : "Billing"}
					</SidebarItem>
				</SidebarSection>
				<SidebarUser initials="MG" name="Moe Ghashim" userRole={ar ? "مدير المنصة" : "Platform admin"} />
			</Sidebar>
			<div className="sidebar-preview__content">
				<div className="sidebar-preview__squad">
					<SidebarAgent
						agent="petra"
						state="planning"
						name={ar ? "بترا" : "Petra"}
						roleLabel=""
						status="online"
						featured
						meta={ar ? "تدير ٥ فرق · متجر تجريبي" : "Runs 5 squads · Demo store"}
						locale={locale}
					/>
					<SidebarAgent
						agent="pisa"
						state="running"
						name={ar ? "بيزا" : "Pisa"}
						roleLabel={ar ? "الطلبات" : "Orders"}
						status="online"
						locale={locale}
					/>
					<SidebarAgent
						agent="kyoto"
						state="idle"
						name={ar ? "كيوتو" : "Kyoto"}
						roleLabel={ar ? "المخزون" : "Inventory"}
						status="idle"
						locale={locale}
					/>
				</div>
				<div className="sidebar-preview__placeholder">
					<h2>{ar ? "نظرة عامة" : "Overview"}</h2>
					<p>{ar ? "محتوى لوحة التحكم" : "Dashboard content"}</p>
				</div>
			</div>
		</div>
	);
}

function ApprovalCardPreview({ locale, stream }: { locale: "en" | "ar"; stream: string | null }) {
	const ar = locale === "ar";
	const [commands, setCommands] = useState<unknown[]>([]);
	return (
		<div className="owner-message-preview">
			<ApprovalCard
				locale={locale}
				actionLabels={{ refund: ar ? "استرداد" : "Refund" }}
				squadmates={{ "support-bot": "petra" }}
				request={{
					approvalId: "approval_42",
					action: "refund",
					content: ar ? "استرداد قيمة الطلب ١٠٤٢" : "Refund order 1042",
					contentHash: "sha256:42",
					rule: "refund_limit",
					limit: 20_000_000,
					amount: 42_000_000,
					bot: "support-bot",
					taskId: "task_42",
				}}
				onDecision={(command) => setCommands((sent) => [...sent, command])}
			/>
			<SentCommands commands={commands} locale={locale} />
			<section className="component-list" aria-label={ar ? "عينة OpenUI" : "OpenUI fixture"}>
				<TensquadsRenderer
					stream={stream}
					locale={locale}
					onAction={(event) => setCommands((sent) => [...sent, event])}
				/>
			</section>
		</div>
	);
}

function OwnerMessagePreview({ locale }: { locale: "en" | "ar" }) {
	const ar = locale === "ar";
	const [commands, setCommands] = useState<unknown[]>([]);
	const at = "2026-11-19T12:00:00.000Z";
	const messages = [
		{
			seq: 1,
			at,
			type: "reply",
			text: ar
				? "تم استلام طلبك. https://example.com/order/42"
				: "I received your request. https://example.com/order/42",
		},
		{
			seq: 2,
			at,
			type: "question",
			questionId: "question_42",
			text: ar ? "ما أولوية معالجة الطلب؟" : "Which priority should I use?",
			options: ar ? ["عادي", "عاجل"] : ["Standard", "Urgent"],
		},
		{
			seq: 3,
			at,
			type: "approval_request",
			approvalId: "approval_42",
			action: "refund",
			content: ar ? "استرداد قيمة الطلب ١٠٤٢" : "Refund order 1042",
			contentHash: "sha256:42",
			rule: "refund_limit",
			limit: 20_000_000,
			amount: 42_000_000,
			bot: "support-bot",
			taskId: "task_42",
		},
		{
			seq: 4,
			at,
			type: "result",
			taskId: "task_42",
			summary: ar ? "تم تحديث الطلب." : "The order was updated.",
			evidence: [ar ? "https://example.com/order/42" : "https://example.com/order/42"],
		},
		{
			seq: 5,
			at,
			type: "status",
			taskId: "task_42",
			bot: "inventory-bot",
			attempt: 2,
			step: ar ? "التحقق من الطلب" : "Checking the order",
			since: at,
		},
		{
			seq: 6,
			at,
			type: "action_not_confirmed",
			taskId: "task_42",
			actionId: "action_42",
			what: ar ? "لم يصل تأكيد من خدمة الطلبات." : "The order service did not confirm the action.",
		},
		{ seq: 7, at, type: "approval_decided", approvalId: "approval_42", decision: "approve" },
		{ seq: 8, at, type: "question_answered", questionId: "question_42" },
	] as const;
	return (
		<div className="owner-message-preview">
			<OwnerMessageView
				messages={messages}
				locale={locale}
				squadmates={{ "support-bot": "petra" }}
				actionLabels={{ refund: ar ? "استرداد" : "Refund" }}
				onCommand={(command) => setCommands((sent) => [...sent, command])}
			/>
			<SentCommands commands={commands} locale={locale} />
		</div>
	);
}

function SentCommands({ commands, locale }: { commands: unknown[]; locale: "en" | "ar" }) {
	return (
		<section className="sent-commands" aria-label={locale === "ar" ? "الأوامر المرسلة" : "Sent commands"}>
			<h2>{locale === "ar" ? "الأوامر المرسلة" : "Sent commands"}</h2>
			<pre>{JSON.stringify(commands, null, 2)}</pre>
		</section>
	);
}

function ExampleCodeBlock({ code }: { code: string }) {
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const { locale } = getPreviewState(search);
	const copy = siteCopy[locale].componentPage;
	return (
		<div className="copyable-code component-example-code" dir="ltr">
			<div className="copyable-code__header">
				<span>{copy.code}</span>
				<CopyCodeButton code={code} copyLabel={copy.copy} copiedLabel={copy.copied} failedLabel={copy.copyFailed} />
			</div>
			<pre>
				<code>{code}</code>
			</pre>
		</div>
	);
}

function ThemeTogglePreview({ locale }: { locale: "en" | "ar" }) {
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const navigate = useNavigate();
	const [systemDark, setSystemDark] = useState(false);
	useEffect(() => {
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const update = () => setSystemDark(media.matches);
		update();
		media.addEventListener("change", update);
		return () => media.removeEventListener("change", update);
	}, []);
	const { theme: setting } = getPreviewState(search);
	const theme = setting === "system" ? (systemDark ? "dark" : "light") : setting;
	return (
		<div className="component-list">
			<ThemeToggle
				locale={locale}
				value={theme}
				onValueChange={(next) => void navigate({ to: ".", search: { ...search, theme: next } as never })}
			/>
		</div>
	);
}

function ToolbarPreview({ locale }: { locale: "en" | "ar" }) {
	const [mode, setMode] = useState<"pan" | "select">("pan");
	const [changed, setChanged] = useState(false);
	const copy =
		locale === "ar"
			? { label: "أدوات اللوحة", pan: "تحريك اللوحة", select: "تحديد", undo: "تراجع", redo: "إعادة" }
			: { label: "Canvas tools", pan: "Pan", select: "Select", undo: "Undo", redo: "Redo" };
	const glyph = (kind: "pan" | "select" | "undo" | "redo") => {
		if (kind === "pan")
			return (
				<svg aria-hidden="true" viewBox="0 0 24 24">
					<path d="M8 11V5a1.5 1.5 0 0 1 3 0v5-7a1.5 1.5 0 0 1 3 0v7-6a1.5 1.5 0 0 1 3 0v7-4a1.5 1.5 0 0 1 3 0v8c0 4-2 7-6 7h-2c-2 0-3-1-4-3l-3-5a1.5 1.5 0 0 1 2-2l2 2" />
				</svg>
			);
		if (kind === "select")
			return (
				<svg aria-hidden="true" viewBox="0 0 24 24">
					<path d="M5 3v17l5-5 4 6 3-2-4-6h7L5 3Z" />
				</svg>
			);
		return kind === "undo" ? (
			<svg aria-hidden="true" viewBox="0 0 24 24" data-mirror="true">
				<path d="M9 14 4 9l5-5" />
				<path d="M4 9h9a6 6 0 0 1 0 12h-2" />
			</svg>
		) : (
			<svg aria-hidden="true" viewBox="0 0 24 24" data-mirror="true">
				<path d="m15 14 5-5-5-5" />
				<path d="M20 9h-9a6 6 0 0 0 0 12h2" />
			</svg>
		);
	};
	const items: ToolbarItem[] = [
		{
			type: "toggle",
			id: "pan",
			label: copy.pan,
			icon: glyph("pan"),
			pressed: mode === "pan",
			onPressedChange: (pressed) => {
				if (pressed) {
					setMode("pan");
					setChanged(true);
				}
			},
		},
		{
			type: "toggle",
			id: "select",
			label: copy.select,
			icon: glyph("select"),
			pressed: mode === "select",
			onPressedChange: (pressed) => {
				if (pressed) {
					setMode("select");
					setChanged(true);
				}
			},
		},
		{ type: "separator", id: "history" },
		{
			type: "button",
			id: "undo",
			label: copy.undo,
			icon: glyph("undo"),
			disabled: !changed,
			onClick: () => setMode("pan"),
		},
		{ type: "button", id: "redo", label: copy.redo, icon: glyph("redo"), disabled: true, onClick: () => undefined },
	];
	return (
		<div className="toolbar-preview">
			<div className="toolbar-preview__canvas" />
			<Toolbar label={copy.label} items={items} />
		</div>
	);
}

function CommandPalettePreview({ locale }: { locale: "en" | "ar" }) {
	const [open, setOpen] = useState(false);
	const ar = locale === "ar";
	const labels = ar
		? {
				placeholder: "ابحث في الأوامر…",
				empty: "لا توجد نتائج",
				navigate: "تنقّل",
				select: "اختيار",
				close: "إغلاق",
				title: "لوحة الأوامر",
			}
		: {
				placeholder: "Search commands…",
				empty: "No matches",
				navigate: "navigate",
				select: "select",
				close: "close",
				title: "Command palette",
			};
	return (
		<div className="component-list">
			<Button onClick={() => setOpen(true)}>{ar ? "افتح البحث" : "Open search"}</Button>
			<CommandPalette
				open={open}
				onOpenChange={setOpen}
				locale={locale}
				labels={labels}
				groups={[
					{
						id: "pages",
						label: ar ? "الصفحات" : "Pages",
						items: [
							{ id: "home", label: ar ? "الرئيسية" : "Home", onSelect: () => setOpen(false) },
							{ id: "components", label: ar ? "المكوّنات" : "Components", onSelect: () => setOpen(false) },
						],
					},
					{
						id: "actions",
						label: ar ? "الإجراءات" : "Actions",
						items: [
							{
								id: "theme",
								label: ar ? "تغيير السمة" : "Change theme",
								keywords: ["dark", "light"],
								hint: ["⌘", "D"],
								onSelect: () => setOpen(false),
							},
						],
					},
					{
						id: "help",
						label: ar ? "المساعدة" : "Help",
						items: [{ id: "docs", label: ar ? "التوثيق" : "Documentation", onSelect: () => setOpen(false) }],
					},
				]}
			/>
		</div>
	);
}
