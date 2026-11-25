export function link(label: string, href: string) {
	return `[${label}](${href})`;
}

export function item(label: string, href: string, description?: string) {
	return `- ${link(label, href)}${description ? `: ${description}` : ""}`;
}

export function code(value: string | number) {
	return `\`${value}\``;
}

export function fence(language: string, value: string) {
	return `\`\`\`${language}\n${value}\n\`\`\``;
}

export function heading(level: number, title: string) {
	return `${"#".repeat(level)} ${title}`;
}

export function blocks(...sections: string[]) {
	return sections.filter(Boolean).join("\n\n");
}

export function table(columns: string[], rows: (string | number)[][]) {
	const row = (cells: (string | number)[]) =>
		`| ${cells.map((cell) => String(cell).replaceAll("|", "\\|").replaceAll("\n", "<br>")).join(" | ")} |`;
	return [row(columns), row(columns.map(() => "---")), ...rows.map(row)].join("\n");
}
