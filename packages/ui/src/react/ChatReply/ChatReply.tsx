import type { ElementType, ReactNode } from "react";
import { TensquadsRenderer, type TensquadsRendererProps } from "../../openui/TensquadsRenderer.js";
import type { Locale } from "../../schemas/index.js";

type ReplyPart = { kind: "markdown" | "openui"; value: string };

export type ChatReplyProps = {
	reply: string;
	locale?: Locale;
	onError?: TensquadsRendererProps["onError"];
} & Omit<TensquadsRendererProps, "stream" | "locale" | "onError">;

export function ChatReply({ reply, locale = "en", onError, ...rendererProps }: ChatReplyProps) {
	return (
		<div className="ts-chat-reply" dir="auto">
			{splitReply(reply).map((part, index) =>
				part.kind === "openui" ? (
					<div className="ts-chat-reply__openui" key={`openui-${index}`}>
						<TensquadsRenderer {...rendererProps} stream={part.value} locale={locale} onError={onError} />
					</div>
				) : (
					<MarkdownBlock key={`markdown-${index}`} source={part.value} />
				),
			)}
		</div>
	);
}

type Fence = { marker: string; info: string };

function openingFence(line: string): Fence | undefined {
	const match = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
	if (!match || (match[1]?.startsWith("`") && match[2]?.includes("`"))) return undefined;
	return { marker: match[1] ?? "", info: (match[2] ?? "").trim() };
}

function closesFence(line: string, fence: Fence): boolean {
	const match = line.match(/^ {0,3}(`{3,}|~{3,})[ \t]*$/);
	return !!match && match[1]?.[0] === fence.marker[0] && match[1].length >= fence.marker.length;
}

function readFence(lines: string[], start: number, fence: Fence) {
	let end = start + 1;
	while (end < lines.length && !closesFence(lines[end] ?? "", fence)) end += 1;
	return { value: lines.slice(start + 1, end).join("\n"), end: Math.min(end + 1, lines.length), open: end === lines.length };
}

function replyFences(lines: string[], offset = 0): { fence: Fence; start: number; end: number; value: string; open: boolean }[] {
	const fences: ReturnType<typeof replyFences> = [];
	let index = 0;
	while (index < lines.length) {
		const line = lines[index] ?? "";
		const fence = openingFence(line);
		if (fence) {
			const block = readFence(lines, index, fence);
			fences.push({ ...block, fence, start: offset + index, end: offset + block.end });
			index = block.end;
			continue;
		}
		const item = listItem(line);
		if (item) {
			const body = readListBody(lines, index, item);
			fences.push(...replyFences(body.lines, offset + index));
			index = body.end;
			continue;
		}
		index += 1;
	}
	return fences;
}

function splitReply(source: string): ReplyPart[] {
	const reply = source.replace(/\r\n?/g, "\n");
	const lines = reply.split("\n");
	const offsets = [0];
	for (const line of lines) offsets.push(Math.min((offsets.at(-1) ?? 0) + line.length + 1, reply.length));
	const fences = replyFences(lines);
	const parts: ReplyPart[] = [];
	let cursor = 0;
	for (const block of fences) {
		if (block.fence.info !== "openui" || block.fence.marker[0] !== "`") continue;
		const start = offsets[block.start] ?? reply.length;
		if (start > cursor) parts.push({ kind: "markdown", value: reply.slice(cursor, start) });
		parts.push({ kind: "openui", value: block.value });
		cursor = offsets[block.end] ?? reply.length;
	}
	let trailing = reply.slice(cursor);
	if (!fences.at(-1)?.open) {
		const lastLine = trailing.slice(trailing.lastIndexOf("\n") + 1);
		const candidate = lastLine.replace(/^ {0,3}/, "");
		if (candidate && "```openui".startsWith(candidate)) trailing = trailing.slice(0, -lastLine.length);
	}
	if (trailing) parts.push({ kind: "markdown", value: trailing });
	return parts;
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

function readListBody(lines: string[], start: number, item: NonNullable<ReturnType<typeof listItem>>) {
	const lineAt = (index: number) => lines[index] ?? "";
	const continuation: string[] = [];
	let end = start + 1;
	while (end < lines.length) {
		let next = end;
		while (next < lines.length && !lineAt(next).trim()) next += 1;
		if (next === lines.length) {
			while (end < lines.length) continuation.push(lineAt(end++));
			break;
		}
		if (lineIndent(lineAt(next)) <= item.indent) {
			if (listItem(lineAt(next))) end = next;
			break;
		}
		while (end <= next) continuation.push(lineAt(end++));
	}
	const firstContinuation = continuation.find((line) => line.trim());
	const indentation =
		openingFence(item.text) || listItem(item.text) ? item.contentIndent : lineIndent(firstContinuation ?? "");
	return { lines: [item.text, ...continuation.map((line) => removeIndent(line, indentation))], end };
}

function MarkdownBlock({ source }: { source: string }) {
	return <div className="ts-chat-reply__markdown">{markdown(source)}</div>;
}

function markdown(source: string): ReactNode[] {
	const lines = source.split("\n");
	const lineAt = (lineIndex: number) => lines[lineIndex] ?? "";
	const nodes: ReactNode[] = [];
	let index = 0;
	function readList(first: NonNullable<ReturnType<typeof listItem>>): ReactNode {
		const key = `list-${index}`;
		const items: ReactNode[] = [];
		while (index < lines.length) {
			const item = listItem(lineAt(index));
			if (!item || item.indent !== first.indent || item.ordered !== first.ordered) break;
			const itemKey = `item-${index}`;
			const body = readListBody(lines, index, item);
			index = body.end;
			items.push(<li key={itemKey}>{markdown(body.lines.join("\n"))}</li>);
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
		if (!line.trim()) {
			index += 1;
			continue;
		}
		const fence = openingFence(line);
		if (fence) {
			const block = readFence(lines, index, fence);
			index = block.end;
			nodes.push(
				<pre dir="ltr" key={`code-${index}`}>
					<code>{block.value}</code>
				</pre>,
			);
			continue;
		}
		const heading = line.match(/^(#{1,6})\s+(.+?)(?:[ \t]+#+)?[ \t]*$/);
		if (heading) {
			const Tag = `h${heading[1]?.length ?? 1}` as ElementType;
			nodes.push(<Tag key={`heading-${index}`}>{inline(heading[2] ?? "")}</Tag>);
			index += 1;
			continue;
		}
		const list = listItem(line);
		if (list) {
			nodes.push(readList(list));
			continue;
		}
		const paragraph = [line.trim()];
		index += 1;
		while (
			index < lines.length &&
			lineAt(index).trim() &&
			!/^#{1,6}\s/.test(lineAt(index)) &&
			!openingFence(lineAt(index)) &&
			!listItem(lineAt(index))
		) {
			paragraph.push(lineAt(index++).trim());
		}
		nodes.push(<p key={`paragraph-${index}`}>{inline(paragraph.join(" "))}</p>);
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
