import { TensquadsRenderer } from "@tensquads/ui/openui";
import { Canvas, MiniMap, WorkflowCard, type WorkflowCardAction, type WorkflowCardProps } from "@tensquads/ui/react";
import type { WorkflowGraph } from "@tensquads/ui/schemas";
import { useState } from "react";
import type { Direction, Locale } from "../state";

function sampleGraph(locale: Locale): WorkflowGraph {
	const ar = locale === "ar";
	return {
		nodes: [
			{ id: "start", kind: "start", title: ar ? "البداية" : "Start", position: { x: 24, y: 84 } },
			{ id: "review", kind: "agent", title: ar ? "مراجعة الطلب" : "Review order", position: { x: 256, y: 84 } },
			{ id: "route", kind: "transform", title: ar ? "تجهيز الرد" : "Prepare reply", position: { x: 544, y: 180 } },
			{ id: "end", kind: "end", title: ar ? "النهاية" : "End", position: { x: 936, y: 180 } },
		],
		edges: [
			{ id: "start-review", from: "start", to: "review" },
			{ id: "review-route", from: "review", to: "route" },
			{ id: "route-end", from: "route", to: "end" },
		],
	};
}

export function MiniMapExample({
	locale,
	direction,
	specimen,
}: {
	locale: Locale;
	direction: Direction;
	specimen?: boolean;
}) {
	const ar = locale === "ar";
	const graph = sampleGraph(locale);
	const large = ar ? "مخطط كبير" : "Large graph";
	const small = ar ? "مخطط صغير" : "Small graph";
	return (
		<div className={specimen ? "minimap-preview minimap-preview--specimen" : "minimap-preview"}>
			<div className="minimap-preview__surface">
				<Canvas graph={graph} label={large} locale={locale} dir={direction}>
					<MiniMap placement={specimen ? "end" : "start"} />
				</Canvas>
			</div>
			{!specimen && (
				<div className="minimap-preview__small">
					<Canvas
						graph={{ nodes: graph.nodes.slice(0, 1), edges: [] }}
						label={small}
						locale={locale}
						dir={direction}
					>
						<MiniMap />
					</Canvas>
				</div>
			)}
		</div>
	);
}

const actionLabels: Record<Locale, Record<WorkflowCardAction, string>> = {
	en: { open: "Open", duplicate: "Duplicate", publish: "Publish", unpublish: "Unpublish", delete: "Delete" },
	ar: { open: "فتح", duplicate: "إنشاء نسخة", publish: "نشر", unpublish: "إلغاء النشر", delete: "حذف" },
};

export function WorkflowCardExample({ locale, stream }: { locale: Locale; stream: string | null }) {
	const ar = locale === "ar";
	const graph = sampleGraph(locale);
	const [action, setAction] = useState<WorkflowCardAction | null>(null);
	const labels = ar
		? ["التشغيل في ٧ أيام", "نسبة اجتياز التقييم", "آخر تشغيل"]
		: ["Runs in 7 days", "Grader pass rate", "Last run"];
	const statsFor = (runs: string, rate: string, last: string): WorkflowCardProps["stats"] => [
		{ label: labels[0]!, value: runs },
		{ label: labels[1]!, value: rate },
		{ label: labels[2]!, value: last },
	];
	return (
		<div className="workflow-card-preview">
			<div className="workflow-card-preview__grid">
				<WorkflowCard
					name={ar ? "مراجعة الطلبات" : "Order review"}
					status="live"
					meta={ar ? "عمليات المتجر" : "Store operations"}
					stats={statsFor(ar ? "٢٤" : "24", ar ? "٩٨٪" : "98%", ar ? "اليوم" : "Today")}
					graph={graph}
					locale={locale}
					href="#order-review"
					onAction={setAction}
				/>
				<WorkflowCard
					name={ar ? "تحديث الكتالوج" : "Catalog update"}
					status="draft"
					meta={ar ? "إدارة المنتجات" : "Product management"}
					stats={statsFor(ar ? "٣" : "3", ar ? "٩٠٪" : "90%", ar ? "أمس" : "Yesterday")}
					graph={{ nodes: graph.nodes.slice(0, 2), edges: graph.edges.slice(0, 1) }}
					locale={locale}
					href="#catalog-update"
					onAction={setAction}
				/>
				<WorkflowCard
					name={ar ? "متابعة الشحن" : "Shipment follow-up"}
					status="draft"
					meta={ar ? "سير عمل جديد" : "New workflow"}
					stats={statsFor(ar ? "٠" : "0", "—", "—")}
					graph={{ nodes: [], edges: [] }}
					locale={locale}
					href="#shipment-follow-up"
					onAction={setAction}
				/>
			</div>
			{action && (
				<p role="status">
					{ar ? "إجراء المعاينة" : "Preview action"} · {actionLabels[locale][action]}
				</p>
			)}
			<section className="component-list" aria-label={ar ? "عينة OpenUI" : "OpenUI fixture"}>
				<TensquadsRenderer stream={stream} locale={locale} />
			</section>
		</div>
	);
}
