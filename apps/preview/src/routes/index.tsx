import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { getRegisteredComponents, TensquadsRenderer } from "@tensquads/ui/openui";
import {
	Button,
	SegmentedControl,
	SegmentedControlIndicator,
	SegmentedControlItem,
	Squadmate,
	squadmateCharacterName,
	squadmateStateLabel,
	Tooltip,
	TooltipArrow,
	TooltipContent,
	TooltipTrigger,
} from "@tensquads/ui/react";
import { AGENT_ROLE_TO_SLUG } from "@tensquads/ui/schemas";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { CopyCodeButton } from "../components/copy-code-button";
import { siteCopy } from "../copy";
import { getPreviewState } from "../state";

const demoFixtures = import.meta.glob<string>("../fixtures/home-demo.fixture.*.txt", {
	eager: true,
	query: "?raw",
	import: "default",
});
const previewFixtures = import.meta.glob<string>("../../../../packages/ui/src/react/*/*.fixture.*.txt", {
	eager: true,
	query: "?raw",
	import: "default",
});
const components = getRegisteredComponents()
	.map(({ name }) => name)
	.sort();
const mates = Object.values(AGENT_ROLE_TO_SLUG);

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const { locale, direction } = getPreviewState(search);
	const copy = siteCopy[locale];
	const installLine = "npm install github:moeghashim/tensquads-ui#<commit-sha>";
	const [demoLocale, setDemoLocale] = useState(locale);
	const [completedLines, setCompletedLines] = useState(0);
	const [replayIndex, setReplayIndex] = useState(0);
	const playback = useMemo(
		() => ({
			iteration: replayIndex,
			lines: (demoFixtures[`../fixtures/home-demo.fixture.${demoLocale}.txt`] ?? "").trim().split("\n"),
		}),
		[demoLocale, replayIndex],
	);

	useEffect(() => {
		setDemoLocale(locale);
	}, [locale]);

	useEffect(() => {
		setCompletedLines(0);
		const media = window.matchMedia("(prefers-reduced-motion: reduce)");
		if (media.matches) {
			setCompletedLines(playback.lines.length);
			return;
		}
		let current = 0;
		const timer = window.setInterval(() => {
			current += 1;
			setCompletedLines(current);
			if (current >= playback.lines.length) window.clearInterval(timer);
		}, 285);
		return () => window.clearInterval(timer);
	}, [playback]);

	const replay = () => {
		setCompletedLines(0);
		setReplayIndex((index) => index + 1);
	};
	const chooseDemoLocale = (value: string | null) => {
		if (value && (value === "en" || value === "ar")) {
			setDemoLocale(value);
			setCompletedLines(0);
		}
	};
	const demoDir = demoLocale === "ar" ? "rtl" : "ltr";

	return (
		<main className="home-page" dir={direction}>
			<section className="hero">
				<div className="hero__copy">
					<h1>{copy.heroTitle}</h1>
					<p>{copy.heroLead}</p>
				</div>
				<div className="hero__actions">
					<div className="install-card">
						<span className="install-card__label">{copy.install}</span>
						{/* biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users need to scroll the command at narrow widths. */}
						<section className="install-card__command" aria-label={copy.install} tabIndex={0}>
							<code>{installLine}</code>
						</section>
						<CopyCodeButton
							code={installLine}
							copyLabel={copy.copy}
							copiedLabel={copy.copied}
							failedLabel={copy.copyFailed}
						/>
					</div>
					<div className="hero__links">
						<Button render={<Link to="/get-started" search={search as never} />}>{copy.getStarted}</Button>
						<Button variant="soft" render={<Link to="/components" search={search as never} />}>
							{copy.browseComponents.replace("{count}", String(components.length))}
						</Button>
						<Button variant="ghost" render={<Link to="/chat" search={search as never} />}>
							{copy.openChat}
						</Button>
						<Button variant="ghost" render={<Link to="/dashboards/home" search={search as never} />}>
							{copy.nav.dashboards}
						</Button>
						<Button variant="ghost" render={<Link to="/dashboards/admin" search={search as never} />}>
							{locale === "ar" ? "إدارة المنصة" : "Platform admin"}
						</Button>
					</div>
				</div>
			</section>

			<section className="stream-demo" aria-label={copy.streamTitle}>
				<div className="stream-code" dir="ltr">
					<div className="stream-code__header">
						<div>
							<span className="stream-code__dot" aria-hidden="true" />
							{copy.streamTitle}
						</div>
						<span className="stream-code__status">
							{completedLines < playback.lines.length ? copy.streaming : "●"}
						</span>
					</div>
					<pre aria-live="polite">
						{playback.lines.map((line, index) => (
							<span
								className="stream-code__line stream-reveal"
								data-shown={completedLines > index}
								aria-hidden={completedLines <= index}
								key={`${demoLocale}-${line}`}
							>
								<span className="stream-code__message-label">
									{copy.message} {index + 1} {copy.of} {playback.lines.length}
								</span>
								<code>{line}</code>
							</span>
						))}
					</pre>
					<div className="stream-code__footer">
						<span>
							{demoLocale === "ar" ? "ملف العرض: home-demo.fixture.ar.txt" : "Fixture: home-demo.fixture.en.txt"}{" "}
							· {completedLines}/{playback.lines.length}
						</span>
						<Button variant="ghost" size="sm" onClick={replay}>
							{copy.replay}
						</Button>
					</div>
				</div>
				<div className="stream-screen" lang={demoLocale} dir={demoDir}>
					<div className="stream-screen__agent">
						<div className="stream-screen__avatar">
							<Reveal shown={completedLines >= 1}>
								<TensquadsRenderer
									key={`${demoLocale}-${playback.iteration}`}
									stream={playback.lines[0] ?? null}
									locale={demoLocale}
								/>
							</Reveal>
						</div>
						<div className="stream-screen__agent-copy">
							<strong>
								{siteCopy[demoLocale].petraTitle.replace("{name}", squadmateCharacterName("petra", demoLocale))}
							</strong>
							<span>{squadmateStateLabel("running", demoLocale)}</span>
						</div>
						<Reveal shown={completedLines >= 2}>
							<TensquadsRenderer
								key={`${demoLocale}-${playback.iteration}`}
								stream={playback.lines[1] ?? null}
								locale={demoLocale}
							/>
						</Reveal>
					</div>
					<div className="stream-screen__grid">
						<div className="stream-screen__field">
							<Reveal shown={completedLines >= 3}>
								<TensquadsRenderer
									key={`${demoLocale}-${playback.iteration}`}
									stream={playback.lines[2] ?? null}
									locale={demoLocale}
								/>
							</Reveal>
						</div>
						<div className="stream-screen__settings">
							<Reveal shown={completedLines >= 4}>
								<TensquadsRenderer
									key={`${demoLocale}-${playback.iteration}`}
									stream={playback.lines[3] ?? null}
									locale={demoLocale}
								/>
							</Reveal>
							<Reveal shown={completedLines >= 5}>
								<TensquadsRenderer
									key={`${demoLocale}-${playback.iteration}`}
									stream={playback.lines[4] ?? null}
									locale={demoLocale}
								/>
							</Reveal>
						</div>
						<div className="stream-screen__actions">
							<Reveal shown={completedLines >= 6}>
								<TensquadsRenderer
									key={`${demoLocale}-${playback.iteration}`}
									stream={playback.lines[5] ?? null}
									locale={demoLocale}
								/>
							</Reveal>
							<Reveal shown={completedLines >= 7}>
								<TensquadsRenderer
									key={`${demoLocale}-${playback.iteration}`}
									stream={playback.lines[6] ?? null}
									locale={demoLocale}
								/>
							</Reveal>
						</div>
					</div>
					<div className="stream-screen__locale">
						<span>{copy.sameStream}</span>
						<SegmentedControl aria-label={copy.sameStream} value={demoLocale} onValueChange={chooseDemoLocale}>
							<SegmentedControlIndicator />
							<SegmentedControlItem value="en">English</SegmentedControlItem>
							<SegmentedControlItem value="ar">العربية · RTL</SegmentedControlItem>
						</SegmentedControl>
					</div>
				</div>
			</section>

			<section className="home-section" aria-labelledby="home-components-heading">
				<div className="home-section__heading">
					<div>
						<p className="eyebrow">{copy.componentsTitle}</p>
						<h2 id="home-components-heading">{copy.componentsLead}</h2>
					</div>
					<Link to="/components" search={search as never}>
						{copy.browse} <span aria-hidden="true">{direction === "rtl" ? "←" : "→"}</span>
					</Link>
				</div>
				<div className="component-grid">
					{components.map((name) => {
						const fixturePath = `../../../../packages/ui/src/react/${name}/${name}.fixture.${locale}.txt`;
						return (
							<div className="component-card" key={name}>
								<div className="component-card__preview">
									{name === "Tooltip" ? (
										<Tooltip defaultOpen>
											<TooltipTrigger render={<Button iconOnly aria-label={copy.tooltipAction} />}>
												<span aria-hidden="true">+</span>
											</TooltipTrigger>
											<TooltipContent>
												{copy.tooltipHint}
												<TooltipArrow />
											</TooltipContent>
										</Tooltip>
									) : previewFixtures[fixturePath] ? (
										<TensquadsRenderer stream={previewFixtures[fixturePath]} locale={locale} />
									) : (
										<span>{name}</span>
									)}
								</div>
								<Link
									className="component-card__link"
									to="/components/$name"
									params={{ name }}
									search={search as never}
								>
									<strong>{name}</strong>
									<span className="component-card__arrow" aria-hidden="true">
										{direction === "rtl" ? "←" : "→"}
									</span>
								</Link>
							</div>
						);
					})}
				</div>
			</section>

			<section className="home-section paths-section">
				<p className="eyebrow">{copy.pathsTitle}</p>
				<div className="path-grid">
					<article className="path-card">
						<h2>{copy.codingAgents}</h2>
						<p>{copy.codingDescription}</p>
						<pre>
							<code>{'import { Button } from "@tensquads/ui/react";'}</code>
						</pre>
						<Link to="/get-started" search={search as never}>
							{copy.getStarted}
						</Link>
					</article>
					<article className="path-card">
						<h2>{copy.serverAgents}</h2>
						<p>{copy.serverDescription}</p>
						<pre>
							<code>{"streamOpenUIResponse({ provider, system, turns })"}</code>
						</pre>
						<Link to="/get-started" search={search as never}>
							{copy.getStarted}
						</Link>
					</article>
				</div>
				<div className="style-setup">
					<h2>{copy.styleSetup}</h2>
					<pre>
						<code>
							{
								'@layer ui-sdk, tensquads;\n@import "@tensquads/ui/fonts.css";\n@import "@tensquads/ui/tokens.css";\n@import "@tensquads/ui/styles.css";'
							}
						</code>
					</pre>
				</div>
			</section>

			<section className="home-section squad-section">
				<p className="eyebrow">{copy.squadTitle}</p>
				<div className="squad-row">
					{mates.map((agent) => (
						<Link
							className="squadmate-card"
							to="/components/$name"
							params={{ name: "Squadmate" }}
							search={search as never}
							key={agent}
						>
							<Squadmate agent={agent} state="idle" size={52} locale={locale} />
							<span>{squadmateCharacterName(agent, locale)}</span>
						</Link>
					))}
				</div>
			</section>
			<footer className="site-footer">
				<span>tensquads ui</span>
				<div>
					<a href="https://github.com/moeghashim/tensquads-ui">{copy.footerGithub}</a>
					<a href="https://github.com/moeghashim/tensquads-ui/blob/main/llms.txt">{copy.footerDocs}</a>
					<span>{copy.fontLicense}</span>
				</div>
			</footer>
		</main>
	);
}

/** Keeps a streamed part in the layout from the start and fades it in when its message arrives. */
function Reveal({ shown, children }: { shown: boolean; children: ReactNode }) {
	return (
		<div className="stream-reveal" data-shown={shown} aria-hidden={!shown} inert={!shown}>
			{children}
		</div>
	);
}
