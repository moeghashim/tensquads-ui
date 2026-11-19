import type { ReactNode } from "react";

export type EmptyStateProps = { title: string; description: string; action?: ReactNode; className?: string };
export function EmptyState({ title, description, action, className }: EmptyStateProps) {
	return (
		<div className={["ts-empty-state", className].filter(Boolean).join(" ")} data-slot="empty-state">
			<span className="ts-empty-state__glyph" aria-hidden="true">
				<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path
						d="M4 5.5h16v13H4zM8 9h8M8 13h5"
						stroke="currentColor"
						strokeWidth="1.7"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</span>
			<h3>{title}</h3>
			<p>{description}</p>
			{action}
		</div>
	);
}
