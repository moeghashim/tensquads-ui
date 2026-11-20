import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { Button } from "@tensquads/ui/react";
import { useState } from "react";
import { siteCopy } from "../copy";
import { getPreviewState } from "../state";

const installExample = "npm install github:moeghashim/tensquads-ui#<commit-sha>";
const styleExample = `@layer ui-sdk, tensquads;\n@import "@tensquads/ui/fonts.css";\n@import "@tensquads/ui/tokens.css";\n@import "@tensquads/ui/styles.css";`;
const skillInstallExample = `npx skills@latest add moeghashim/tensquads-ui --skill tensquads-ui\nnpx skills@latest add vercel-labs/ui --skill ui-sdk`;
const reactExample = `import { Button, Field, FieldLabel, Input } from "@tensquads/ui/react";\n\nexport function ProfileForm() {\n  return (\n    <form>\n      <Field name="displayName">\n        <FieldLabel>Display name</FieldLabel>\n        <Input placeholder="Your name" />\n      </Field>\n      <Button type="submit">Save profile</Button>\n    </form>\n  );\n}`;
const workerExample = `import { createTensquadsLibrary } from "@tensquads/ui/openui";\nimport {\n  buildSystemPrompt,\n  OpenUIServerError,\n  readOpenUIRequest,\n  streamOpenUIResponse,\n} from "@tensquads/ui/openui/server";\nimport { createAnthropicProvider } from "@tensquads/ui/openui/server/anthropic";\n\ntype Env = { ANTHROPIC_API_KEY: string };\n\nexport default {\n  async fetch(request: Request, env: Env): Promise<Response> {\n    try {\n      const { turns } = await readOpenUIRequest(request);\n      if (turns.length === 0 || turns.at(-1)?.role !== "user") {\n        return new Response("A user turn is required.", { status: 400 });\n      }\n      const locale = "en" as const;\n      const library = createTensquadsLibrary(locale);\n      const system = buildSystemPrompt({ library, locale });\n      const provider = createAnthropicProvider(env.ANTHROPIC_API_KEY);\n      return await streamOpenUIResponse({ provider, system, turns, signal: request.signal });\n    } catch (error) {\n      if (error instanceof OpenUIServerError) {\n        return Response.json({ error: error.code }, { status: error.status });\n      }\n      throw error;\n    }\n  },\n};`;

export const Route = createFileRoute("/get-started")({ component: GetStartedPage });

function GetStartedPage() {
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const { locale, direction } = getPreviewState(search);
	const copy = siteCopy[locale].getStartedPage;

	return (
		<main className="content-page get-started-page" dir={direction}>
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
				<p className="get-started-note">
					Apps using the Anthropic provider install @anthropic-ai/sdk themselves; this example uses version 1.10.0.
				</p>
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
