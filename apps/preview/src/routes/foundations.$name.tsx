import { createFileRoute, Link, notFound, useRouterState } from "@tanstack/react-router";
import { Badge, Button, squadmateCharacterName, squadmateStateLabel } from "@tensquads/ui/react";
import { AGENT_ROLE_TO_SLUG, type AgentState } from "@tensquads/ui/schemas";
import { AGENT_LOOP_STATES } from "@tensquads/ui/squadmates";
import { type CSSProperties, useState } from "react";
import mascots from "../../../../design/mascots/mascots.json";
import tokens from "../../../../design/tokens.json";
import { type FoundationName, foundationNames, ReferenceIntro, ReferenceLayout } from "../components/design-reference";
import { siteCopy } from "../copy";
import { designAsset } from "../design-assets";
import { getPreviewState, type Locale } from "../state";

type DesignCopy = (typeof siteCopy)[Locale]["designSystem"];
type Token = { name: string; value: string | { light: string; dark: string }; usage: string };

export const Route = createFileRoute("/foundations/$name")({
	loader: ({ params }) => {
		const name = foundationNames.find((name) => name === params.name);
		if (!name) throw notFound();
		return name;
	},
	component: FoundationPage,
});

function FoundationPage() {
	const name = Route.useLoaderData();
	const search = useRouterState({ select: (state) => state.location.search });
	const { locale } = getPreviewState(search);
	const copy = siteCopy[locale].designSystem;
	const { title, lead } = copy.foundationsIndex[name];
	return (
		<main id="main" className="design-wrap">
			<ReferenceIntro title={title} lead={lead} />
			<ReferenceLayout
				label={name === "colour" ? copy.onPage : copy.foundations}
				links={
					name === "colour" ? (
						<ColourLinks copy={copy} />
					) : (
						foundationNames.map((id) => (
							<Link key={id} to="/foundations/$name" params={{ name: id }} search={search}>
								{copy.foundationsIndex[id].title}
							</Link>
						))
					)
				}
			>
				<FoundationContent name={name} locale={locale} />
			</ReferenceLayout>
		</main>
	);
}

function FoundationContent({ name, locale }: { name: FoundationName; locale: Locale }) {
	const copy = siteCopy[locale].designSystem;
	switch (name) {
		case "colour":
			return <ColourPage locale={locale} />;
		case "typography":
			return <Typography copy={copy} />;
		case "spacing":
			return <TokenTable tokens={tokens.spacing.tokens} specimen="spacing" locale={locale} />;
		case "radius":
			return <TokenTable tokens={tokens.radius.tokens} specimen="radius" locale={locale} />;
		case "shadow":
			return <TokenTable tokens={tokens.shadow.tokens} specimen="shadow" locale={locale} />;
		case "motion":
			return <Motion locale={locale} />;
		case "logo":
			return <Logo copy={copy} />;
		case "mascots":
			return <Mascots locale={locale} />;
	}
}

function variable(name: string) {
	return `--ts-${name}`;
}

