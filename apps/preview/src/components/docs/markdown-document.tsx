import { CopyCodeButton } from "../copy-code-button";

type MarkdownBlock = { lineNumber: number } & (
	| { type: "heading"; level: number; text: string }
	| { type: "paragraph"; text: string }
	| { type: "code"; language: string; text: string }
	| { type: "list"; ordered: boolean; items: string[][] }
	| { type: "table"; headers: string[]; rows: string[][] }
	| { type: "rule" }
);

type MarkdownLabels = {
	copy: string;
	copied: string;
	copyFailed: string;
	codeLabel: string;
	description: string;
	props: string;
	usage: string;
};

const listMarker = /^( *)([-*]|\d+\.)( +)(.+)$/;
const rule = /^---+\s*$/;
const tableDivider = /^\|(?:\s*:?-{3,}:?\s*\|)+\s*$/;

function tableCells(line: string) {
	return line
		.trim()
		.slice(1, -1)
		.split("|")
		.map((cell) => cell.trim());
}

function parseMarkdown(markdown: string): MarkdownBlock[] {
	const lines = markdown.replaceAll("\r\n", "\n").split("\n");
	const blocks: MarkdownBlock[] = [];
	let index = 0;

	while (index < lines.length) {
		const lineNumber = index + 1;
		const line = lines[index] ?? "";
		if (!line.trim()) {
			index += 1;
			continue;
		}
		const fence = line.match(/^```([\w-]*)\s*$/);
		if (fence) {
			const code: string[] = [];
			index += 1;
			while (index < lines.length && !lines[index]?.startsWith("```")) {
				code.push(lines[index] ?? "");
				index += 1;
			}
			index += 1;
			blocks.push({ lineNumber, type: "code", language: fence[1] ?? "", text: code.join("\n").trimEnd() });
			continue;
		}
		const heading = line.match(/^(#{1,6})\s+(.+)$/);
		if (heading) {
			blocks.push({ lineNumber, type: "heading", level: heading[1]?.length ?? 1, text: heading[2] ?? "" });
			index += 1;
			continue;
		}
		if (rule.test(line)) {
			blocks.push({ lineNumber, type: "rule" });
			index += 1;
			continue;
		}
		if (line.startsWith("|") && tableDivider.test(lines[index + 1] ?? "")) {
			const headers = tableCells(line);
			const rows: string[][] = [];
			index += 2;
			while (index < lines.length && lines[index]?.startsWith("|")) {
				rows.push(tableCells(lines[index] ?? ""));
				index += 1;
			}
			blocks.push({ lineNumber, type: "table", headers, rows });
			continue;
		}
		const listItem = line.match(listMarker);
		if (listItem) {
			const ordered = listItem[2]?.endsWith(".") ?? false;
			const items: string[][] = [];
			while (index < lines.length) {
				const item = lines[index]?.match(listMarker);
				if (!item || item[1] !== listItem[1] || (item[2]?.endsWith(".") ?? false) !== ordered) break;
				const indent = " ".repeat(item[0].length - (item[4]?.length ?? 0));
				const body = [item[4] ?? ""];
				index += 1;
				while (index < lines.length) {
					const continuation = lines[index] ?? "";
					if (!continuation.trim()) {
						while (index < lines.length && !lines[index]?.trim()) index += 1;
						if (lines[index]?.startsWith(indent)) body.push("");
						continue;
					}
					if (!continuation.startsWith(indent)) break;
					body.push(continuation.slice(indent.length));
					index += 1;
				}
				items.push(body);
			}
			blocks.push({ lineNumber, type: "list", ordered, items });
			continue;
		}
		const paragraph = [line.trim()];
		index += 1;
		while (
			index < lines.length &&
			lines[index]?.trim() &&
			!/^(#{1,6})\s|^```/.test(lines[index] ?? "") &&
			!listMarker.test(lines[index] ?? "") &&
			!rule.test(lines[index] ?? "") &&
			!tableDivider.test(lines[index + 1] ?? "")
		) {
			paragraph.push(lines[index]?.trim() ?? "");
			index += 1;
		}
		blocks.push({ lineNumber, type: "paragraph", text: paragraph.join(" ") });
	}

	return blocks;
}

function InlineMarkdown({ text }: { text: string }) {
	const segments = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean);
	return (
		<>
			{segments.map((segment, index) => {
				const occurrence = segments.slice(0, index).filter((previous) => previous === segment).length;
				const key = `${segment}-${occurrence}`;
				if (segment.startsWith("`") && segment.endsWith("`")) {
					return <code key={key}>{segment.slice(1, -1)}</code>;
				}
				if (segment.startsWith("**") && segment.endsWith("**")) {
					return <strong key={key}>{segment.slice(2, -2)}</strong>;
				}
				const link = segment.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
				if (link)
					return (
						<a key={key} href={link[2]}>
							{link[1]}
						</a>
					);
				return segment;
			})}
		</>
	);
}

function ProseBlocks({
	blocks,
	headingOffset = 0,
	showCode = false,
}: {
	blocks: MarkdownBlock[];
	headingOffset?: number;
	showCode?: boolean;
}) {
	return (
		<>
			{blocks.map((block) => {
				const key = block.lineNumber;
				if (block.type === "heading") {
					const Heading = `h${Math.min(block.level + headingOffset, 6)}` as "h2" | "h3" | "h4" | "h5" | "h6";
					return (
						<Heading key={key}>
							<InlineMarkdown text={block.text} />
						</Heading>
					);
				}
				if (block.type === "paragraph")
					return (
						<p key={key}>
							<InlineMarkdown text={block.text} />
						</p>
					);
				if (block.type === "list") {
					const List = block.ordered ? "ol" : "ul";
					return (
						<List key={key}>
							{block.items.map(([first, ...continuation]) => (
								<li key={first}>
									{continuation.length ? (
										<ProseBlocks
											blocks={parseMarkdown([first, ...continuation].join("\n"))}
											showCode={showCode}
										/>
									) : (
										<InlineMarkdown text={first ?? ""} />
									)}
								</li>
							))}
						</List>
					);
				}
				if (block.type === "table") {
					return (
						<table key={key} className="foundation-table">
							<thead>
								<tr>
									{block.headers.map((cell) => (
										<th key={cell} scope="col">
											<InlineMarkdown text={cell} />
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{block.rows.map((row) => (
									<tr key={row.join("|")}>
										{row.map((cell, columnIndex) => (
											<td key={block.headers[columnIndex]}>
												<InlineMarkdown text={cell} />
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					);
				}
				if (block.type === "rule") return <hr key={key} />;
				if (block.type === "code" && showCode)
					return (
						<pre key={key}>
							<code>{block.text}</code>
						</pre>
					);
				return null;
			})}
		</>
	);
}

export function MarkdownProse({
	markdown,
	showCode = false,
	omitTitle = false,
}: {
	markdown: string;
	showCode?: boolean;
	omitTitle?: boolean;
}) {
	const blocks = parseMarkdown(markdown);
	if (omitTitle && blocks[0]?.type === "heading" && blocks[0].level === 1) blocks.shift();
	return <ProseBlocks blocks={blocks} showCode={showCode} />;
}

export function MarkdownDocument({ markdown, labels }: { markdown: string; labels: MarkdownLabels }) {
	const blocks = parseMarkdown(markdown).filter((block) => !(block.type === "heading" && block.level === 1));
	const descriptionIndex = blocks.findIndex((block) => block.type === "paragraph");
	const description = descriptionIndex >= 0 ? blocks[descriptionIndex] : undefined;
	const props = blocks.filter((block, index) => index !== descriptionIndex && block.type !== "code");
	const usage = blocks.filter((block): block is Extract<MarkdownBlock, { type: "code" }> => block.type === "code");

	return (
		<div className="markdown-document">
			<section aria-label={labels.description}>
				<h2>{labels.description}</h2>
				{description?.type === "paragraph" ? (
					<p lang="en" dir="ltr">
						<InlineMarkdown text={description.text} />
					</p>
				) : null}
			</section>
			<section aria-label={labels.props}>
				<h2>{labels.props}</h2>
				{/* Component docs are written in English; keep them left-to-right on Arabic pages. */}
				<div lang="en" dir="ltr">
					<ProseBlocks blocks={props} headingOffset={1} />
				</div>
			</section>
			{usage.length > 0 && (
				<section aria-label={labels.usage}>
					<h2>{labels.usage}</h2>
					{usage.map((block) => (
						<div className="copyable-code" key={`${block.language}-${block.text}`}>
							<div className="copyable-code__header">
								<span>{block.language || labels.codeLabel}</span>
								<CopyCodeButton
									code={block.text}
									copyLabel={labels.copy}
									copiedLabel={labels.copied}
									failedLabel={labels.copyFailed}
								/>
							</div>
							<pre>
								<code>{block.text}</code>
							</pre>
						</div>
					))}
				</section>
			)}
		</div>
	);
}
