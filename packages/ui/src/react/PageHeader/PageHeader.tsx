import type { ComponentProps, ReactNode } from "react";

export type PageHeaderProps = ComponentProps<"header"> & {
	title: ReactNode;
	subtitle?: ReactNode;
	actions?: ReactNode;
	meta?: ReactNode;
	headingLevel?: 1 | 2;
};

export function PageHeader({ title, subtitle, actions, meta, headingLevel = 1, className, ...props }: PageHeaderProps) {
	const Title = `h${headingLevel}` as const;
	return (
		<header {...props} data-slot="page-header" className={["ts-page-header", className].filter(Boolean).join(" ")}>
			<div className="ts-page-header__main">
				<div className="ts-page-header__copy">
					<Title className="ts-page-header__title">{title}</Title>
					{subtitle && <p className="ts-page-header__subtitle">{subtitle}</p>}
				</div>
				{actions && (
					<div className="ts-page-header__actions" data-slot="page-header-actions">
						{actions}
					</div>
				)}
			</div>
			{meta && (
				<div className="ts-page-header__meta" data-slot="page-header-meta">
					{meta}
				</div>
			)}
		</header>
	);
}
