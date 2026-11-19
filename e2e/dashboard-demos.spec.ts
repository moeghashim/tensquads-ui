import { expect, test } from "@playwright/test";
import { capturePreviewScreenshots, expectAccessible, expectNoHorizontalScroll, openPreview } from "./helpers/preview";

test("admin dashboard filters companies and selects image details", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/dashboards/admin");
	await expect(page.getByRole("row")).toHaveCount(10);
	await expect(page.locator(".ts-bars__labels")).toContainText([
		"Growth4 companies · 27 squads",
		"Starter3 companies · 17 squads",
		"Scale2 companies · 22 squads",
	]);
	await expect(page.locator(".ts-bar-chart__segment").first()).toHaveClass(/segment--subtle/);
	await expect(page.locator(".ts-bar-chart__segment").last()).toHaveClass(/segment--strong/);
	const online = await page.getByRole("row").all();
	const onlineCounts = await Promise.all(online.slice(1).map((row) => row.getByRole("cell").last().textContent()));
	expect(onlineCounts.reduce((sum, value) => sum + Number.parseInt(value ?? "0", 10), 0)).toBe(53);
	await page.getByRole("button", { name: "Trial", exact: true }).click();
	await expect(page.getByRole("row")).toHaveCount(3);
	await page.getByRole("button", { name: "All", exact: true }).click();
	await page.getByRole("textbox", { name: "Search companies" }).fill("northstar");
	await expect(page.getByRole("row")).toHaveCount(2);
	await page.getByRole("textbox", { name: "Search companies" }).fill("no matching company");
	await expect(page.locator("[data-slot='empty-state']")).toBeVisible();
	await page.getByRole("button", { name: "Clear filters" }).click();
	await page.getByRole("button", { name: "Squad images" }).click();
	await expect(page).toHaveURL(/view=images/);
	await page.getByRole("button", { name: "With bugs" }).click();
	await expect(page.getByRole("row")).toHaveCount(5);
	await page.getByRole("button", { name: "All", exact: true }).click();
	await page.getByRole("row", { name: /registry\.agents\.example\/orders:1\.8\.2/ }).click();
	await expect(page.locator(".dashboard-details")).toContainText("registry.agents.example/orders:1.8.2");
	await expect(page.locator(".dashboard-stack .ts-card").nth(1).locator(".dashboard-inset-row")).toHaveCount(2);
	await expect(page.locator(".dashboard-stack .ts-card").nth(2).locator(".dashboard-inset-row")).toHaveCount(2);
	await page.getByRole("button", { name: "With requests" }).click();
	await expect(page.getByRole("row")).toHaveCount(6);
	await page.getByRole("row", { name: /registry\.agents\.example\/analytics:1\.1\.2/ }).click();
	await expect(page.locator(".dashboard-details")).toContainText("registry.agents.example/analytics:1.1.2");
	await expect(page.locator(".dashboard-stack .ts-card").nth(1)).toContainText("No open bugs");
	await expect(page.locator(".dashboard-stack .ts-card").nth(2).locator(".dashboard-inset-row")).toHaveCount(4);
	await expectAccessible(page);
	await expectNoHorizontalScroll(page);
});

