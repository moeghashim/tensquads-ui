import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { siteCopy } from "../copy";
import { foundationNames, referenceSections } from "../reference";
import type { Direction, Locale, PreviewSearch } from "../state";

export { type FoundationName, foundationNames } from "../reference";

export const llmsUrl = "/llms.txt";

export function Arrow({ direction }: { direction: Direction }) {
	return <span aria-hidden="true">{direction === "rtl" ? "←" : "→"}</span>;
}

export function FoundationLinks({
	locale,
	direction,
	search,
	descriptions = false,
}: {
	locale: Locale;
	direction: Direction;
	search: PreviewSearch;
	descriptions?: boolean;
}) {
	const copy = siteCopy[locale].designSystem.foundationsIndex;
	return (
		<div className={descriptions ? "foundation-grid" : "design-links design-links--paired"}>
			{foundationNames.map((name) => (
				<Link key={name} to="/foundations/$name" params={{ name }} search={search}>
					<span>
						{copy[name].title}
						{descriptions && <small>{copy[name].lead}</small>}
					</span>
					<Arrow direction={direction} />
				</Link>
			))}
		</div>
	);
}

export function ReferenceIntro({ title, lead }: { title: string; lead: string }) {
	return (
		<header className="reference-intro">
			<div>
				<h1>{title}</h1>
				<p>{lead}</p>
			</div>
			<a className="reference-resource" href={llmsUrl}>
				llms.txt
			</a>
		</header>
	);
}

export function ReferenceLayout({ label, links, children }: { label: string; links: ReactNode; children: ReactNode }) {
	return (
		<div className="reference-layout">
			<nav className="reference-rail" aria-label={label}>
				<strong>{label}</strong>
				<div>{links}</div>
			</nav>
			<div className="reference-body">{children}</div>
		</div>
	);
}

export function DesignReferenceLinks({ locale, search }: { locale: Locale; search: PreviewSearch }) {
	const copy = siteCopy[locale].designSystem;
	return referenceSections.map(({ id, path }) => (
		<Link key={id} to={path} search={search}>
			{copy[id]}
		</Link>
	));
}

export function DesignReferenceLayout({
	locale,
	search,
	children,
}: {
	locale: Locale;
	search: PreviewSearch;
	children: ReactNode;
}) {
	return (
		<ReferenceLayout
			label={siteCopy[locale].designSystem.reference}
			links={<DesignReferenceLinks locale={locale} search={search} />}
		>
			{children}
		</ReferenceLayout>
	);
}
