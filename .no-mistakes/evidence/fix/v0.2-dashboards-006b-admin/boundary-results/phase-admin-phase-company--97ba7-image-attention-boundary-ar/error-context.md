# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase-admin.spec.ts >> phase company filters and image attention boundary ar
- Location: ../../worktrees/383d5bb0a3fa/01M7TR2K5KB9FWFR7D5HNWYW27/e2e/phase-admin.spec.ts:4:2

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'صور الفرق', exact: true })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - link "tensquads" [ref=e5] [cursor=pointer]:
        - /url: /?locale=ar&dir=rtl&theme=dark
      - generic [ref=e11]: ui
    - navigation "التنقل الرئيسي" [ref=e12]:
      - link "الرئيسية" [ref=e13] [cursor=pointer]:
        - /url: /?locale=ar&dir=rtl&theme=dark
      - link "المكوّنات" [ref=e14] [cursor=pointer]:
        - /url: /components?locale=ar&dir=rtl&theme=dark
      - link "عرض المحادثة" [ref=e15] [cursor=pointer]:
        - /url: /chat?locale=ar&dir=rtl&theme=dark
      - link "لوحات المعلومات" [ref=e16] [cursor=pointer]:
        - /url: /dashboards/home?locale=ar&dir=rtl&theme=dark
      - link "البدء" [ref=e17] [cursor=pointer]:
        - /url: /get-started?locale=ar&dir=rtl&theme=dark
    - generic [ref=e18]:
      - radiogroup "اللغة" [ref=e19]:
        - radio "English" [ref=e20] [cursor=pointer]
        - radio [aria-hidden]
        - radio "العربية" [checked] [ref=e21] [cursor=pointer]
        - radio [checked] [aria-hidden]
      - radiogroup "السمة" [ref=e22]:
        - radio "فاتحة" [ref=e23] [cursor=pointer]
        - radio [aria-hidden]
        - radio "داكنة" [checked] [ref=e24] [cursor=pointer]
        - radio [checked] [aria-hidden]
        - radio "النظام" [ref=e25] [cursor=pointer]
        - radio [aria-hidden]
  - main [ref=e26]:
    - generic [ref=e27]:
      - navigation "Platform admin" [ref=e29]:
        - generic [ref=e34]:
          - strong [ref=e35]: Platform admin
          - generic [ref=e36]: مساحة العمل
        - generic [ref=e37]:
          - heading "مساحة العمل" [level=2] [ref=e38]
          - generic [ref=e39]:
            - button "الشركات" [ref=e40] [cursor=pointer]
            - button "صور الفرق 2" [ref=e45] [cursor=pointer]:
              - generic [ref=e49]: صور الفرق
              - generic [ref=e50]: "2"
        - generic [ref=e51]:
          - heading "قريبًا" [level=2] [ref=e52]
          - generic [ref=e53]:
            - generic [ref=e54]: الاستخدام والفوترة
            - generic [ref=e59]: حالة المنصة
            - generic [ref=e64]: المشرفون
        - generic [ref=e69]:
          - generic [aria-hidden] [ref=e70]: MG
          - generic [ref=e71]:
            - strong [ref=e72]: Moe Ghashim
            - generic [ref=e73]: مشرف المنصة
      - generic [ref=e74]:
        - generic [ref=e75]:
          - generic [ref=e77]:
            - heading "الشركات" [level=1] [ref=e78]
            - paragraph [ref=e79]: عرض الشركات والفرق ونشاط المنصة
          - generic [ref=e80]:
            - generic [ref=e81]: بيانات تجريبية
            - generic [ref=e82]: ٥٣ فريقًا متصلًا الآن
        - generic [ref=e83]:
          - article [ref=e84]:
            - generic [ref=e85]: الشركات
            - generic [ref=e87]: "9"
            - generic [ref=e90]: +١ خلال الأسبوعين الماضيين
          - article [ref=e92]:
            - generic [ref=e93]: الشركات النشطة
            - generic [ref=e95]: "6"
            - generic [ref=e98]: ٢ تجريبية · ١ متوقفة
          - article [ref=e100]:
            - generic [ref=e101]: الفرق
            - generic [ref=e103]: "66"
            - generic [ref=e106]: ٥٣ متصلة الآن
          - article [ref=e108]:
            - generic [ref=e109]: المهام المنجزة ٧ أيام
            - generic [ref=e111]: 4,765
            - generic [ref=e114]: +٩٪ مقارنة بالأسبوع الماضي
          - article [ref=e116]:
            - generic [ref=e117]: الإيراد الشهري
            - generic [ref=e119]: $1,294
            - generic [ref=e122]: ٦ شركات تدفع
          - article [ref=e124]:
            - generic [ref=e125]: القيمة الإجمالية
            - generic [ref=e127]: $14,568
            - generic [ref=e130]: متوسط ٢٬٠٨١ دولاراً لكل شركة تدفع
        - generic [ref=e132]:
          - generic [ref=e133]:
            - generic [ref=e135]:
              - heading "الشركات المضافة خلال ٨ أسابيع" [level=2] [ref=e137]
              - paragraph [ref=e138]: حسابات الشركات الجديدة
            - generic [ref=e140]:
              - paragraph [ref=e141]: "الشركات المضافة خلال آخر ٨ أسابيع: الأسبوع 1: 4, الأسبوع 2: 5, الأسبوع 3: 4, الأسبوع 4: 7, الأسبوع 5: 6, الأسبوع 6: 8, الأسبوع 7: 9, الأسبوع 8: 11"
              - generic [ref=e142]:
                - generic [ref=e143]:
                  - generic [ref=e144]: "11"
                  - generic [ref=e146]: "5.5"
                  - generic [ref=e148]: "0"
                  - generic [ref=e150]:
                    - 'button "الأسبوع 1: 4" [ref=e151] [cursor=pointer]'
                    - 'button "الأسبوع 2: 5" [ref=e154] [cursor=pointer]'
                    - 'button "الأسبوع 3: 4" [ref=e157] [cursor=pointer]'
                    - 'button "الأسبوع 4: 7" [ref=e160] [cursor=pointer]'
                    - 'button "الأسبوع 5: 6" [ref=e163] [cursor=pointer]'
                    - 'button "الأسبوع 6: 8" [ref=e166] [cursor=pointer]'
                    - 'button "الأسبوع 7: 9" [ref=e169] [cursor=pointer]'
                    - 'button "الأسبوع 8: 11" [ref=e172] [cursor=pointer]'
                - generic [aria-hidden] [ref=e175]:
                  - generic [ref=e176]: الأسبوع 1
                  - generic [ref=e177]: الأسبوع 2
                  - generic [ref=e178]: الأسبوع 3
                  - generic [ref=e179]: الأسبوع 4
                  - generic [ref=e180]: الأسبوع 5
                  - generic [ref=e181]: الأسبوع 6
                  - generic [ref=e182]: الأسبوع 7
                  - generic [ref=e183]: الأسبوع 8
          - generic [ref=e184]:
            - generic [ref=e186]:
              - heading "الشركات حسب الخطة" [level=2] [ref=e188]
              - paragraph [ref=e189]: توزيع الخطط الحالي
            - generic [ref=e191]:
              - list [ref=e192]:
                - listitem [ref=e193]:
                  - generic [ref=e194]:
                    - generic [ref=e195]: Growth
                    - generic [ref=e196]: 4 شركات · 27 فرق
                  - 'generic "Growth: 4 شركات · 27 فرق" [ref=e197]'
                - listitem [ref=e199]:
                  - generic [ref=e200]:
                    - generic [ref=e201]: Starter
                    - generic [ref=e202]: 3 شركات · 17 فرق
                  - 'generic "Starter: 3 شركات · 17 فرق" [ref=e203]'
                - listitem [ref=e205]:
                  - generic [ref=e206]:
                    - generic [ref=e207]: Scale
                    - generic [ref=e208]: 2 شركات · 22 فرق
                  - 'generic "Scale: 2 شركات · 22 فرق" [ref=e209]'
              - paragraph [ref=e211]: متوسط ٧٫٣ فرق لكل شركة
        - generic [ref=e212]:
          - generic [ref=e213]:
            - generic [ref=e214]:
              - heading "جميع الشركات" [level=2] [ref=e216]
              - paragraph [ref=e217]: حسابات الشركات على المنصة
            - generic [ref=e220]:
              - textbox "البحث عن الشركات" [active] [ref=e221]:
                - /placeholder: بحث
                - text: أميرة
              - button "الكل" [ref=e222] [cursor=pointer]
              - button "نشطة" [ref=e223] [cursor=pointer]
              - button "تجريبية" [ref=e224] [cursor=pointer]
              - button "متوقفة" [ref=e225] [cursor=pointer]
          - generic "جميع الشركات" [ref=e227]:
            - table [ref=e228]:
              - caption [ref=e229]: جميع الشركات
              - rowgroup [ref=e230]:
                - row [ref=e231]:
                  - columnheader "الشركة والمهمة" [ref=e232]
                  - columnheader "المالك" [ref=e233]
                  - columnheader "الخطة" [ref=e234]
                  - columnheader "الاشتراك" [ref=e235]
                  - columnheader "تاريخ البدء" [ref=e236]
                  - columnheader "القيمة الإجمالية" [ref=e237]
                  - columnheader "الفرق" [ref=e238]
                  - columnheader "متصل" [ref=e239]
              - rowgroup [ref=e240]:
                - row [ref=e241]:
                  - cell "Northstar Goods مستلزمات يومية للرحلات الخارجية" [ref=e242]:
                    - generic [ref=e243]:
                      - generic [aria-hidden] [ref=e244]: "No"
                      - generic [ref=e245]:
                        - strong [ref=e246]: Northstar Goods
                        - generic "مستلزمات يومية للرحلات الخارجية" [ref=e247]
                  - cell "أميرة حداد amira@example.com" [ref=e248]:
                    - generic [ref=e249]:
                      - strong [ref=e250]: أميرة حداد
                      - generic "amira@example.com" [ref=e251]
                  - cell "Growth" [ref=e252]
                  - cell "نشطة" [ref=e253]
                  - cell "١٨ أكتوبر ٢٠٢٥" [ref=e255]
                  - cell "$3,420" [ref=e256]
                  - cell "8" [ref=e257]
                  - cell "7 / 8" [ref=e258]