for (const locale of ["en", "ar"] as const) {
	test(`admin image records and reference totals agree in ${locale}`, async ({ page }) => {
		await openPreview(
			page,
			{ locale, direction: locale === "ar" ? "rtl" : "ltr", theme: "light" },
			"/dashboards/admin",
		);
		await page.getByRole("button", { name: locale === "ar" ? "صور الفرق" : "Squad images" }).click();
		await expect(page.locator(".ts-stat-tile__value")).toHaveText(["7", "127", "8", "15", "4"]);
		await expect(page.locator(".ts-stat-tile__footer")).toHaveText(
			locale === "ar"
				? [
						"٣ مستقرة · ٢ تجريبية أو مسودة",
						"١٦ متأخرة عن أحدث إصدار",
						"خطآن بدرجة خطورة عالية",
						"٣ قيد التنفيذ",
						"من أصل ٧ صور",
					]
				: [
						"3 stable · 2 beta or draft",
						"16 behind the latest version",
						"2 high severity",
						"3 in progress",
						"of 7 images",
					],
		);
		const records = [
			[
				"orders",
				"Orders",
				"الطلبات",
				"Order processing and fulfillment",
				"معالجة الطلبات وتنفيذها",
				"6 hours ago",
				"منذ ٦ ساعات",
				34,
				2,
				2,
				"22 of 34 (65%)",
				"22 من 34 (65%)",
			],
			[
				"support",
				"Support",
				"الدعم",
				"Customer support and triage",
				"دعم العملاء وفرز الاستفسارات",
				"1 day ago",
				"منذ يوم واحد",
				21,
				2,
				3,
				"20 of 21 (95%)",
				"20 من 21 (95%)",
			],
			[
				"marketing",
				"Marketing",
				"التسويق",
				"Campaign planning and reporting",
				"تخطيط الحملات وإعداد التقارير",
				"2 days ago",
				"منذ يومين",
				18,
				2,
				3,
				"17 of 18 (94%)",
				"17 من 18 (94%)",
			],
			[
				"finance",
				"Finance",
				"المالية",
				"Payout reconciliation and reporting",
				"تسوية المدفوعات وإعداد التقارير",
				"5 days ago",
				"منذ ٥ أيام",
				15,
				0,
				3,
				"14 of 15 (93%)",
				"14 من 15 (93%)",
			],
			[
				"inventory",
				"Inventory",
				"المخزون",
				"Stock monitoring and replenishment",
				"مراقبة المخزون وتجديده",
				"9 days ago",
				"منذ ٩ أيام",
				14,
				2,
				0,
				"13 of 14 (93%)",
				"13 من 14 (93%)",
			],
			[
				"analytics",
				"Analytics",
				"التحليلات",
				"Store performance insights",
				"تحليل أداء المتجر",
				"16 days ago",
				"منذ ١٦ يوماً",
				13,
				0,
				4,
				"13 of 13 (100%)",
				"13 من 13 (100%)",
			],
			[
				"people",
				"People",
				"الموارد البشرية",
				"Hiring and team operations",
				"التوظيف وعمليات الفريق",
				"21 days ago",
				"منذ ٢١ يوماً",
				12,
				0,
				0,
				"12 of 12 (100%)",
				"12 من 12 (100%)",
			],
		] as const;
		for (const [id, name, nameAr, role, roleAr, age, ageAr, deployed, bugs, requests, latest, latestAr] of records) {
			const row = page.getByRole("row").filter({ hasText: `registry.agents.example/${id}:` });
			await expect(row.locator("strong")).toHaveText(locale === "ar" ? nameAr : name);
			await expect(row.getByRole("cell").nth(2)).toHaveText(locale === "ar" ? ageAr : age);
			await expect(row.getByRole("cell").nth(3)).toHaveText(String(deployed));
			await expect(row.getByRole("cell").nth(4)).toHaveText(String(bugs));
			await row.click();
			const cards = page.locator(".dashboard-stack .ts-card");
			await expect(cards.first().getByRole("heading")).toHaveText(locale === "ar" ? nameAr : name);
			await expect(cards.first().locator("p")).toHaveText(locale === "ar" ? roleAr : role);
			await expect(page.locator(".dashboard-details")).toContainText(locale === "ar" ? ageAr : age);
			await expect(page.locator(".dashboard-details")).toContainText(locale === "ar" ? latestAr : latest);
			await expect(cards.nth(1).locator(".dashboard-inset-row")).toHaveCount(bugs);
			await expect(cards.nth(2).locator(".dashboard-inset-row")).toHaveCount(requests);
			if (!bugs) await expect(cards.nth(1).locator(".dashboard-empty-line")).toBeVisible();
			if (!requests) await expect(cards.nth(2).locator(".dashboard-empty-line")).toBeVisible();
			for (const title of await cards.locator(".dashboard-inset-title strong").allTextContents()) {
				expect(title).toMatch(locale === "ar" ? /[\u0600-\u06ff]/ : /[A-Za-z]/);
			}
		}
		await page.getByRole("row").filter({ hasText: "registry.agents.example/orders:" }).click();
		await expect(page.locator(".dashboard-inset-title strong")).toHaveText(
			locale === "ar"
				? [
						"قد تؤدي إعادة المحاولة إلى تكرار الشحنة",
						"قد يتأخر تحديث الحالة بعد استرداد المبلغ",
						"إضافة دعم تقسيم الشحنات",
						"إضافة ملاحظات طلبات الهدايا",
					]
				: [
						"Retry can duplicate a shipment",
						"Status may lag after a refund",
						"Add split shipment support",
						"Add gift order notes",
					],
		);
	});
}

