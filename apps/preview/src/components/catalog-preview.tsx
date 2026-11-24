import { TensquadsRenderer } from "@tensquads/ui/openui";
import {
	Badge,
	BarChart,
	Bars,
	Button,
	Canvas,
	Card,
	Chat,
	ChatAssistantMessage,
	ChatReply,
	ChatUserMessage,
	DataTable,
	Distribution,
	Form,
	Input,
	Inspector,
	Node,
	OwnerMessageView,
	PageHeader,
	Palette,
	Sidebar,
	SidebarItem,
	StatTile,
	Switch,
	SwitchThumb,
	ThemeToggle,
	Toolbar,
} from "@tensquads/ui/react";
import type { WorkflowGraph } from "@tensquads/ui/schemas";
import { useEffect, useRef } from "react";
import type { ComponentName } from "../catalog";
import { siteCopy } from "../copy";
import type { Direction, Locale } from "../state";

const fixtures = import.meta.glob<string>("../../../../packages/ui/src/react/*/*.fixture.*.txt", {
	eager: true,
	query: "?raw",
	import: "default",
});

export function CatalogPreview({
	name,
	locale,
	direction,
}: {
	name: ComponentName;
	locale: Locale;
	direction: Direction;
}) {
	const stage = useRef<HTMLDivElement>(null);
	const specimen = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const frame = stage.current;
		const content = specimen.current;
		if (!frame || !content) return;
		const scaleToStage = () => {
			const scale = Math.min(
				1,
				(frame.clientWidth - 24) / content.offsetWidth,
				(frame.clientHeight - 24) / content.offsetHeight,
			);
			content.style.setProperty("--specimen-scale", String(Math.max(0, scale)));
		};
		const observer = new ResizeObserver(scaleToStage);
		observer.observe(frame);
		observer.observe(content);
		scaleToStage();
		return () => observer.disconnect();
	}, []);

	return (
		<div className="component-card__stage" data-component={name} inert aria-hidden="true" ref={stage}>
			<div className="component-card__specimen" ref={specimen}>
				<Specimen name={name} locale={locale} direction={direction} />
			</div>
		</div>
	);
}

