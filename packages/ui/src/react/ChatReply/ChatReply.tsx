import type { ElementType, ReactNode } from "react";
import { TensquadsRenderer, type TensquadsRendererProps } from "../../openui/TensquadsRenderer.js";
import type { Locale } from "../../schemas/index.js";

type ReplyBlock = { kind: "markdown" | "openui"; value: ReactNode };

export type ChatReplyProps = {
	reply: string;
	locale?: Locale;
	onError?: TensquadsRendererProps["onError"];
} & Omit<TensquadsRendererProps, "stream" | "locale" | "onError">;

export function ChatReply({ reply, locale = "en", onError, ...rendererProps }: ChatReplyProps) {
	const blocks = renderBlocks(reply.replace(/\r\n?/g, "\n"), (stream, key) => (
		<div className="ts-chat-reply__openui" key={key}>
			<TensquadsRenderer {...rendererProps} stream={stream} locale={locale} onError={onError} />
		</div>
	));
	const groups: { kind: ReplyBlock["kind"]; values: ReactNode[] }[] = [];
	for (const block of blocks) {
		const previous = groups.at(-1);
		if (block.kind === "markdown" && previous?.kind === "markdown") previous.values.push(block.value);
		else groups.push({ kind: block.kind, values: [block.value] });
	}
	return (
		<div className="ts-chat-reply" dir="auto">
			{groups.map((group, index) =>
				group.kind === "markdown" ? (
					<div className="ts-chat-reply__markdown" key={`markdown-${index}`}>
						{group.values}
					</div>
				) : (
					group.values
				),
			)}
		</div>
	);
}

type Fence = { marker: string; info: string };
type Lines = { length: number; at(index: number): string | undefined };

function openingFence(line: string): Fence | undefined {
	const match = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
	if (!match || (match[1]?.startsWith("`") && match[2]?.includes("`"))) return undefined;
	return { marker: match[1] ?? "", info: (match[2] ?? "").trim() };
}

