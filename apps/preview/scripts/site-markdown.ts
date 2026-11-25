import { readFileSync } from "node:fs";
import { squadmateCharacterName } from "../../../packages/ui/src/react/Squadmate/Squadmate";
import { AgentSlugSchema } from "../../../packages/ui/src/schemas";
import { builderCopy } from "../src/components/nodes/copy";
import { demoWorkflow, workflowIds } from "../src/components/nodes/demo-workflows";
import { catalogGroups, componentDocumentName } from "../src/catalog-groups";
import { partPages } from "../src/chat-parts";
import { siteCopy } from "../src/copy";
import { demoCopy, storeHeader } from "../src/dashboard-copy";
import arDashboard from "../src/fixtures/dashboard-data.fixture.ar.json";
import enDashboard from "../src/fixtures/dashboard-data.fixture.en.json";
import {
	installExample,
	reactExample,
	skillInstallExample,
	styleExample,
	workerExample,
} from "../src/get-started-examples";
import { markdownPath } from "../src/markdown-path";
import { mascotMotionCopy, mascotMotionPath } from "../src/mascot-motion-copy";
import {
	designGuidePath,
	foundationNames,
	liveHomepages,
	pageDesigns,
	productScreens,
	productScreenTitle,
	referenceSections,
} from "../src/reference";
import type { FileRoutesByFullPath } from "../src/routeTree.gen";
import type { Locale } from "../src/state";
import { templateCopy, templateNames, templatePath, templates } from "../src/template-catalog";
import { foundationMarkdown, mascotMotionMarkdown, mascotStates } from "./foundation-markdown";
import { blocks, code, fence, heading, item, link } from "./markdown-format";

const repo = new URL("../../../", import.meta.url);
const origin = "https://tensquads-ui-preview.mohanadgh.workers.dev";
const sourceUrl = "https://github.com/moeghashim/tensquads-ui/blob/main";
const dashboardData = { en: enDashboard, ar: arDashboard };

type Page = { path: string; title: string; description: string; body: string };
type PageGroup = { title: string; routes: (keyof FileRoutesByFullPath)[] };
type RoutePages = Record<keyof FileRoutesByFullPath, Page[]>;

function source(path: string) {
	return readFileSync(new URL(path, repo), "utf8").trim();
}

function page(path: string, title: string, description: string, content = ""): Page {
	title = title.replaceAll("\n", " ");
	return {
		path,
		title,
		description,
		body: blocks(heading(1, title), description, content),
	};
}

function componentMarkdown(name: string) {
	const sourceName = componentDocumentName(name);
	const directory = `packages/ui/src/react/${sourceName}`;
	return source(`${directory}/${sourceName}.md`).replace(/\]\((\.\.\/[^\s)]+)\)/g, (match, path: string) => {
		const crossReference = /^\.\.\/([^/]+)\/\1\.md(#[\w-]+)?$/.exec(path);
		if (crossReference) {
			const component = crossReference[1] === "OwnerMessage" ? "OwnerMessageView" : crossReference[1];
			return `](${markdownPath(`/components/${component}`)}${crossReference[2] ?? ""})`;
		}
		const url = new URL(path, `${sourceUrl}/${directory}/`);
		return url.href.startsWith(`${sourceUrl}/`) ? `](${url.href})` : match;
	});
}

