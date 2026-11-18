import { createFileRoute, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { getPreviewState, type Locale } from "../state";

const fixtureFiles = import.meta.glob("../../../../packages/ui/src/react/*/*.fixture.*.txt");
const components = [
	...new Set(
		Object.keys(fixtureFiles)
			.map((path) => path.split("/").at(-2))
			.filter((name): name is string => Boolean(name)),
	),
].sort();

export const Route = createFileRoute("/")({ component: GalleryPage });

function GalleryPage() {
	const search = useRouterState({ select: (state) => state.location.search as Record<string, unknown> });
	const navigate = useNavigate();
	const { locale, direction, theme } = getPreviewState(search);
	const update = (key: string, value: string) => navigate({ to: ".", search: { ...search, [key]: value } as never });

	return (
		<main className="gallery">
			<header className="gallery__header">
				<div>
					<p className="eyebrow">tensquads UI</p>
					<h1>{locale === "ar" ? "معرض المكوّنات" : "Component gallery"}</h1>
					<p className="intro">
						{locale === "ar"
							? "معاينة المكوّنات المشتركة."
							: "Preview shared components across locale and theme states."}
					</p>
				</div>
				<nav className="controls" aria-label={locale === "ar" ? "إعدادات المعاينة" : "Preview settings"}>
					<label>
						{locale === "ar" ? "اللغة" : "Locale"}
						<select
							value={locale}
							onChange={(event) => {
								const nextLocale = event.target.value as Locale;
								void navigate({
									to: ".",
									search: { ...search, locale: nextLocale, dir: nextLocale === "ar" ? "rtl" : "ltr" } as never,
								});
							}}
						>
							<option value="en">English</option>
							<option value="ar">العربية</option>
						</select>
					</label>
					<label>
						{locale === "ar" ? "الاتجاه" : "Direction"}
						<select value={direction} onChange={(event) => update("dir", event.target.value)}>
							<option value="ltr">LTR</option>
							<option value="rtl">RTL</option>
						</select>
					</label>
					<label>
						{locale === "ar" ? "السمة" : "Theme"}
						<select value={theme} onChange={(event) => update("theme", event.target.value)}>
							<option value="system">System</option>
							<option value="light">Light</option>
							<option value="dark">Dark</option>
						</select>
					</label>
				</nav>
			</header>
			<section className="component-list" aria-labelledby="components-title">
				<div className="section-heading">
					<h2 id="components-title">{locale === "ar" ? "المكوّنات" : "Components"}</h2>
					<span>{components.length}</span>
				</div>
				{components.map((name) => (
					<Link
						className="route-example"
						key={name}
						to="/components/$name"
						params={{ name }}
						search={{ locale, dir: direction, theme } as never}
					>
						{name}
					</Link>
				))}
			</section>
		</main>
	);
}
