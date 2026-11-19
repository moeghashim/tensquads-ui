import type { ReactNode } from "react";
import { Badge } from "../Badge/Badge.js";

export type DataTableColumn = { key: string; label: string; align?: "start" | "end"; width?: string; mono?: boolean };
export type DataTableRow = { id: string; cells: Record<string, string | ReactNode> };
export type DataTableProps = {
	caption: string;
	columns: DataTableColumn[];
	rows: DataTableRow[];
	selectedId?: string;
	onRowSelect?: (id: string) => void;
};

export function EntityCell({
	initials,
	name,
	detail,
	tint = "primary",
}: {
	initials: string;
	name: string;
	detail: string;
	tint?: "primary" | "success" | "warning" | "danger";
}) {
	return (
		<span className="ts-data-table__entity">
			<span className={`ts-data-table__tile ts-data-table__tile--${tint}`} aria-hidden="true">
				{initials}
			</span>
			<span className="ts-data-table__entity-copy">
				<strong>{name}</strong>
				<span title={detail}>{detail}</span>
			</span>
		</span>
	);
}

export function PersonCell({ name, email }: { name: string; email: string }) {
	return (
		<span className="ts-data-table__stack">
			<strong>{name}</strong>
			<span title={email}>{email}</span>
		</span>
	);
}

export function StackCell({ primary, secondary }: { primary: string; secondary: string }) {
	return (
		<span className="ts-data-table__stack">
			<strong>{primary}</strong>
			<span title={secondary}>{secondary}</span>
		</span>
	);
}

export function StatusCell({
	label,
	tone = "default",
}: {
	label: string;
	tone?: "default" | "success" | "warning" | "danger";
}) {
	return <Badge tone={tone}>{label}</Badge>;
}

export function DataTable({ caption, columns, rows, selectedId, onRowSelect }: DataTableProps) {
	return (
		<div className="ts-data-table__scroll">
			<table className="ts-data-table">
				<caption>{caption}</caption>
				<thead>
					<tr>
						{columns.map((column) => (
							<th
								key={column.key}
								scope="col"
								className={column.align === "end" ? "is-end" : undefined}
								style={column.width ? { inlineSize: column.width } : undefined}
							>
								{column.label}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr
							key={row.id}
							tabIndex={onRowSelect ? 0 : undefined}
							aria-selected={onRowSelect ? row.id === selectedId : undefined}
							className={row.id === selectedId ? "is-selected" : undefined}
							onClick={onRowSelect ? () => onRowSelect(row.id) : undefined}
							onKeyDown={
								onRowSelect
									? (event) => {
											if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
												event.preventDefault();
												onRowSelect(row.id);
											}
										}
									: undefined
							}
						>
							{columns.map((column) => (
								<td
									key={column.key}
									className={[column.align === "end" && "is-end", column.mono && "is-mono"]
										.filter(Boolean)
										.join(" ")}
								>
									{row.cells[column.key] ?? ""}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