test("store approvals send a command and launcher preserves URL state", async ({ page }) => {
	await openPreview(page, { locale: "ar", direction: "rtl", theme: "dark" }, "/dashboards/home");
	await expect(page.getByRole("heading", { name: /Moe/ })).toBeVisible();
	await expect(page.getByRole("button", { name: "موافقة" }).first()).toBeEnabled();
	await page.getByRole("button", { name: "موافقة" }).first().click();
	await expect(page.getByRole("heading", { name: "تم إرسال أمر قرار الموافقة" })).toBeVisible();
	await expect(page.locator(".ts-card__count")).toHaveText("3");
	await expect(page.locator(".sent-command pre")).toContainText('"type": "ApprovalDecision"');
	await expectAccessible(page);
	await expectNoHorizontalScroll(page);
	await page.getByRole("button", { name: "اسأل بيترا" }).click();
	await expect(page).toHaveURL(/\/chat\?.*locale=ar.*dir=rtl.*theme=dark/);
});

for (const [locale, direction] of [
	["en", "ltr"],
	["ar", "rtl"],
] as const) {
	for (const theme of ["light", "dark"] as const) {
		for (const view of ["home", "companies", "images"] as const) {
			for (const width of [1440, 1180, 760, 390]) {
				test(`dashboard ${view} ${locale} ${theme} at ${width}px`, async ({ page }, testInfo) => {
					await page.setViewportSize({ width, height: 900 });
					await openPreview(
						page,
						{ locale, direction, theme },
						`/dashboards/${view === "home" ? "home" : "admin"}`,
					);
					if (view === "images") {
						if (width <= 760) {
							await expect(page.locator(".ts-sidebar-mobile-bar")).toContainText("Platform admin");
							await page
								.getByRole("button", { name: locale === "ar" ? "فتح التنقل" : "Open navigation" })
								.click();
						}
						await page.getByRole("button", { name: locale === "ar" ? "صور الفرق" : "Squad images" }).click();
						await expect(page).toHaveURL(/view=images/);
						await expect(page.getByRole("dialog")).toHaveCount(0);
						await expect(page.locator(".dashboard-details")).toContainText(
							locale === "ar" ? "منذ ٦ ساعات" : "6 hours ago",
						);
					}
					await expect(page.locator(".dashboard-panel h1")).toBeVisible();
					if (view === "companies") {
						await expect(page.locator(".ts-bars__labels")).toContainText(["Growth4", "Starter3", "Scale2"]);
					} else if (view === "home") {
						await expect(
							page.getByText(locale === "ar" ? "الأسبوع السابق" : "Previous week", { exact: true }),
						).toHaveCount(1);
						await expect(
							page.getByText(locale === "ar" ? "هذا الأسبوع" : "This week", { exact: true }),
						).toHaveCount(1);
					}
					await expectAccessible(page);
					const dimensions = await page.evaluate(() => ({
						viewport: document.documentElement.clientWidth,
						content: document.documentElement.scrollWidth,
					}));
					expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
					await capturePreviewScreenshots(page, testInfo, `dashboard-${view}-${locale}-${direction}-${theme}`, [
						width,
					]);
				});
			}
		}
	}
}

test("approval decisions survive language changes while pending content is translated", async ({ page }) => {
	await openPreview(page, { locale: "en", direction: "ltr", theme: "light" }, "/dashboards/home");
	await page.getByRole("button", { name: "Approve", exact: true }).first().click();
	await expect(page.locator(".ts-card__count")).toHaveText("3");
	await page.getByRole("radio", { name: "العربية", exact: true }).click();
	await expect(page.locator(".ts-approval-card__content")).toHaveText([
		"إبلاغ العميل بتحديث استبدال المنتج",
		"تقديم خصم ١٥٪ على الطلب التالي",
		"استرداد قيمة الطلب ١٠٨٨ بعد تكرار الدفع",
	]);
	await expect(page.locator(".ts-card__count")).toHaveText("3");
	await page.getByRole("button", { name: "رفض", exact: true }).first().click();
	await page.getByRole("radio", { name: "English", exact: true }).click();
	await expect(page.locator(".ts-approval-card__content")).toHaveText([
		"Offer a 15% discount on the next order",
		"Refund order 1088 after duplicate payment",
	]);
	await expect(page.locator(".ts-card__count")).toHaveText("2");
	await expect(page.locator(".sent-command pre")).toContainText('"decision": "reject"');
});
