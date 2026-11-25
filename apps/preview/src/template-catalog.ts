export const templates = {
	"app-shell": {
		file: "AppShell.tsx",
		en: { title: "App shell", description: "Lay out a workspace with side navigation and a content panel." },
		ar: { title: "هيكل التطبيق", description: "أنشئ مساحة عمل بقائمة جانبية ولوحة محتوى." },
	},
	dashboard: {
		file: "Dashboard.tsx",
		en: { title: "Dashboard", description: "Show headline metrics, a trend, a breakdown and recent activity." },
		ar: { title: "لوحة المؤشرات", description: "اعرض المؤشرات الرئيسية والاتجاهات وتوزيع العمل وآخر الأنشطة." },
	},
	list: {
		file: "List.tsx",
		en: {
			title: "List and table",
			description: "Make a set of records searchable and show an empty state when needed.",
		},
		ar: { title: "القائمة والجدول", description: "أتح البحث في السجلات واعرض حالة فارغة عند الحاجة." },
	},
	settings: {
		file: "Settings.tsx",
		en: { title: "Settings", description: "Show existing rules, a form to add a rule and workspace limits." },
		ar: { title: "الإعدادات", description: "اعرض القواعد الحالية ونموذج إضافة قاعدة وحدود مساحة العمل." },
	},
	chat: {
		file: "ChatPage.tsx",
		en: { title: "Chat", description: "Show a conversation with Petra, an inline form and squad hand-offs." },
		ar: { title: "المحادثة", description: "اعرض محادثة مع بترا ونموذجًا ضمن الرد والمهام المحالة إلى الفريق." },
	},
};

export type TemplateName = keyof typeof templates;
export const templateNames = Object.keys(templates) as TemplateName[];

export function isTemplate(name: string): name is TemplateName {
	return Object.hasOwn(templates, name);
}

export function templatePath(name: TemplateName) {
	return `templates/${name}`;
}

export const templateCopy = {
	en: {
		title: "Templates",
		lead: "Copy a page layout and its styles to start a tensquads screen.",
		files: "Template files",
		source: "Copy source",
		styles: "Copy styles",
		github: "View source on GitHub",
		copyFailed: "Could not copy. Open the Markdown page to select either file.",
		detail: "Build a detail page",
		detailBody: "Use the app shell for navigation, then add a page header, summary, key numbers and history.",
	},
	ar: {
		title: "القوالب",
		lead: "انسخ تخطيط الصفحة وأنماطها لتبدأ بناء شاشة لفريقك.",
		files: "ملفات القالب",
		source: "نسخ المصدر",
		styles: "نسخ الأنماط",
		github: "عرض المصدر على GitHub",
		copyFailed: "تعذّر النسخ. افتح صفحة Markdown لتحديد الملف المطلوب.",
		detail: "بناء صفحة تفاصيل",
		detailBody: "استخدم هيكل التطبيق للتنقّل، ثم أضف عنوان الصفحة والملخّص والمؤشرات الرئيسية والسجل.",
	},
};
