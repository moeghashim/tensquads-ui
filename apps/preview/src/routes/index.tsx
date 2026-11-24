import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { TensquadsRenderer } from "@tensquads/ui/openui";
import { Button, squadmateCharacterName } from "@tensquads/ui/react";
import { CopyCodeButton } from "../components/copy-code-button";
import { Arrow, FoundationLinks, llmsUrl } from "../components/design-reference";
import { StreamDemo } from "../components/stream-demo";
import { siteCopy } from "../copy";
import { designAsset, wordmark } from "../design-assets";
import { getPreviewState } from "../state";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const { locale, direction } = getPreviewState(search);
	const copy = siteCopy[locale];
	const design = copy.designSystem;
	const installLine = "npm install github:moeghashim/tensquads-ui#<commit-sha>";
	const sample = `root = Badge(${JSON.stringify(design.ready)}, "success")`;
	const arrow = <Arrow direction={direction} />;

	return (
		<main className="design-wrap design-home" id="main">
			<section className="design-hero">
				<div className="design-hero__copy">
					<h1>{design.title}</h1>
					<p>{design.lead}</p>
					<div className="design-hero__links">
						<Button pill render={<Link to="/foundations" search={search} />}>
							{design.explore}
						</Button>
						<Button pill variant="soft" render={<Link to="/components" search={search} />}>
							{copy.browse}
						</Button>
					</div>
				</div>
				<figure className="brand-specimen">
					<div className="brand-specimen__plate">
						<img className="brand-specimen__mark" src={wordmark.light} alt="" />
						<img className="brand-specimen__mark theme-mark-dark" src={wordmark.dark} alt="" />
						<div className="brand-specimen__squad">
							{(["kyoto", "petra", "delphi"] as const).map((name) => (
								<img
									key={name}
									src={designAsset(`mascots/svg/${name}.svg`)}
									alt={squadmateCharacterName(name, locale)}
								/>
							))}
						</div>
					</div>
					<figcaption>
						<span>{design.specimen}</span>
						<Link to="/foundations/$name" params={{ name: "mascots" }} search={search}>
							{design.exploreMascots} {arrow}
						</Link>
					</figcaption>
				</figure>
			</section>

			<div className="design-setup">
				<div className="design-setup__install">
					<strong>{design.install}</strong>
					<div className="install-card">
						<code>{installLine}</code>
						<CopyCodeButton
							code={installLine}
							copyLabel={copy.copy}
							copiedLabel={copy.copied}
							failedLabel={copy.copyFailed}
						/>
					</div>
					<Link to="/get-started" search={search}>
						{copy.getStarted} {arrow}
					</Link>
				</div>
				<a className="reference-resource" href={llmsUrl}>
					llms.txt
				</a>
			</div>

			<div className="design-home__systems">
				<section aria-labelledby="home-foundations">
					<header>
						<h2 id="home-foundations">{design.foundations}</h2>
						<p>{design.foundationLead}</p>
					</header>
					<FoundationLinks locale={locale} direction={direction} search={search} />
				</section>
				<section aria-labelledby="home-ui">
					<header>
						<h2 id="home-ui">{design.uiSystem}</h2>
						<p>{design.uiLead}</p>
					</header>
					<div>
						<div className="design-links">
							<Link to="/components" search={search}>
								{design.catalog} {arrow}
							</Link>
							<Link to="/get-started" search={search}>
								{design.build} {arrow}
							</Link>
						</div>
						<div className="design-stream-sample">
							<div>
								<small>{design.sampleSource}</small>
								<code>{sample}</code>
							</div>
							<div>
								<small>{design.sampleResult}</small>
								<TensquadsRenderer stream={sample} locale={locale} />
							</div>
						</div>
					</div>
				</section>
			</div>

			<div className="design-reference-row">
				<strong>{design.reference}</strong>
				<a href="https://10squads.com/design/#overview">{design.principles}</a>
				<a href="https://10squads.com/design/#screens">{design.screens}</a>
				<a href="https://10squads.com/design/#pages">{design.pages}</a>
				<a href="https://10squads.com/design/#states">{design.states}</a>
			</div>
			<div className="design-reference-row">
				<strong>{design.demos}</strong>
				<Link to="/chat" search={search}>
					{copy.nav.chat}
				</Link>
				<Link to="/dashboards/home" search={search}>
					{copy.nav.dashboards}
				</Link>
				<Link to="/dashboards/admin" search={search}>
					{design.admin}
				</Link>
			</div>
			<StreamDemo locale={locale} key={locale} />
		</main>
	);
}
