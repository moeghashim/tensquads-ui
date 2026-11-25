import type { AgentSlug, WorkflowGraph, WorkflowNode, WorkflowNodeKind } from "@tensquads/ui/schemas";
import type { Locale } from "../../state";

export const workflowIds = ["support", "orders", "onboarding"] as const;
export type WorkflowId = (typeof workflowIds)[number];
export type StepSettings = { instructions: string; squadmate?: AgentSlug };
export type WorkflowDocument = { graph: WorkflowGraph; settings: Record<string, StepSettings> };

export function isWorkflowId(id: string): id is WorkflowId {
	return workflowIds.some((workflow) => workflow === id);
}

const names = {
	support: { en: "Support triage", ar: "فرز طلبات الدعم" },
	orders: { en: "Order review", ar: "مراجعة الطلبات" },
	onboarding: { en: "Store onboarding", ar: "تهيئة المتجر" },
};

const descriptions = {
	support: { en: "Route support requests by topic", ar: "توجيه طلبات الدعم حسب الموضوع" },
	orders: { en: "Review incoming orders", ar: "مراجعة الطلبات الواردة" },
	onboarding: { en: "Prepare a new store", ar: "إعداد متجر جديد" },
};

export function demoWorkflow(id: WorkflowId, locale: Locale) {
	const ar = locale === "ar";
	const node = (
		id: string,
		kind: WorkflowNodeKind,
		title: string,
		x: number,
		y: number,
		meta?: string,
		branches?: string[],
	): WorkflowNode => ({ id, kind, title, position: { x, y }, meta, branches });
	const start = node("start", "start", ar ? "البداية" : "Start", 292, 346);
	const end = node("end", "end", ar ? "النهاية" : "End", 948, 346);
	const support: WorkflowDocument = {
		graph: {
			nodes: [
				start,
				node(
					"classify",
					"classify",
					ar ? "تصنيف الطلب" : "Classify request",
					448,
					304,
					ar ? "منطق · تصنيف" : "Logic · classify",
					ar ? ["استرداد", "سؤال", "أخرى"] : ["Refund", "Question", "Other"],
				),
				node(
					"refund",
					"agent",
					ar ? "وكيل الاسترداد" : "Refund agent",
					700,
					240,
					ar ? "وكيل · بيزا" : "Agent · Pisa",
				),
				node(
					"faq",
					"agent",
					ar ? "إجابة من الأسئلة الشائعة" : "Answer from FAQ",
					700,
					346,
					ar ? "وكيل · دلفي" : "Agent · Delphi",
				),
				node(
					"approval",
					"user-approval",
					ar ? "طلب قرار بشري" : "Ask a person",
					700,
					458,
					ar ? "منطق · موافقة المستخدم" : "Logic · user approval",
				),
				end,
			],
			edges: [
				{ id: "start-classify", from: "start", to: "classify" },
				{ id: "classify-refund", from: "classify", fromPort: 0, to: "refund" },
				{ id: "classify-faq", from: "classify", fromPort: 1, to: "faq" },
				{ id: "classify-approval", from: "classify", fromPort: 2, to: "approval" },
				{ id: "refund-end", from: "refund", to: "end" },
				{ id: "faq-end", from: "faq", to: "end" },
				{ id: "approval-end", from: "approval", to: "end" },
			],
		},
		settings: {
			refund: {
				squadmate: "pisa",
				instructions: ar
					? "راجع الطلب ونفّذ عمليات الاسترداد حتى ٢٠ دولارًا، واطلب موافقة بشرية على أي مبلغ أكبر."
					: "Check the order, refund up to $20 on your own, and ask a person above that.",
			},
			faq: { squadmate: "delphi", instructions: ar ? "أجب من دليل الأسئلة الشائعة." : "Answer from the FAQ." },
		},
	};
	const orders = id === "orders";
	const middle = orders
		? node("review", "agent", ar ? "مراجعة الطلب" : "Review order", 500, 346, ar ? "وكيل · بيزا" : "Agent · Pisa")
		: node(
				"prepare",
				"set-state",
				ar ? "تهيئة الإعدادات" : "Prepare settings",
				500,
				346,
				ar ? "بيانات · تعيين الحالة" : "Data · set state",
			);
	const document: WorkflowDocument =
		id === "support"
			? support
			: {
					graph: {
						nodes: [start, middle, { ...end, position: { x: 765, y: 346 } }],
						edges: [
							{ id: "start-middle", from: "start", to: middle.id },
							{ id: "middle-end", from: middle.id, to: "end" },
						],
					},
					settings: orders ? { review: { squadmate: "pisa", instructions: "" } } : {},
				};
	const number = new Intl.NumberFormat(locale);
	return {
		id,
		name: names[id][locale],
		meta: descriptions[id][locale],
		status: orders ? ("live" as const) : ("draft" as const),
		document,
		initialSelection: id === "support" ? "refund" : middle.id,
		stats: [
			{ label: ar ? "التشغيل خلال ٧ أيام" : "Runs in 7 days", value: number.format(orders ? 24 : 0) },
			{
				label: ar ? "نسبة اجتياز التقييم" : "Grader pass rate",
				value: orders ? new Intl.NumberFormat(locale, { style: "percent" }).format(0.96) : "—",
			},
			{ label: ar ? "آخر تشغيل" : "Last run", value: orders ? (ar ? "أمس" : "Yesterday") : "—" },
		] as const,
	};
}

export type DemoWorkflow = ReturnType<typeof demoWorkflow>;
