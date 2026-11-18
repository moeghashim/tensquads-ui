import type { ElementType, ReactNode } from "react";
import { TensquadsRenderer, type TensquadsRendererProps } from "../../openui/TensquadsRenderer.js";
import type { Locale } from "../../schemas/index.js";

type ReplyPart = { kind: "markdown" | "openui"; value: string; open?: boolean };

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

function splitReply(reply: string): ReplyPart[] {
	const parts: ReplyPart[] = [];
	let cursor = 0;
	const fence = /(^|\n)```openui[ \t]*\r?\n/gm;
	for (let match = fence.exec(reply); match; match = fence.exec(reply)) {
		const start = match.index + (match[1]?.length ?? 0);
		if (start > cursor) parts.push({ kind: "markdown", value: reply.slice(cursor, start) });
		const bodyStart = fence.lastIndex;
		const close = /(^|\n)```[ \t]*(?:\r?\n|$)/gm;
		close.lastIndex = bodyStart;
		const end = close.exec(reply);
		if (end) {
			const closeStart = end.index + (end[1]?.length ?? 0);
			parts.push({ kind: "openui", value: reply.slice(bodyStart, closeStart) });
			cursor = close.lastIndex;
			fence.lastIndex = cursor;
		} else {
			parts.push({ kind: "openui", value: reply.slice(bodyStart), open: true });
			return parts;
		}
	}
	const trailing = reply.slice(cursor);
	const opening = "```openui";
	let hold = 0;
	for (let length = 1; length <= opening.length; length += 1) {
		const suffix = trailing.slice(-length);
		if ((suffix === opening.slice(0, length) || suffix === `\n${opening.slice(0, length)}`) && length > hold) {
			hold = length;
		}
	}
	if (/(?:^|\n)`{1,2}$/.test(trailing)) hold = Math.max(hold, trailing.match(/`{1,2}$/)?.[0].length ?? 0);
	if (trailing.length > hold) parts.push({ kind: "markdown", value: trailing.slice(0, trailing.length - hold) });
	return parts;
}

function MarkdownBlock({ source }: { source: string }) {
	const lines = source.replace(/\r\n?/g, "\n").split("\n");
	const lineAt = (lineIndex: number) => lines[lineIndex] ?? "";
	const nodes: ReactNode[] = [];
	let index = 0;
	while (index < lines.length) {
		const line = lineAt(index);
		if (!line.trim()) {
			index += 1;
			continue;
		}
		const fence = line.match(/^```([^`]*)$/);
		if (fence) {
			const code: string[] = [];
			index += 1;
			while (index < lines.length && !/^```\s*$/.test(lineAt(index))) code.push(lineAt(index++));
			if (index < lines.length) index += 1;
			nodes.push(
				<pre dir="ltr" key={`code-${index}`}>
					<code>{code.join("\n")}</code>
				</pre>,
			);
			continue;
		}
		const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
		if (heading) {
			const Tag = `h${heading[1]?.length ?? 1}` as ElementType;
			nodes.push(<Tag key={`heading-${index}`}>{inline(heading[2] ?? "")}</Tag>);
			index += 1;
			continue;
		}
		const list = line.match(/^\s*([-*+] |\d+\. )(.*)$/);
		if (list) {
			const ordered = /^\d/.test(list[1] ?? "");
			const items: ReactNode[] = [];
			while (index < lines.length) {
				const item = lineAt(index).match(/^\s*([-*+] |\d+\. )(.*)$/);
				if (!item || /^\d/.test(item[1] ?? "") !== ordered) break;
				items.push(<li key={`item-${index}`}>{inline(item[2] ?? "")}</li>);
				index += 1;
			}
			const List = ordered ? "ol" : "ul";
			nodes.push(<List key={`list-${index}`}>{items}</List>);
			continue;
		}
		const paragraph = [line.trim()];
		index += 1;
		while (
			index < lines.length &&
			lineAt(index).trim() &&
			!/^(#{1,6}\s|```|\s*([-*+] |\d+\. ))/.test(lineAt(index))
		) {
			paragraph.push(lineAt(index++).trim());
		}
		nodes.push(<p key={`paragraph-${index}`}>{inline(paragraph.join(" "))}</p>);
	}
	return <div className="ts-chat-reply__markdown">{nodes}</div>;
}

function inline(source: string): ReactNode[] {
	const nodes: ReactNode[] = [];
	const token = /(`[^`]+`|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*)/g;
	let cursor = 0;
	for (let match = token.exec(source); match; match = token.exec(source)) {
		if (match.index > cursor) nodes.push(source.slice(cursor, match.index));
		if (match[1]?.startsWith("`")) nodes.push(<code key={match.index}>{match[1].slice(1, -1)}</code>);
		else if (match[2]) {
			const href = safeHref(match[3] ?? "");
			nodes.push(
				href ? (
					<a key={match.index} href={href}>
						{match[2]}
					</a>
				) : (
					match[2]
				),
			);
		} else nodes.push(<strong key={match.index}>{match[4] ?? ""}</strong>);
		cursor = token.lastIndex;
	}
	if (cursor < source.length) nodes.push(source.slice(cursor));
	return nodes;
}

function safeHref(value: string): string | undefined {
	try {
		const url = new URL(value, "https://invalid.local");
		if (
			["http:", "https:", "mailto:"].includes(url.protocol) &&
			(value.startsWith("/") || /^[a-z][a-z\d+.-]*:/i.test(value))
		) {
			return value;
		}
	} catch {
		return undefined;
	}
	return undefined;
}