function TokenTable({
	tokens: rows,
	locale,
	specimen,
}: {
	tokens: readonly Token[];
	locale: Locale;
	specimen?: "colour" | "spacing" | "radius" | "shadow";
}) {
	const { designSystem: copy, theme } = siteCopy[locale];
	const themed = rows.some(({ value }) => typeof value !== "string");
	return (
		<table className="foundation-table">
			<thead>
				<tr>
					<th scope="col">{copy.variable}</th>
					{themed ? (
						<>
							<th scope="col">{theme.light}</th>
							<th scope="col">{theme.dark}</th>
						</>
					) : (
						<th scope="col">{copy.value}</th>
					)}
					<th className="foundation-table__usage" scope="col">
						{locale === "ar" ? copy.sourceUsage : copy.usage}
					</th>
				</tr>
			</thead>
			<tbody>
				{rows.map(({ name, value, usage }) => {
					const sample = specimen && (
						<span
							className={`foundation-swatch foundation-swatch--${specimen}`}
							style={{ "--sample": `var(${variable(name)})` } as CSSProperties}
							aria-hidden="true"
						/>
					);
					return (
						<tr key={name}>
							<th scope="row">
								<code>{variable(name)}</code>
							</th>
							{themed ? (
								(["light", "dark"] as const).map((mode) => (
									<td key={mode}>
										<span className="foundation-value" data-theme={mode}>
											{sample}
											<code>{typeof value === "string" ? value : value[mode]}</code>
										</span>
									</td>
								))
							) : (
								<td>
									<span className="foundation-value">
										{sample}
										<code>{typeof value === "string" ? value : value.light}</code>
									</span>
								</td>
							)}
							<td className="foundation-table__usage" lang="en" dir="ltr">
								{usage}
							</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
}

const primitiveNames = /^(gray|blue|green|red|orange|yellow|purple|pink|alpha)-/;
const statusNames = /^(info|warning|caution|danger|success|discovery)-/;
const workflowNames = /^(node-|tint-|branch-|edge|connection-line|handle|toolbar-bg|dot-grid)/;

const colours = tokens.color.tokens;
const primitives = new Map<string, Token[]>();
for (const token of colours) {
	const family = primitiveNames.exec(token.name)?.[1];
	if (!family) continue;
	const group = primitives.get(family) ?? [];
	group.push(token);
	primitives.set(family, group);
}
const colourGroups: { id: string; label: "coreRoles" | "statusColours" | "workflowColours"; rows: Token[] }[] = [
	{
		id: "roles",
		label: "coreRoles",
		rows: colours.filter(
			({ name }) => !primitiveNames.test(name) && !statusNames.test(name) && !workflowNames.test(name),
		),
	},
	{ id: "status", label: "statusColours", rows: colours.filter(({ name }) => statusNames.test(name)) },
	{ id: "workflow-colours", label: "workflowColours", rows: colours.filter(({ name }) => workflowNames.test(name)) },
];

function ColourLinks({ copy }: { copy: DesignCopy }) {
	return (
		<>
			<a href="#themes">{copy.themes}</a>
			{colourGroups.map(({ id, label }) => (
				<a key={id} href={`#${id}`}>
					{copy[label]}
				</a>
			))}
			<a href="#palette">{copy.palette}</a>
		</>
	);
}

function ColourPage({ locale }: { locale: Locale }) {
	const { designSystem: copy, theme } = siteCopy[locale];
	return (
		<div className="foundation-sections">
			<section id="themes">
				<h2>{copy.themes}</h2>
				<p>{copy.themeLead}</p>
				<div className="colour-modes">
					{(["light", "dark"] as const).map((mode) => (
						<div className="colour-mode" data-theme={mode} key={mode}>
							<small>{theme[mode]}</small>
							<div className="colour-mode__example">
								<div>
									<strong>{copy.summary}</strong>
									<Badge tone="success">{copy.ready}</Badge>
								</div>
								<span className="colour-mode__action">{copy.report}</span>
							</div>
						</div>
					))}
				</div>
			</section>
			{colourGroups.map(({ id, label, rows }) => (
				<section id={id} key={id}>
					<h2>{copy[label]}</h2>
					<TokenTable tokens={rows} locale={locale} specimen="colour" />
				</section>
			))}
			<section id="palette">
				<h2>{copy.palette}</h2>
				<p>{copy.paletteLead}</p>
				{Array.from(primitives, ([name, rows]) => (
					<details className="foundation-disclosure" key={name}>
						<summary>
							<code>{name}</code>
						</summary>
						<TokenTable tokens={rows} locale={locale} specimen="colour" />
					</details>
				))}
			</section>
		</div>
	);
}

function Typography({ copy }: { copy: DesignCopy }) {
	return (
		<div className="foundation-sections">
			<section>
				<h2>{copy.fontFamilies}</h2>
				<dl className="foundation-type">
					{Object.entries(tokens.type.families).map(([name, value]) => (
						<div key={name}>
							<dt>
								<code>{variable(`font-${name}`)}</code>
							</dt>
							<dd>
								<code>{value}</code>
							</dd>
						</div>
					))}
				</dl>
			</section>
			<section>
				<h2>{copy.styles}</h2>
				{tokens.type.groups.map(({ name, styles }) => (
					<div key={name}>
						<h3 lang="en">{name}</h3>
						<dl className="foundation-type">
							{styles.map((style) => (
								<div key={style.name}>
									<dt>
										<code>{style.name}</code>
									</dt>
									<dd
										className="foundation-type__sample"
										style={{
											fontFamily: `var(${variable(`${style.name}-font-family`)})`,
											fontSize: style.fontSize,
											lineHeight: style.lineHeight,
											fontWeight: style.fontWeight,
											letterSpacing: style.letterSpacing,
										}}
									>
										{copy.typeSample}
									</dd>
									<dd className="foundation-type__values">
										<span>
											{copy.size} <code>{style.fontSize}</code>
										</span>
										<span>
											{copy.lineHeight} <code>{style.lineHeight}</code>
										</span>
										<span>
											{copy.weight} <code>{style.fontWeight}</code>
										</span>
										<span>
											{copy.tracking} <code>{style.letterSpacing}</code>
										</span>
									</dd>
								</div>
							))}
						</dl>
					</div>
				))}
			</section>
		</div>
	);
}

function Motion({ locale }: { locale: Locale }) {
	const copy = siteCopy[locale].designSystem;
	const [moving, setMoving] = useState(false);
	return (
		<div className="foundation-sections">
			<div className="motion-specimen">
				<Button variant="soft" onClick={() => setMoving((value) => !value)}>
					{copy.motionPreview}
				</Button>
				{tokens.easing.tokens.map(({ name }) => (
					<div className="motion-specimen__row" key={name}>
						<code>{name}</code>
						<div className="motion-specimen__track" data-moving={moving} aria-hidden="true">
							<span style={{ transitionTimingFunction: `var(${variable(name)})` }} />
						</div>
					</div>
				))}
			</div>
			<section>
				<h2>{copy.easing}</h2>
				<TokenTable tokens={tokens.easing.tokens} locale={locale} />
			</section>
			<section>
				<h2>{copy.duration}</h2>
				<TokenTable tokens={tokens.duration.tokens} locale={locale} />
			</section>
		</div>
	);
}

function Logo({ copy }: { copy: DesignCopy }) {
	const groups = [
		{ title: copy.signal, files: ["logo.svg", "logo-dark.svg", "logo-512.png", "logo-dark-512.png"] },
		{ title: copy.wordmark, files: ["wordmark.svg", "wordmark-dark.svg"] },
		{ title: copy.appIcons, files: ["favicon.svg", "favicon-32.png", "apple-touch-icon.png"] },
	];
	return (
		<div className="foundation-sections">
			{groups.map(({ title, files }) => (
				<section key={title}>
					<h2>{title}</h2>
					<div className="foundation-assets">
						{files.map((file) => {
							const url = designAsset(`logo/${file}`);
							return (
								<figure key={file}>
									<div
										className="foundation-assets__image"
										data-theme={file.includes("-dark") ? "dark" : "light"}
									>
										<img src={url} alt={title} />
									</div>
									<figcaption>
										<a href={url} download={file}>
											{copy.download} <bdi>{file}</bdi>
										</a>
									</figcaption>
								</figure>
							);
						})}
					</div>
				</section>
			))}
		</div>
	);
}

function Mascots({ locale }: { locale: Locale }) {
	const copy = siteCopy[locale].designSystem;
	const states: AgentState[] = ["idle", ...AGENT_LOOP_STATES.map(({ id }) => id)];
	return (
		<div className="foundation-assets">
			{mascots.map((mascot) => {
				const agent = AGENT_ROLE_TO_SLUG[mascot.id as keyof typeof AGENT_ROLE_TO_SLUG];
				const name = squadmateCharacterName(agent, locale);
				return (
					<article className="foundation-mascot" key={mascot.id}>
						<img src={designAsset(mascot.files.svg)} alt="" />
						<div>
							<h2>{name}</h2>
							<p lang="en" dir="ltr">
								{mascot.namedAfter}
							</p>
						</div>
						<dl className="foundation-mascot__palette" aria-label={copy.mascotPalette}>
							{Object.entries(mascot.palette).map(([name, value]) => (
								<div key={name}>
									<dt>
										<code>{name}</code>
									</dt>
									<dd>
										<span aria-hidden="true" style={{ backgroundColor: value }} />
										<code>{value}</code>
									</dd>
								</div>
							))}
						</dl>
						<details className="foundation-disclosure">
							<summary>{copy.mascotStates}</summary>
							<div className="foundation-mascot__states">
								{states.map((state) => (
									<figure key={state}>
										<img loading="lazy" src={designAsset(`mascots/states/${agent}-${state}.svg`)} alt="" />
										<figcaption>{squadmateStateLabel(state, locale)}</figcaption>
									</figure>
								))}
							</div>
						</details>
					</article>
				);
			})}
		</div>
	);
}