function closesFence(line: string, fence: Fence): boolean {
	const match = line.match(/^ {0,3}(`{3,}|~{3,})[ \t]*$/);
	return !!match && match[1]?.[0] === fence.marker[0] && (match[1]?.length ?? 0) >= fence.marker.length;
}

function readFence(lines: Lines, start: number, fence: Fence) {
	let end = start + 1;
	while (end < lines.length && !closesFence(lines.at(end) ?? "", fence)) end += 1;
	const indentation = lineIndent(lines.at(start) ?? "");
	const code: string[] = [];
	for (let index = start + 1; index < end; index += 1) code.push(removeIndent(lines.at(index) ?? "", indentation));
	return {
		value: code.join("\n"),
		end: Math.min(end + 1, lines.length),
	};
}

function lineIndent(line: string): number {
	return line.match(/^[ \t]*/)?.[0].replace(/\t/g, "    ").length ?? 0;
}

function removeIndent(line: string, amount: number): string {
	let index = 0;
	let removed = 0;
	while (index < line.length && removed < amount && /[ \t]/.test(line[index] ?? "")) {
		removed += line[index++] === "\t" ? 4 : 1;
	}
	return " ".repeat(Math.max(0, removed - amount)) + line.slice(index);
}

function listItem(line: string) {
	const match = line.match(/^[ \t]*([-*+]|\d+\.)([ \t]+)(.*)$/);
	if (!match) return undefined;
	const marker = match[1] ?? "";
	return {
		indent: lineIndent(line),
		contentIndent: lineIndent(line) + marker.length + lineIndent(match[2] ?? ""),
		ordered: /^\d/.test(marker),
		start: Number.parseInt(marker, 10),
		text: match[3] ?? "",
	};
}

function matchHeading(line: string) {
	return line.match(/^ {0,3}(#{1,6})\s+(.+?)(?:[ \t]+#+)?[ \t]*$/);
}

function isParagraphLine(line: string): boolean {
	return !!line.trim() && !openingFence(line) && !matchHeading(line) && !listItem(line);
}

function readListBody(lines: Lines, start: number, item: NonNullable<ReturnType<typeof listItem>>) {
	let firstContinuation = start + 1;
	while (firstContinuation < lines.length && !lines.at(firstContinuation)?.trim()) firstContinuation += 1;
	const indentation =
		openingFence(item.text) || listItem(item.text)
			? item.contentIndent
			: Math.min(item.contentIndent, lineIndent(lines.at(firstContinuation) ?? ""));
	const body: Lines = {
		length: lines.length - start,
		at(index) {
			if (index === 0) return item.text;
			const line = lines.at(start + index);
			return line === undefined ? undefined : removeIndent(line, indentation);
		},
	};
	let paragraph = false;
	function blockEnd(index: number): number {
		const line = body.at(index) ?? "";
		paragraph = isParagraphLine(line);
		const fence = openingFence(line);
		if (fence) return readFence(body, index, fence).end;
		const nested = listItem(line);
		if (nested) return readListBody(body, index, nested).end;
		return index + 1;
	}
	let end = blockEnd(0);
	while (end < body.length) {
		let next = end;
		while (next < body.length && !body.at(next)?.trim()) next += 1;
		if (next === body.length) {
			end = next;
			break;
		}
		const original = lines.at(start + next) ?? "";
		if (lineIndent(original) <= item.indent) {
			if (next === end && paragraph && isParagraphLine(body.at(next) ?? "")) {
				end = blockEnd(next);
				continue;
			}
			if (listItem(original)) end = next;
			break;
		}
		end = blockEnd(next);
	}
	return { lines: Array.from({ length: end }, (_, index) => body.at(index) ?? ""), end: start + end };
}

function renderBlocks(source: string, renderOpenUI: (stream: string, key: string) => ReactNode): ReplyBlock[] {
	const lines = source.split("\n");
	const lineAt = (lineIndex: number) => lines[lineIndex] ?? "";
	const nodes: ReplyBlock[] = [];
	let index = 0;
	const pendingFence = (lineIndex: number) => {
		const candidate = lineAt(lineIndex).replace(/^ {0,3}/, "");
		return lineIndex === lines.length - 1 && !!candidate && "```openui".startsWith(candidate);
	};
	function readList(first: NonNullable<ReturnType<typeof listItem>>): ReactNode {
		const key = `list-${index}`;
		const items: ReactNode[] = [];
		while (index < lines.length) {
			const item = listItem(lineAt(index));
			if (!item || item.indent !== first.indent || item.ordered !== first.ordered) break;
			const itemKey = `item-${index}`;
			const body = readListBody(lines, index, item);
			index = body.end;
			items.push(
				<li key={itemKey}>{renderBlocks(body.lines.join("\n"), renderOpenUI).map((block) => block.value)}</li>,
			);
		}
		return first.ordered ? (
			<ol key={key} start={first.start}>
				{items}
			</ol>
		) : (
			<ul key={key}>{items}</ul>
		);
	}
	while (index < lines.length) {
		const line = lineAt(index);
		if (!line.trim() || pendingFence(index)) {
			index += 1;
			continue;
		}
		const fence = openingFence(line);
		if (fence) {
			const key = `fence-${index}`;
			const block = readFence(lines, index, fence);
			index = block.end;
			if (fence.info === "openui" && fence.marker[0] === "`") {
				nodes.push({ kind: "openui", value: renderOpenUI(block.value, key) });
			} else {
				nodes.push({
					kind: "markdown",
					value: (
						<pre dir="ltr" key={key}>
							<code>{block.value}</code>
						</pre>
					),
				});
			}
			continue;
		}
		const heading = matchHeading(line);
		if (heading) {
			const Tag = `h${heading[1]?.length ?? 1}` as ElementType;
			nodes.push({ kind: "markdown", value: <Tag key={`heading-${index}`}>{inline(heading[2] ?? "")}</Tag> });
			index += 1;
			continue;
		}
		const list = listItem(line);
		if (list) {
			nodes.push({ kind: "markdown", value: readList(list) });
			continue;
		}
		const key = `paragraph-${index}`;
		const paragraph = [line.trim()];
		index += 1;
		while (
			index < lines.length &&
			isParagraphLine(lineAt(index)) &&
			!pendingFence(index)
		) {
			paragraph.push(lineAt(index++).trim());
		}
		nodes.push({ kind: "markdown", value: <p key={key}>{inline(paragraph.join(" "))}</p> });
	}
	return nodes;
}

function inline(source: string): ReactNode[] {
	const nodes: ReactNode[] = [];
	const token = /(`[^`]+`|\[([^\]]+)\]\(|\*\*([^*]+)\*\*)/g;
	let cursor = 0;
	for (let match = token.exec(source); match; match = token.exec(source)) {
		if (match.index > cursor) nodes.push(source.slice(cursor, match.index));
		if (match[1]?.startsWith("`")) nodes.push(<code key={match.index}>{match[1].slice(1, -1)}</code>);
		else if (match[2]) {
			const destination = linkDestination(source, token.lastIndex);
			if (!destination) {
				nodes.push(match[0]);
				cursor = token.lastIndex;
				continue;
			}
			token.lastIndex = destination.end;
			const href = safeHref(destination.value);
			nodes.push(
				href ? (
					<a key={match.index} href={href}>
						{match[2]}
					</a>
				) : (
					match[2]
				),
			);
		} else nodes.push(<strong key={match.index}>{match[3] ?? ""}</strong>);
		cursor = token.lastIndex;
	}
	if (cursor < source.length) nodes.push(source.slice(cursor));
	return nodes;
}

function linkDestination(source: string, start: number): { value: string; end: number } | undefined {
	let depth = 1;
	for (let index = start; index < source.length; index += 1) {
		const character = source[index];
		if (character === "\\") index += 1;
		else if (character === "(") depth += 1;
		else if (character === ")") {
			depth -= 1;
			if (depth === 0) {
				return { value: source.slice(start, index).replace(/\\([()\\])/g, "$1"), end: index + 1 };
			}
		}
	}
	return undefined;
}

function safeHref(value: string): string | undefined {
	try {
		const url = new URL(value);
		if (["http:", "https:", "mailto:"].includes(url.protocol)) {
			return value;
		}
	} catch {
		return undefined;
	}
	return undefined;
}