function routePages(locale: Locale): RoutePages {
	const copy = siteCopy[locale];
	const design = copy.designSystem;
	const gettingStarted = copy.getStartedPage;
	const reference = copy.reference;
	const guide = design.foundationsIndex.guide;
	const componentItem = (name: keyof typeof design.componentLeads) =>
		item(name, markdownPath(`/components/${name}`, locale), design.componentLeads[name]);
	const foundations = foundationNames.map((name) => ({
		name,
		...design.foundationsIndex[name],
	}));
	const foundationLinks = (descriptions: boolean) =>
		[
			item(guide.title, markdownPath(designGuidePath, locale), descriptions ? guide.lead : undefined),
			...foundations.map(({ name, title, lead }) =>
				item(title, markdownPath(`/foundations/${name}`, locale), descriptions ? lead : undefined),
			),
		].join("\n");
	const referenceLinks = referenceSections
		.map(({ id, path }) => item(design[id], markdownPath(path, locale)))
		.join("\n");
	const screens = productScreens.map((screen) => ({
		...screen,
		title: productScreenTitle(screen, locale),
		path: `/reference/screens/${screen.id}`,
	}));
	const numbers = new Intl.NumberFormat(locale);
	const dimensions = ({ width, height }: { width: number; height: number }) =>
		reference.dimensions(numbers.format(width), numbers.format(height));
	const designs = pageDesigns.map((design) => ({
		...design,
		path: `/reference/pages/${design.id}`,
		title: reference.pageTitles[design.id],
	}));
	const componentsLead = design.uiLead;
	const templateListing = templateCopy[locale];
	const chat = copy.chat;
	const builder = builderCopy[locale];
	const workflows = workflowIds.map((id) => demoWorkflow(id, locale));
	const builderPage = (path: string, workflow: (typeof workflows)[number]) => page(
		path,
		workflow.name,
		builder.builderLead,
		blocks(
			link(builder.workflows, markdownPath("/workflows", locale)),
			heading(2, builder.guideTitle),
			builder.steps.map(([step, description, key]) => `- **${step}** · ${description} (${code(key)})`).join("\n"),
			heading(2, copy.nav.nodes),
			workflow.document.graph.nodes.map(({ title, meta }) => `- ${title}${meta ? ` · ${meta}` : ""}`).join("\n"),
			heading(2, builder.actions),
			[`- ${builder.search} ${code("⌘K")}`, `- ${builder.tidy} ${code("⌘⇧L")}`, `- ${builder.redo} ${code("⌘⇧Z")}`].join("\n"),
		),
	);
	const chatFixture = JSON.parse(source(`apps/preview/src/fixtures/chat-demo.fixture.${locale}.txt`)) as {
		request: string;
		reply: string;
	};
	const admin = demoCopy[locale];
	const store = storeHeader[locale];
	const stats = (key: "admin" | "home") =>
		dashboardData[locale].stats[key]
			.map(({ label, value, foot }) => `- **${label}** — ${value}${foot ? ` (${foot})` : ""}`)
			.join("\n");

	return {
		"/": [
			page(
				"/",
				design.title,
				design.lead,
				blocks(
					heading(2, design.install),
					fence("sh", installExample),
					heading(2, design.foundations),
					foundationLinks(false),
					heading(2, design.uiSystem),
					[
						item(design.catalog, markdownPath("/components", locale)),
						item(design.build, markdownPath("/get-started", locale)),
					].join("\n"),
					heading(2, design.reference),
					referenceLinks,
					heading(2, design.demos),
					[
						item(copy.nav.nodes, markdownPath("/nodes", locale)),
						item(copy.nav.chat, markdownPath("/chat", locale)),
						item(copy.nav.dashboards, markdownPath("/dashboards/home", locale)),
						item(design.admin, markdownPath("/dashboards/admin", locale)),
					].join("\n"),
				),
			),
		],
		"/foundations/": [
			page(
				"/foundations",
				design.foundations,
				design.foundationLead,
				blocks(foundationLinks(true), heading(2, design.reference), referenceLinks),
			),
		],
		"/foundations/$name": foundations.map(({ name, title, lead }) =>
			page(`/foundations/${name}`, title, lead, foundationMarkdown(name, locale)),
		),
		[designGuidePath]: [{ path: designGuidePath, title: guide.title, description: guide.lead, body: source("DESIGN.md") }],
		[mascotMotionPath]: [
			page(mascotMotionPath, mascotMotionCopy[locale].title, mascotMotionCopy[locale].lead, mascotMotionMarkdown(locale)),
		],
		"/components/": [
			page(
				"/components",
				copy.nav.components,
				componentsLead,
				blocks(
					...(Object.keys(catalogGroups) as (keyof typeof catalogGroups)[]).map((group) =>
						blocks(
							heading(2, design.groups[group]),
							design.groupLeads[group],
							catalogGroups[group].map(componentItem).join("\n"),
						),
					),
				),
			),
		],
		"/components/$name": Object.values(catalogGroups)
			.flat()
			.map((name) => ({
				path: `/components/${name}`,
				title: name,
				description: design.componentLeads[name],
				body: componentMarkdown(name),
			})),
		"/templates/": [
			page(
				"/templates",
				templateListing.title,
				templateListing.lead,
				templateNames.map((name) => {
					const { title, description } = templates[name][locale];
					return item(title, markdownPath(`/templates/${name}`, locale), description);
				}).join("\n"),
			),
		],
		"/templates/$name": templateNames.map((name) => {
			const path = templatePath(name);
			const file = `${path}/${templates[name].file}`;
			const styles = `${path}/${name}.css`;
			const { title, description } = templates[name][locale];
			const readme = source(`${path}/README.md`)
				.replace(/^# [^\n]+\n+/, "")
				.replace(/\]\((?!https?:|#)([^)]+)\)/g, (_, target: string) =>
					`](${new URL(target, `${sourceUrl}/${path}/`).href})`,
				);
			return page(
				`/${path}`,
				title,
				description,
				blocks(
					readme,
					item(templateListing.github, `${sourceUrl}/${file}`),
					heading(2, templates[name].file),
					fence("tsx", source(file)),
					heading(2, `${name}.css`),
					fence("css", source(styles)),
				),
			);
		}),
		"/get-started": [
			page(
				"/get-started",
				gettingStarted.title,
				gettingStarted.intro,
				blocks(
					heading(2, gettingStarted.installTitle),
					gettingStarted.installLead,
					fence("sh", installExample),
					gettingStarted.installNote,
					heading(2, gettingStarted.stylesTitle),
					gettingStarted.stylesLead,
					fence("css", styleExample),
					gettingStarted.stylesNote,
					heading(2, gettingStarted.skillsTitle),
					gettingStarted.skillsLead,
					`- ${code(".agents/skills/tensquads-ui/SKILL.md")} — ${gettingStarted.tensquadsSkill}\n- ${code(".agents/skills/ui-sdk/SKILL.md")} — ${gettingStarted.uiSdkSkill}`,
					fence("sh", skillInstallExample),
					gettingStarted.skillsNote,
					link(gettingStarted.llmsLink, `${sourceUrl}/llms.txt`),
					heading(2, gettingStarted.reactTitle),
					gettingStarted.reactLead,
					fence("tsx", reactExample),
					heading(2, gettingStarted.serverTitle),
					gettingStarted.serverLead,
					fence("ts", workerExample),
					gettingStarted.sdkNote,
					gettingStarted.serverNote,
				),
			),
		],
		"/foundations/principles": [
			page(
				"/foundations/principles",
				design.principles,
				reference.principles,
				blocks(reference.sourceLanguage, source("design/agent-ui/README.md")),
			),
		],
		"/reference/screens/": [
			page(
				"/reference/screens",
				design.screens,
				reference.screens,
				screens.map((screen) => item(screen.title, markdownPath(screen.path, locale), dimensions(screen))).join("\n"),
			),
		],
		"/reference/screens/$id": screens.map((screen) =>
			page(screen.path, screen.title, dimensions(screen), item(reference.openViewer, screen.src)),
		),
		"/reference/pages/": [
			page(
				"/reference/pages",
				design.pages,
				reference.pages,
				blocks(
					heading(2, reference.homepage),
					reference.homepageDescription,
					[item(reference.homepageEnglish, liveHomepages.en), item(reference.homepageArabic, liveHomepages.ar)].join(
						"\n",
					),
					...designs.map((design) => item(design.title, markdownPath(design.path, locale))),
				),
			),
		],
		"/reference/pages/$id": designs.map(({ path, title, src, width, height, screenshot }) =>
			page(
				path,
				title,
				design.pages,
				blocks(
					dimensions({ width, height }),
					[item(reference.openViewer, src), item(reference.desktopShot, screenshot)].join("\n"),
				),
			),
		),
		"/reference/mascot-states": [
			page(
				"/reference/mascot-states",
				design.states,
				reference.states,
				blocks(
					mascotStates(locale),
					item(design.foundationsIndex.mascots.title, markdownPath("/foundations/mascots", locale)),
					AgentSlugSchema.options.map((agent) => `- ${squadmateCharacterName(agent, locale)}`).join("\n"),
				),
			),
		],
		"/nodes/": [builderPage("/nodes", demoWorkflow("support", locale))],
		"/nodes/$id": workflows.map((workflow) => builderPage(`/nodes/${workflow.id}`, workflow)),
		"/workflows": [
			page("/workflows", builder.workflows, builder.listLead,
				workflows.map(({ id, name, meta }) => item(name, markdownPath(`/nodes/${id}`, locale), meta)).join("\n"),
			),
		],
		"/chat": [
			page(
				"/chat",
				chat.title,
				chat.intro,
				blocks(
					chat.localOnly,
					`> ${chatFixture.request}`,
					chatFixture.reply,
					heading(2, chat.sideHeading),
					...Object.entries(partPages).map(([id, names]) =>
						blocks(names.map(componentItem).join("\n"), chat.parts[id as keyof typeof partPages].detail),
					),
				),
			),
		],
		"/dashboards/home": [
			page(
				"/dashboards/home",
				store.title,
				store.lead,
				blocks(
					store.demo,
					stats("home"),
					heading(2, admin.revenueChartTitle),
					admin.lastFourteenDays,
					heading(2, admin.needsApproval),
					componentItem("ApprovalCard"),
					componentItem("ChatLauncher"),
				),
			),
		],
		"/dashboards/admin": [
			page(
				"/dashboards/admin",
				design.admin,
				admin.companiesSubtitle,
				blocks(
					store.demo,
					heading(2, admin.companies),
					stats("admin"),
					[item(admin.imagesTitle, "/dashboards/admin?view=images", admin.imagesSubtitle)].join("\n"),
					componentItem("DataTable"),
					componentItem("BarChart"),
				),
			),
		],
	};
}

const groups: PageGroup[] = [
	{ title: "Start here", routes: [designGuidePath, "/"] },
	{ title: "Foundations", routes: ["/foundations/", "/foundations/$name", mascotMotionPath] },
	{ title: "Components", routes: ["/components/", "/components/$name"] },
	{ title: "Templates", routes: ["/templates/", "/templates/$name"] },
	{ title: "Get started", routes: ["/get-started"] },
	{
		title: "Design reference",
		routes: [
			"/foundations/principles",
			"/reference/screens/",
			"/reference/screens/$id",
			"/reference/pages/",
			"/reference/pages/$id",
			"/reference/mascot-states",
		],
	},
	{
		title: "Demos",
		routes: ["/nodes/", "/workflows", "/nodes/$id", "/chat", "/dashboards/home", "/dashboards/admin"],
	},
];

export function buildMarkdown() {
	const routes = { en: routePages("en"), ar: routePages("ar") };
	const routePatterns = groups.flatMap(({ routes }) => routes);
	for (const [pattern, pages] of Object.entries(routes.en)) {
		if (!routePatterns.includes(pattern as keyof RoutePages) || !pages.length) {
			throw new Error(`No Markdown pages in navigation for ${pattern}`);
		}
	}
	const pages = routePatterns.flatMap((route) => routes.en[route]);
	const files: Record<string, string> = {};
	for (const locale of ["en", "ar"] as const) {
		for (const route of routePatterns) {
			for (const page of routes[locale][route]) {
				const path = markdownPath(page.path, locale);
				if (!page.body.trim() || Object.hasOwn(files, path)) throw new Error(`Invalid Markdown twin at ${path}`);
				files[path] = `${page.body}\n`;
			}
		}
	}
	files["/llms.txt"] = `${blocks(
		heading(1, "tensquads design system"),
		`> ${siteCopy.en.designSystem.lead}`,
		...groups.map(({ title, routes: patterns }) =>
			blocks(
				heading(2, title),
				patterns
					.flatMap((pattern) =>
						routes.en[pattern].map(({ path, title, description }) =>
							item(
								path === "/get-started" ? siteCopy.en.getStarted : path === "/chat" ? siteCopy.en.nav.chat : title,
								origin + markdownPath(path),
								description,
							),
						),
					)
					.join("\n"),
			),
		),
	)}\n`;
	files["/llms-full.txt"] = `${pages.map(({ body }) => body).join("\n\n---\n\n")}\n`;
	return { files, routePatterns };
}
