import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { Button } from "@tensquads/ui/react";
import { useState } from "react";
import { siteCopy } from "../copy";
import {
	installExample,
	reactExample,
	skillInstallExample,
	styleExample,
	workerExample,
} from "../get-started-examples";
import { getPreviewState } from "../state";

export const Route = createFileRoute("/get-started")({ component: GetStartedPage });

function GetStartedPage() {
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const { locale, direction } = getPreviewState(search);
	const copy = siteCopy[locale].getStartedPage;

	return (
		<main id="main" className="content-page get-started-page" dir={direction}>
			<header className="get-started-intro">
				<p className="eyebrow">{copy.eyebrow}</p>
				<h1>{copy.title}</h1>
				<p className="intro">{copy.intro}</p>
			</header>

			<section className="get-started-section" aria-labelledby="install-heading">
				<div className="get-started-section__heading">
					<span className="get-started-step" aria-hidden="true">
						01
					</span>
					<div>
						<h2 id="install-heading">{copy.installTitle}</h2>
						<p>{copy.installLead}</p>
					</div>
				</div>
				<CopyableCode code={installExample} label={copy.installCodeLabel} copy={copy} />
				<p className="get-started-note">{copy.installNote}</p>
			</section>

			<section className="get-started-section" aria-labelledby="styles-heading">
				<div className="get-started-section__heading">
					<span className="get-started-step" aria-hidden="true">
						02
					</span>
					<div>
						<h2 id="styles-heading">{copy.stylesTitle}</h2>
						<p>{copy.stylesLead}</p>
					</div>
				</div>
				<CopyableCode code={styleExample} label={copy.stylesCodeLabel} copy={copy} />
				<p className="get-started-note">{copy.stylesNote}</p>
			</section>

			<section className="get-started-section" aria-labelledby="skills-heading">
				<div className="get-started-section__heading">
					<span className="get-started-step" aria-hidden="true">
						03
					</span>
					<div>
						<h2 id="skills-heading">{copy.skillsTitle}</h2>
						<p>{copy.skillsLead}</p>
					</div>
				</div>
				<ul className="get-started-list">
					<li>
						<code>.agents/skills/tensquads-ui/SKILL.md</code>
						<span>{copy.tensquadsSkill}</span>
					</li>
					<li>
						<code>.agents/skills/ui-sdk/SKILL.md</code>
						<span>{copy.uiSdkSkill}</span>
					</li>
				</ul>
				<CopyableCode code={skillInstallExample} label={copy.skillInstallLabel} copy={copy} />
				<p className="get-started-note">{copy.skillsNote}</p>
				<p className="get-started-doc-link">
					<a href="https://github.com/moeghashim/tensquads-ui/blob/main/llms.txt" target="_blank" rel="noreferrer">
						{copy.llmsLink}
					</a>
				</p>
			</section>

			<section className="get-started-section" aria-labelledby="react-heading">
				<div className="get-started-section__heading">
					<span className="get-started-step" aria-hidden="true">
						04
					</span>
					<div>
						<h2 id="react-heading">{copy.reactTitle}</h2>
						<p>{copy.reactLead}</p>
					</div>
				</div>
				<CopyableCode code={reactExample} label={copy.reactCodeLabel} copy={copy} language="tsx" />
			</section>

			<section className="get-started-section" aria-labelledby="server-heading">
				<div className="get-started-section__heading">
					<span className="get-started-step" aria-hidden="true">
						05
					</span>
					<div>
						<h2 id="server-heading">{copy.serverTitle}</h2>
						<p>{copy.serverLead}</p>
					</div>
				</div>
				<CopyableCode code={workerExample} label={copy.workerCodeLabel} copy={copy} language="ts" />
				<p className="get-started-note">{copy.sdkNote}</p>
				<p className="get-started-note">{copy.serverNote}</p>
			</section>
		</main>
	);
}

type PageCopy = { [Key in keyof (typeof siteCopy)["en"]["getStartedPage"]]: string };

function CopyableCode({
	code,
	label,
	copy,
	language,
}: {
	code: string;
	label: string;
	copy: PageCopy;
	language?: string;
}) {
	const [copied, setCopied] = useState(false);
	const [failed, setFailed] = useState(false);
	const copyCode = async () => {
		try {
			await navigator.clipboard.writeText(code);
			setFailed(false);
			setCopied(true);
		} catch {
			setCopied(false);
			setFailed(true);
		}
	};

	return (
		<div className="get-started-code">
			<div className="get-started-code__header">
				<span>{label}</span>
				<Button variant="ghost" size="sm" onClick={() => void copyCode()}>
					{copied ? copy.copied : copy.copy}
				</Button>
			</div>
			{/* biome-ignore lint/a11y/noNoninteractiveTabindex: Keyboard users need to scroll long code samples. */}
			<section aria-label={label} className="get-started-code__scroll" dir="ltr" tabIndex={0}>
				<pre dir="ltr">
					<code className={language ? `language-${language}` : undefined}>{code}</code>
				</pre>
			</section>
			<span className="get-started-code__status" role="status">
				{failed ? copy.copyFailed : copied ? copy.copied : ""}
			</span>
		</div>
	);
}
