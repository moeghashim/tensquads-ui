import { AGENT_LOOP_STATES, SQUADMATES } from "../../../packages/ui/src/squadmates/roster";
import type { Locale } from "./state";

const copy = {
	en: {
		eyebrow: "Design system · Reference",
		title: "Meet the squad",
		lead: "Thirteen squadmates, each named after a place and each shaped by it. Below, every squadmate in all ten Agent loop states.",
		counts: { squadmates: "squadmates", states: "states", drawings: "drawings" },
		instructions: "Hover or focus a squadmate to see its name and role.",
		jump: "Jump to the states",
	},
	ar: {
		eyebrow: "نظام التصميم · المرجع",
		title: "تعرّف على الفريق",
		lead: "ثلاثة عشر زميلًا، لكل منهم اسم مكان استلهمنا منه ملامحه. أدناه تجد كل زميل في حالات العمل العشر.",
		counts: { squadmates: "زميلًا", states: "حالات", drawings: "رسمًا" },
		instructions: "مرّر المؤشر فوق أحد الزملاء أو انتقل إليه بلوحة المفاتيح لترى اسمه ودوره.",
		jump: "انتقل إلى الحالات",
	},
} as const;

export function getMascotHeroCopy(locale: Locale) {
	const { counts, ...text } = copy[locale];
	const squadmates = SQUADMATES.length;
	const states = AGENT_LOOP_STATES.length + 1; // Include idle, as the gallery does.
	const format = new Intl.NumberFormat(locale === "ar" ? "ar-EG-u-nu-arab" : "en-US");
	const totals = { squadmates, states, drawings: squadmates * states };
	return {
		...text,
		counts: (["squadmates", "states", "drawings"] as const).map((key) => ({
			value: format.format(totals[key]),
			label: counts[key],
		})),
	};
}