```

# Test source

```ts
  1  | import {expect,test} from '@playwright/test';
  2  | import {openPreview} from './helpers/preview';
  3  | for (const locale of ['en','ar'] as const) {
  4  |  test(`phase company filters and image attention boundary ${locale}`,async({page},info)=>{
  5  |   const ar=locale==='ar';
  6  |   await page.setViewportSize({width:1440,height:900});
  7  |   await openPreview(page,{locale,direction:ar?'rtl':'ltr',theme:'dark'},'/dashboards/admin');
  8  |   await expect(page.getByRole('row')).toHaveCount(10);
  9  |   for(const [name,count] of [[ar?'نشطة':'Active',7],[ar?'تجريبية':'Trial',3],[ar?'متوقفة':'Paused',2]] as const){
  10 |    await page.getByRole('button',{name,exact:true}).click();
  11 |    await expect(page.getByRole('row')).toHaveCount(count);
  12 |   }
  13 |   await page.getByRole('textbox',{name:ar?'البحث عن الشركات':'Search companies'}).fill('Northstar');
  14 |   await expect(page.locator('[data-slot="empty-state"]')).toBeVisible();
  15 |   await page.screenshot({path:`~/.no-mistakes/evidence/01M7TR2K5KB9FWFR7D5HNWYW27/company-empty-${locale}.png`,fullPage:true});
  16 |   await page.getByRole('button',{name:ar?'إزالة عوامل التصفية':'Clear filters'}).click();
  17 |   await expect(page.getByRole('row')).toHaveCount(10);
  18 |   await page.getByRole('textbox',{name:ar?'البحث عن الشركات':'Search companies'}).fill(ar?'أميرة':'AMIRA');
  19 |   await expect(page.getByRole('row')).toHaveCount(2);
  20 |   await expect(page.getByRole('row').last()).toContainText('Northstar Goods');
> 21 |   await page.getByRole('button',{name:ar?'صور الفرق':'Squad images',exact:true}).click();
     |                                                                                  ^ Error: locator.click: Test timeout of 30000ms exceeded.
  22 |   await expect(page).toHaveURL(new RegExp(`locale=${locale}.*dir=${ar?'rtl':'ltr'}.*theme=dark.*view=images`));
  23 |   await page.getByRole('button',{name:ar?'تحتاج إلى مراجعة':'Needs attention',exact:true}).click();
  24 |   await expect(page.getByRole('row')).toHaveCount(3);
  25 |   await expect(page.getByRole('row').nth(1)).toContainText('registry.agents.example/orders:');
  26 |   await expect(page.getByRole('row').nth(2)).toContainText('registry.agents.example/support:');
  27 |   const support=page.getByRole('row').nth(2);
  28 |   await support.focus(); await page.keyboard.press('Enter');
  29 |   await expect(page.locator('.dashboard-details')).toContainText('registry.agents.example/support:1.6.0');
  30 |   await page.screenshot({path:`~/.no-mistakes/evidence/01M7TR2K5KB9FWFR7D5HNWYW27/image-attention-${locale}.png`,fullPage:true});
  31 |   await info.attach('observable state',{body:await page.locator('.dashboard-panel').innerText(),contentType:'text/plain'});
  32 |  });
  33 | }
  34 | 
```