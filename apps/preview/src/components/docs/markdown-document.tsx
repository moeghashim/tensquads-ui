import { CopyCodeButton } from "../copy-code-button";

type MarkdownBlock =
	| { type: "heading"; level: number; text: string }
	| { type: "paragraph"; text: string }
	| { type: "code"; language: string; text: string }
	| { type: "list"; ordered: boolean; items: string[] };

type MarkdownLabels = {
	copy: string;
	copied: string;
	copyFailed: string;
	codeLabel: string;
	description: string;
	props: string;
	usage: string;
};

function parseMarkdown(markdown: string): MarkdownBlock[] {
	const lines = markdown.replaceAll("\r\n", "\n").split("\n");
	const blocks: MarkdownBlock[] = [];
	let index = 0;

	while (index < lines.length) {
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
			blocks.push({ type: "code", language: fence[1] ?? "", text: code.join("\n").trimEnd() });
			continue;
		}
		const heading = line.match(/^(#{1,6})\s+(.+)$/);
		if (heading) {
			blocks.push({ type: "heading", level: heading[1]?.length ?? 1, text: heading[2] ?? "" });
			index += 1;
			continue;
		}
		const listItem = line.match(/^\s*((?:[-*])|(?:\d+\.))\s+(.+)$/);
		if (listItem) {
			const ordered = listItem[1]?.endsWith(".") ?? false;
			const items: string[] = [];
			while (index < lines.length) {
				const item = lines[index]?.match(/^\s*((?:[-*])|(?:\d+\.))\s+(.+)$/);
				if (!item || (item[1]?.endsWith(".") ?? false) !== ordered) break;
				items.push(item[2] ?? "");
				index += 1;
			}
			blocks.push({ type: "list", ordered, items });
			continue;
		}
		const paragraph = [line.trim()];
		index += 1;
		while (
			index < lines.length &&
			lines[index]?.trim() &&
			!/^(#{1,6})\s|^```/.test(lines[index] ?? "") &&
			!/^\s*(?:[-*]|\d+\.)\s+/.test(lines[index] ?? "")
		) {
			paragraph.push(lines[index]?.trim() ?? "");
			index += 1;
		}
		blocks.push({ type: "paragraph", text: paragraph.join(" ") });
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

export function MarkdownDocument({ markdown, labels }: { markdown: string; labels: MarkdownLabels }) {
	const blocks = parseMarkdown(markdown).filter((block) => !(block.type === "heading" && block.level === 1));
	const descriptionIndex = blocks.findIndex((block) => block.type === "paragraph");
	const description = descriptionIndex >= 0 ? blocks[descriptionIndex] : undefined;
	const props = blocks.filter((block, index) => index !== descriptionIndex && block.type !== "code");
	const usage = blocks.filter((block): block is Extract<MarkdownBlock, { type: "code" }> => block.type === "code");
	const blockKey = (block: Exclude<MarkdownBlock, { type: "code" }>) =>
		block.type === "list" ? `${block.type}-${block.items.join("|")}` : `${block.type}-${block.text}`;

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
					{props.map((block) => {
						if (block.type === "heading") {
							const Heading = `h${Math.min(block.level + 1, 6)}` as "h2" | "h3" | "h4" | "h5" | "h6";
							return (
								<Heading key={blockKey(block)}>
									<InlineMarkdown text={block.text} />
								</Heading>
							);
						}
						if (block.type === "paragraph")
							return (
								<p key={blockKey(block)}>
									<InlineMarkdown text={block.text} />
								</p>
							);
						if (block.type === "list") {
							const List = block.ordered ? "ol" : "ul";
							return (
								<List key={blockKey(block)}>
									{block.items.map((item) => (
										<li key={item}>
											<InlineMarkdown text={item} />
										</li>
									))}
								</List>
							);
						}
						return null;
					})}
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
