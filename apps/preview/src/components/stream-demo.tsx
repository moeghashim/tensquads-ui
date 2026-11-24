import { TensquadsRenderer } from "@tensquads/ui/openui";
import {
	Button,
	SegmentedControl,
	SegmentedControlIndicator,
	SegmentedControlItem,
	squadmateCharacterName,
	squadmateStateLabel,
} from "@tensquads/ui/react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { siteCopy } from "../copy";
import demoArabic from "../fixtures/home-demo.fixture.ar.txt?raw";
import demoEnglish from "../fixtures/home-demo.fixture.en.txt?raw";
import type { Locale } from "../state";

const demoLines = {
	en: demoEnglish.trim().split("\n"),
	ar: demoArabic.trim().split("\n"),
};

export function StreamDemo({ locale }: { locale: Locale }) {
	const copy = siteCopy[locale];
	const design = copy.designSystem;
	const [demoLocale, setDemoLocale] = useState(locale);
	const [completedLines, setCompletedLines] = useState(0);
	const [iteration, setIteration] = useState(0);
	const playback = useMemo(() => ({ lines: demoLines[demoLocale], iteration }), [demoLocale, iteration]);
	const { lines } = playback;

	useEffect(() => {
		const { lines } = playback;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setCompletedLines(lines.length);
			return;
		}
		let current = 0;
		const timer = window.setInterval(() => {
			current += 1;
			setCompletedLines(current);
			if (current === lines.length) window.clearInterval(timer);
		}, 285);
		return () => window.clearInterval(timer);
	}, [playback]);

	const replay = () => {
		setCompletedLines(0);
		setIteration((value) => value + 1);
	};

	const chooseLocale = (value: string | null) => {
		if ((value !== "en" && value !== "ar") || value === demoLocale) return;
		setDemoLocale(value);
		replay();
	};

	const render = (line: number, className?: string) => (
		<Reveal
			key={`${demoLocale}-${iteration}-${line}`}
			shown={completedLines >= line}
			current={completedLines === line}
			className={className}
		>
			<TensquadsRenderer stream={lines[line - 1] ?? null} locale={demoLocale} />
		</Reveal>
	);
	const demoCopy = siteCopy[demoLocale];

	return (
		<section className="stream-demo" aria-labelledby="stream-demo-heading">
			<header className="stream-demo__intro">
				<div>
					<p className="stream-demo__eyebrow">{design.streamEyebrow}</p>
					<h2 id="stream-demo-heading">{design.streamHeading}</h2>
					<p>{design.streamLead}</p>
				</div>
				<div className="stream-demo__controls">
					<SegmentedControl aria-label={design.demoLanguage} value={demoLocale} onValueChange={chooseLocale}>
						<SegmentedControlIndicator />
						<SegmentedControlItem value="en" lang="en">
							English
						</SegmentedControlItem>
						<SegmentedControlItem value="ar" lang="ar">
							العربية
						</SegmentedControlItem>
					</SegmentedControl>
					<Button variant="soft" size="sm" onClick={replay}>
						<svg aria-hidden="true" viewBox="0 0 16 16">
							<path d="M13 8a5 5 0 1 1-1.5-3.6M13 3v3h-3" />
						</svg>
						{copy.replay}
					</Button>
				</div>
			</header>
			<div className="stream-demo__frame">
				<div className="stream-code">
					<div className="stream-demo__pane-heading">
						<strong>{design.sampleSource}</strong>
						<span className="stream-code__live">
							<span aria-hidden="true" />
							{design.live}
						</span>
					</div>
					<ol className="stream-code__lines">
						{lines.map((line, index) => (
							<li
								key={line}
								className="stream-code__line stream-reveal"
								data-shown={completedLines > index}
								data-current={completedLines === index + 1}
								aria-hidden={completedLines <= index}
							>
								<span className="stream-code__number" aria-hidden="true">
									{index + 1}
								</span>
								<OpenUILine line={line} />
							</li>
						))}
					</ol>
					<div className="stream-code__footer">
						<div className="stream-code__progress" aria-hidden="true">
							{lines.map((line, index) => (
								<span key={line} data-complete={completedLines > index} />
							))}
						</div>
						<span>
							{design.streamProgress
								.replace("{line}", String(completedLines))
								.replace("{total}", String(lines.length))}
						</span>
					</div>
				</div>
				<div className="stream-screen" lang={demoLocale} dir={demoLocale === "ar" ? "rtl" : "ltr"}>
					<div className="stream-demo__pane-heading">
						<strong>{demoCopy.designSystem.rendered}</strong>
						<code>home-demo.fixture.{demoLocale}.txt</code>
					</div>
					<div className="stream-screen__stage">
						<div className="stream-screen__agent">
							{render(1, "stream-screen__avatar")}
							<div className="stream-screen__agent-copy">
								<strong>
									{demoCopy.petraTitle.replace("{name}", squadmateCharacterName("petra", demoLocale))}
								</strong>
								<span>{squadmateStateLabel("running", demoLocale)}</span>
							</div>
							{render(2)}
						</div>
						<div className="stream-screen__grid" key={demoLocale}>
							<div className="stream-screen__row">{render(3)}</div>
							<div className="stream-screen__row">{render(4)}</div>
							<div className="stream-screen__row stream-screen__cadence">
								<span>{demoCopy.designSystem.cadence}</span>
								{render(5)}
							</div>
						</div>
						<div className="stream-screen__actions">
							{render(6)}
							{render(7)}
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

function OpenUILine({ line }: { line: string }) {
	const [, component, args] = /^root = (\w+)(.*)$/u.exec(line) ?? [];
	if (!component || !args) return <code>{line}</code>;
	let offset = 0;
	return (
		<code>
			<span className="stream-code__binding">root = </span>
			<strong>{component}</strong>
			{args.split(/("(?:[^"\\]|\\.)*")/u).map((part) => {
				const start = offset;
				offset += part.length;
				return part.startsWith('"') ? (
					<span className="stream-code__string" key={start}>
						{part}
					</span>
				) : (
					part
				);
			})}
		</code>
	);
}

function Reveal({
	shown,
	current,
	className,
	children,
}: {
	shown: boolean;
	current: boolean;
	className?: string;
	children: ReactNode;
}) {
	return (
		<div
			className={["stream-reveal", className].filter(Boolean).join(" ")}
			data-shown={shown}
			data-current={current}
			aria-hidden={!shown}
			inert={!shown}
		>
			{children}
		</div>
	);
}