function Specimen({ name, locale, direction }: { name: ComponentName; locale: Locale; direction: Direction }) {
	const copy = siteCopy[locale].designSystem;
	const fixture = fixtures[`../../../../packages/ui/src/react/${name}/${name}.fixture.${locale}.txt`] ?? null;
	switch (name) {
		case "Button":
			return (
				<div className="catalog-sample-row">
					<TensquadsRenderer stream={fixture} locale={locale} />
					<Button variant="soft">{copy.cancel}</Button>
				</div>
			);
		case "Badge":
			return (
				<div className="catalog-sample-row">
					<Badge tone="success">{copy.ready}</Badge>
					<Badge tone="info">{siteCopy[locale].checking}</Badge>
				</div>
			);
		case "BarChart": {
			const values = [9, 13, 11, 16, 14, 20];
			return (
				<div className="catalog-chart">
					<strong>{copy.revenue}</strong>
					<BarChart
						label={copy.revenue}
						locale={locale}
						points={copy.days.map((label, index) => ({ label, value: values[index] }))}
					/>
				</div>
			);
		}
		case "Bars":
			return (
				<Bars
					caption={copy.orders}
					rows={[
						{ label: copy.store, display: "74%", value: 74 },
						{ label: copy.direct, display: "42%", value: 42 },
					]}
				/>
			);
		case "Card":
			return (
				<Card title={copy.revenue} subtitle={copy.thisWeek} count="2">
					<strong dir="ltr">$1,284</strong>
				</Card>
			);
		case "Chat":
			return (
				<Chat>
					<ChatUserMessage>{copy.summary}</ChatUserMessage>
					<ChatAssistantMessage>{copy.message}</ChatAssistantMessage>
				</Chat>
			);
		case "ChatReply":
			return (
				<ChatReply
					reply={`**${copy.summary}**\n\n${copy.message}\n\n\`\`\`openui\nroot = Badge(${JSON.stringify(copy.ready)}, "success")\n\`\`\``}
					locale={locale}
				/>
			);
		case "CommandPalette":
			return (
				<div className="catalog-command">
					<Input aria-label={copy.commandPlaceholder} placeholder={copy.commandPlaceholder} />
					<span>{siteCopy[locale].nav.components}</span>
					<span>{copy.foundations}</span>
				</div>
			);
		case "DataTable":
			return (
				<DataTable
					caption={copy.company}
					columns={[
						{ key: "company", label: copy.company },
						{ key: "plan", label: copy.plan },
					]}
					rows={[
						{ id: "acme", cells: { company: "Acme", plan: copy.growth } },
						{ id: "northstar", cells: { company: "Northstar", plan: copy.starter } },
					]}
				/>
			);
		case "Distribution":
			return (
				<Distribution
					label={copy.plan}
					locale={locale}
					parts={[
						{ label: copy.starter, value: 8 },
						{ label: copy.growth, value: 5 },
						{ label: copy.pro, value: 3 },
					]}
				/>
			);
		case "Form":
			return (
				<Form aria-label={copy.projects}>
					<Input aria-label={copy.projects} defaultValue="Acme Studio" />
					<div className="catalog-sample-row">
						<span>{siteCopy[locale].email}</span>
						<Switch aria-label={siteCopy[locale].email} defaultChecked>
							<SwitchThumb />
						</Switch>
					</div>
					<Button type="submit" size="sm">
						{copy.save}
					</Button>
				</Form>
			);
		case "Inspector":
			return (
				<Inspector
					title={copy.settings}
					description={copy.agent}
					locale={locale}
					fields={[
						{
							id: "schema",
							label: copy.schema,
							type: "chips",
							items: [{ id: "schema", label: "response_schema", icon: "schema" }],
						},
					]}
				/>
			);
		case "Canvas": {
			const graph: WorkflowGraph = {
				nodes: [
					{ id: "start", kind: "start", title: copy.start, position: { x: 12, y: 32 } },
					{ id: "review", kind: "agent", title: copy.review, position: { x: 242, y: 32 } },
				],
				edges: [{ id: "edge", from: "start", to: "review" }],
			};
			return (
				<Canvas
					graph={graph}
					label={copy.groups.workflow}
					locale={locale}
					dir={direction}
					defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
					grid
				/>
			);
		}
		case "Node":
			return <Node kind="agent" title={copy.review} meta={copy.agent} />;
		case "OwnerMessageView":
			return (
				<OwnerMessageView
					locale={locale}
					messages={[
						{
							type: "result",
							seq: 1,
							at: "2026-11-19T12:00:00.000Z",
							taskId: "demo",
							summary: copy.summary,
							evidence: [],
						},
					]}
					squadmates={{ petra: "petra" }}
				/>
			);
		case "PageHeader":
			return (
				<PageHeader
					headingLevel={2}
					title={copy.company}
					subtitle={copy.overview}
					actions={<Button size="sm">{copy.add}</Button>}
				/>
			);
		case "Palette":
			return (
				<Palette
					onInsert={() => undefined}
					label={copy.add}
					sections={[{ id: "core", label: copy.agent, items: [{ kind: "agent", label: copy.agent }] }]}
				/>
			);
		case "Sidebar":
			return (
				<Sidebar label={copy.overview}>
					<SidebarItem icon="▦" active>
						{copy.overview}
					</SidebarItem>
					<SidebarItem icon="◈">{copy.settings}</SidebarItem>
				</Sidebar>
			);
		case "StatTile":
			return (
				<StatTile
					label={copy.orders}
					value="1,284"
					delta={{ text: "+12%", tone: "positive" }}
					series={[3, 5, 4, 8, 6, 9, 7]}
				/>
			);
		case "ThemeToggle":
			return (
				<div className="catalog-sample-row">
					<ThemeToggle value="light" locale={locale} />
					<ThemeToggle value="dark" locale={locale} />
				</div>
			);
		case "Toolbar":
			return (
				<Toolbar
					label={copy.groups.app}
					items={[
						{
							type: "toggle",
							id: "select",
							label: copy.select,
							icon: <span>↖</span>,
							pressed: true,
							onPressedChange: () => undefined,
						},
						{
							type: "toggle",
							id: "pan",
							label: copy.pan,
							icon: <span>✥</span>,
							pressed: false,
							onPressedChange: () => undefined,
						},
					]}
				/>
			);
		default:
			return <TensquadsRenderer stream={fixture} locale={locale} />;
	}
}
