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

function splitReply(source: string): ReplyPart[] {
	const reply = source.replace(/\r\n?/g, "\n");
	const parts: ReplyPart[] = [];
	let cursor = 0;
	let offset = 0;
	let fence: Fence | undefined;
	let openui = false;
	for (const line of reply.split("\n")) {
		const next = Math.min(offset + line.length + 1, reply.length);
		if (fence) {
			if (closesFence(line, fence)) {
				if (openui) {
					parts.push({ kind: "openui", value: reply.slice(cursor, offset) });
					cursor = next;
				}
				fence = undefined;
				openui = false;
			}
		} else {
			fence = openingFence(line);
			openui = !!fence && fence.info === "openui" && fence.marker[0] === "`";
			if (openui) {
				if (offset > cursor) parts.push({ kind: "markdown", value: reply.slice(cursor, offset) });
				cursor = next;
			}
		}
		offset = next;
	}
	if (openui) {
		parts.push({ kind: "openui", value: reply.slice(cursor) });
		return parts;
	}
	let trailing = reply.slice(cursor);
	if (!fence) {
		const lastLine = trailing.slice(trailing.lastIndexOf("\n") + 1);
		const candidate = lastLine.replace(/^ {0,3}/, "");
		if (candidate && "```openui".startsWith(candidate)) trailing = trailing.slice(0, -lastLine.length);
	}
	if (trailing) parts.push({ kind: "markdown", value: trailing });
	return parts;
}

function listItem(line: string) {
	const match = line.match(/^(\s*)([-*+]|\d+\.)[ \t]+(.*)$/);
	if (!match) return undefined;
	const marker = match[2] ?? "";
	return {
		indent: (match[1] ?? "").replace(/\t/g, "    ").length,
		ordered: /^\d/.test(marker),
		start: Number.parseInt(marker, 10),
		text: match[3] ?? "",
	};
}

function MarkdownBlock({ source }: { source: string }) {
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
			const children: ReactNode[] = [];
			index += 1;
			let child = listItem(lineAt(index));
			while (child && child.indent > first.indent) {
				children.push(readList(child));
				child = listItem(lineAt(index));
			}
			items.push(
				<li key={itemKey}>
					{inline(item.text)}
					{children}
				</li>,
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
		if (!line.trim()) {
			index += 1;
			continue;
		}
		const fence = openingFence(line);
		if (fence) {
			const code: string[] = [];
			index += 1;
			while (index < lines.length && !closesFence(lineAt(index), fence)) code.push(lineAt(index++));
			if (index < lines.length) index += 1;
			nodes.push(
				<pre dir="ltr" key={`code-${index}`}>
					<code>{code.join("\n")}</code>
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
	return <div className="ts-chat-reply__markdown">{nodes}</div>;
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
