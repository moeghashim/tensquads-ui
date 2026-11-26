# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: local-list-detail.spec.ts >> local Orders shared edges and responsive boundary in ar
- Location: e2e/local-list-detail.spec.ts:55:43

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - link "انتقل إلى المحتوى" [ref=f1e3] [cursor=pointer]:
    - /url: "#main"
  - banner [ref=f1e4]:
    - generic [ref=f1e5]:
      - link "نظام التصميم" [ref=f1e6] [cursor=pointer]:
        - /url: /?locale=ar&dir=rtl&theme=light
      - navigation "التنقل الرئيسي" [ref=f1e7]:
        - link "الأسس" [ref=f1e8] [cursor=pointer]:
          - /url: /foundations?locale=ar&dir=rtl&theme=light
        - link "المكوّنات" [ref=f1e9] [cursor=pointer]:
          - /url: /components?locale=ar&dir=rtl&theme=light
        - link "القوالب" [ref=f1e10] [cursor=pointer]:
          - /url: /templates?locale=ar&dir=rtl&theme=light
        - link "العُقَد" [ref=f1e11] [cursor=pointer]:
          - /url: /nodes?locale=ar&dir=rtl&theme=light
        - link "المحادثة" [ref=f1e12] [cursor=pointer]:
          - /url: /chat?locale=ar&dir=rtl&theme=light
        - link "البدء" [ref=f1e13] [cursor=pointer]:
          - /url: /get-started?locale=ar&dir=rtl&theme=light
      - generic [ref=f1e14]:
        - button "بحث ⌘K" [ref=f1e15] [cursor=pointer]:
          - generic [ref=f1e19]: بحث
          - generic [ref=f1e20]: ⌘K
        - button "English" [ref=f1e21] [cursor=pointer]
        - radiogroup "السمة" [ref=f1e22]:
          - radio "فاتحة" [checked] [ref=f1e23] [cursor=pointer]
          - radio [checked] [aria-hidden]
          - radio "داكنة" [ref=f1e26] [cursor=pointer]
          - radio [aria-hidden]
          - radio "النظام" [ref=f1e29] [cursor=pointer]
          - radio [aria-hidden]
  - generic [ref=f1e32]:
    - generic [ref=f1e33]:
      - navigation "القوالب" [ref=f1e34]:
        - link "القوالب" [ref=f1e35] [cursor=pointer]:
          - /url: /templates?locale=ar&dir=rtl&theme=light
        - generic [ref=f1e36]: القائمة والتفاصيل
      - region "ملفات القالب" [ref=f1e37]:
        - generic [ref=f1e38]:
          - button "نسخ المصدر" [ref=f1e39] [cursor=pointer]
          - status
        - generic [ref=f1e40]:
          - button "نسخ الأنماط" [ref=f1e41] [cursor=pointer]
          - status
        - link "عرض المصدر على GitHub" [ref=f1e42] [cursor=pointer]:
          - /url: https://github.com/moeghashim/tensquads-ui/blob/main/templates/list-detail/ListDetail.tsx
    - generic [ref=f1e43]:
      - complementary "مساحة المتجر" [ref=f1e44]:
        - generic [ref=f1e46]:
          - button "فتح قائمة مساحة العمل" [ref=f1e47]
          - generic [ref=f1e50]: تنقّل مساحة العمل
      - main [ref=f1e51]:
        - generic [ref=f1e53]:
          - generic [ref=f1e54]:
            - heading "الطلبات" [level=1] [ref=f1e55]
            - paragraph [ref=f1e56]: طلبات متجرك، الأحدث أولًا.
          - generic [ref=f1e57]:
            - generic "تواريخ الطلبات" [ref=f1e58]:
              - generic [ref=f1e59]:
                - button "تواريخ الطلبات" [ref=f1e60] [cursor=pointer]
                - generic [ref=f1e64]:
                  - textbox "تاريخ البداية" [ref=f1e65]: ٠١/١١/٢٠٢٦
                  - generic [aria-hidden]: ١ نوفمبر ٢٠٢٦
                - generic [aria-hidden] [ref=f1e66]: –
                - generic [ref=f1e67]:
                  - textbox "تاريخ النهاية" [ref=f1e68]: ٢٦/١١/٢٠٢٦
                  - generic [aria-hidden]: ٢٦ نوفمبر ٢٠٢٦
              - generic [ref=f1e69]: ١ نوفمبر ٢٠٢٦ – ٢٦ نوفمبر ٢٠٢٦
            - button "تصدير" [ref=f1e70] [cursor=pointer]
        - generic [ref=f1e75]:
          - generic [ref=f1e76]:
            - generic [ref=f1e78]:
              - heading "الطلبات" [level=2] [ref=f1e79]
              - generic [ref=f1e80]: ١٢٨
            - generic [ref=f1e83]:
              - searchbox "البحث في الطلبات" [ref=f1e84]
              - 'button "الحالة: الكل" [ref=f1e85] [cursor=pointer]'
          - generic [ref=f1e88]:
            - generic "الطلبات" [ref=f1e89]:
              - table [ref=f1e90]:
                - caption [ref=f1e91]: الطلبات
                - rowgroup [ref=f1e92]:
                  - row [ref=f1e93]:
                    - columnheader "الطلب" [ref=f1e94]
                    - columnheader "العميل" [ref=f1e95]
                    - columnheader "التاريخ" [ref=f1e96]
                    - columnheader "الحالة" [ref=f1e97]
                    - columnheader "الإجمالي" [ref=f1e98]
                - rowgroup [ref=f1e99]:
                  - row [ref=f1e100] [cursor=pointer]:
                    - cell "#١٠٤٧" [ref=f1e101]
                    - cell [ref=f1e102]:
                      - generic [ref=f1e103]:
                        - generic [aria-hidden] [ref=f1e104]: سا
                        - strong [ref=f1e106]: سارة القحطاني
                    - cell "٢٥ نوفمبر ٢٠٢٦" [ref=f1e107]
                    - cell "معلّق" [ref=f1e108]
                    - cell "‏٤١٢٫٠٠ ر.س.‏" [ref=f1e110]
                  - row [ref=f1e111] [cursor=pointer]:
                    - cell "#١٠٤٦" [ref=f1e112]
                    - cell [ref=f1e113]:
                      - generic [ref=f1e114]:
                        - generic [aria-hidden] [ref=f1e115]: عح
                        - strong [ref=f1e117]: عمر حداد
                    - cell "٢٥ نوفمبر ٢٠٢٦" [ref=f1e118]
                    - cell "قيد التجهيز" [ref=f1e119]
                    - cell "‏١٬٢٩٠٫٠٠ ر.س.‏" [ref=f1e121]
                  - row [ref=f1e122] [cursor=pointer]:
                    - cell "#١٠٤٥" [ref=f1e123]
                    - cell [ref=f1e124]:
                      - generic [ref=f1e125]:
                        - generic [aria-hidden] [ref=f1e126]: لف
                        - strong [ref=f1e128]: لينا فاروق
                    - cell "٢٤ نوفمبر ٢٠٢٦" [ref=f1e129]
                    - cell "مدفوع" [ref=f1e130]
                    - cell "‏٨٦٫٥٠ ر.س.‏" [ref=f1e132]
                  - row [ref=f1e133] [cursor=pointer]:
                    - cell "#١٠٤٤" [ref=f1e134]
                    - cell [ref=f1e135]:
                      - generic [ref=f1e136]:
                        - generic [aria-hidden] [ref=f1e137]: ين
                        - strong [ref=f1e139]: يوسف ناصر
                    - cell "٢٣ نوفمبر ٢٠٢٦" [ref=f1e140]
                    - cell "مدفوع" [ref=f1e141]
                    - cell "‏٧٧٩٫٧٠ ر.س.‏" [ref=f1e143]
                  - row [active] [ref=f1e144] [cursor=pointer]:
                    - cell "#١٠٤٣" [ref=f1e145]
                    - cell [ref=f1e146]:
                      - generic [ref=f1e147]:
                        - generic [aria-hidden] [ref=f1e148]: هس
                        - strong [ref=f1e150]: هدى سالم
                    - cell "٢٢ نوفمبر ٢٠٢٦" [ref=f1e151]
                    - cell "مسترد" [ref=f1e152]
                    - cell "‏٢٤٠٫٠٠ ر.س.‏" [ref=f1e154]
                  - row [ref=f1e155] [cursor=pointer]:
                    - cell "#١٠٤٢" [ref=f1e156]
                    - cell [ref=f1e157]:
                      - generic [ref=f1e158]:
                        - generic [aria-hidden] [ref=f1e159]: خم
                        - strong [ref=f1e161]: خالد منصور
                    - cell "٢١ نوفمبر ٢٠٢٦" [ref=f1e162]
                    - cell "فشل" [ref=f1e163]
                    - cell "‏١٥٥٫٠٠ ر.س.‏" [ref=f1e165]
            - generic [ref=f1e166]:
              - generic [ref=f1e167]: يعرض ٦ من ١٢٨
              - generic [ref=f1e168]:
                - button "الصفحة السابقة" [disabled] [ref=f1e169]
                - button "الصفحة التالية" [ref=f1e172] [cursor=pointer]
        - dialog [ref=f1e175]
  - contentinfo [ref=f1e176]:
    - generic [ref=f1e177]:
      - generic [ref=f1e178]: tensquads · نظام التصميم
      - navigation "موارد المشروع" [ref=f1e179]:
        - link "GitHub" [ref=f1e180] [cursor=pointer]:
          - /url: https://github.com/moeghashim/tensquads-ui
        - link "البدء" [ref=f1e181] [cursor=pointer]:
          - /url: /get-started?locale=ar&dir=rtl&theme=light
        - link "llms.txt" [ref=f1e182] [cursor=pointer]:
          - /url: /llms.txt
        - link "عرض بصيغة Markdown" [ref=f1e183] [cursor=pointer]:
          - /url: /templates/list-detail.md?locale=ar
```

# Test source

```ts
  1   | import { readFile } from 'node:fs/promises';
  2   | import { expect, test } from '@playwright/test';
  3   | import { openPreview } from './helpers/preview';
  4   | const evidence = '~/.no-mistakes/evidence/01M8C2DHGWGBKZ1GSHY3KDMVVH';
  5   | 
  6   | test('local Orders filters reject nonmatches, clear safely and export only matching records', async ({page}) => {
  7   |  await openPreview(page, {locale:'en',direction:'ltr',theme:'light'}, '/templates/list-detail');
  8   |  const table = page.getByRole('table', {name:'Orders'});
  9   |  const search = page.getByRole('searchbox', {name:'Search orders'});
  10  |  await page.getByRole('button', {name:'Next page',exact:true}).click();
  11  |  await search.fill('  #1044  ');
  12  |  await expect(table.getByRole('row')).toHaveCount(2);
  13  |  await expect(table).toContainText('Yousef Nasser');
  14  |  await expect(page.getByText('Showing 1 of 1', {exact:true})).toBeVisible();
  15  |  await table.getByRole('row').filter({hasText:'#1044'}).click();
  16  |  const panel = page.locator('.template-order__panel');
  17  |  await expect(panel).toContainText('Linen throw, sand');
  18  |  await expect(panel).toContainText('SAR 678.00');
  19  |  await expect(panel).toContainText('SAR 101.70');
  20  |  await expect(panel.getByRole('button',{name:'Refund',exact:true})).toBeEnabled();
  21  |  let message = '';
  22  |  page.once('dialog', async dialog => { message = dialog.message(); await dialog.dismiss(); });
  23  |  await panel.getByRole('button',{name:'Refund',exact:true}).click();
  24  |  expect(message).toBe('This is a sample order.');
  25  |  await search.fill('no such order 999999');
  26  |  await expect(page.getByText('No orders match',{exact:true})).toBeVisible();
  27  |  await expect(panel).toHaveCount(0);
  28  |  await page.screenshot({path:`${evidence}/empty-filters.png`, fullPage:true});
  29  |  await page.getByRole('button',{name:'Clear filters',exact:true}).click();
  30  |  await expect(search).toHaveValue('');
  31  |  await expect(page.getByText('Showing 6 of 128',{exact:true})).toBeVisible();
  32  |  await page.getByRole('button',{name:'Status: All',exact:true}).click();
  33  |  await page.getByRole('menuitemcheckbox',{name:'Hide archived orders'}).click();
  34  |  await page.keyboard.press('Escape');
  35  |  await expect(page.getByText('Showing 6 of 134',{exact:true})).toBeVisible();
  36  |  await page.getByRole('button',{name:'Order dates',exact:true}).click();
  37  |  await page.getByRole('button',{name:'Last 7 days',exact:true}).click();
  38  |  await page.getByRole('button',{name:'Apply',exact:true}).click();
  39  |  await page.getByRole('button',{name:'Status: All',exact:true}).click();
  40  |  await page.getByRole('menuitemradio',{name:'Processing',exact:true}).click();
  41  |  await expect(table.getByRole('row')).toHaveCount(4);
  42  |  await table.getByRole('row').filter({hasText:'#1046'}).click();
  43  |  await expect(panel.getByRole('button',{name:'Refund',exact:true})).toBeDisabled();
  44  |  const pending = page.waitForEvent('download');
  45  |  await page.getByRole('button',{name:'Export',exact:true}).click();
  46  |  const download=await pending; expect(download.suggestedFilename()).toBe('orders.csv');
  47  |  await download.saveAs(`${evidence}/filtered-orders.csv`);
  48  |  const csv=await readFile(`${evidence}/filtered-orders.csv`,'utf8');
  49  |  const records=csv.split('\r\n').slice(1).map(line=>line.split(',').map(x=>x.replaceAll('"','')));
  50  |  expect(records.length).toBe(3);
  51  |  for(const record of records){ expect(record[2] >= '2026-11-20' && record[2] <= '2026-11-26').toBe(true); expect(record[3]).toBe('processing'); }
  52  |  await page.screenshot({path:`${evidence}/filtered-orders.png`,fullPage:true});
  53  | });
  54  | 
  55  | for(const locale of ['en','ar'] as const) test(`local Orders shared edges and responsive boundary in ${locale}`,async({page})=>{
  56  |  const state={locale,direction:locale==='ar'?'rtl':'ltr',theme:'light'} as const;
  57  |  const edges=async(selector:string)=>page.locator(selector).evaluate(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right};});
  58  |  const expected=new Map();
  59  |  await openPreview(page,state,'/components');
  60  |  for(const width of [1440,1024,1023,390]){await page.setViewportSize({width,height:900}); await expect(page.getByRole('main')).toBeVisible(); await expect.poll(async()=>{const e=await edges('main');return e.right>e.left;}).toBe(true); expected.set(width,await edges('main'));}
  61  |  await openPreview(page,state,'/templates/list-detail');
  62  |  for(const width of [1440,1024,1023,390]){
  63  |   await page.setViewportSize({width,height:900});
  64  |   await expect.poll(()=>edges('.template-preview')).toEqual(expected.get(width));
  65  |   const panel=page.locator('.template-order__panel');
  66  |   if(width>=1024){
  67  |    await expect(panel).toBeVisible();
  68  |    const list=await page.locator('.template-order__list').boundingBox(); const detail=await panel.boundingBox();
  69  |    expect(locale==='en'?list!.x+list!.width<=detail!.x:detail!.x+detail!.width<=list!.x).toBe(true);
  70  |   }else{
  71  |    await expect(panel).toHaveCount(0);
  72  |    const row=page.getByRole('table').getByRole('row').filter({hasText:locale==='en'?'#1044':'#١٠٤٤'});
  73  |    await row.click();
  74  |    const sheet=page.getByRole('dialog'); await expect(sheet).toBeVisible();
  75  |    await expect(sheet).toHaveCSS('inset-block-end','0px');
  76  |    await page.keyboard.press('Tab');
> 77  |    expect(await sheet.evaluate(el=>el.contains(document.activeElement))).toBe(true);
      |                                                                          ^ Error: expect(received).toBe(expected) // Object.is equality
  78  |    if(width===1023)await page.screenshot({path:`${evidence}/boundary-${locale}-1023.png`,fullPage:true});
  79  |    await page.keyboard.press('Escape'); await expect(row).toBeFocused();
  80  |    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  81  |    const scroll=page.locator('.ts-data-table__scroll');
  82  |    if(width===390) expect(await scroll.evaluate(el=>el.scrollWidth>el.clientWidth && getComputedStyle(el).overflowX==='auto')).toBe(true);
  83  |   }
  84  |  }
  85  | });
  86  | 
  87  | test('local gallery exposes the Orders template and moved admin detail styles render',async({page,request})=>{
  88  |  await openPreview(page,{locale:'ar',direction:'rtl',theme:'dark'},'/templates');
  89  |  await page.getByRole('main').getByRole('link',{name:/القائمة والتفاصيل/}).click();
  90  |  await expect(page.getByRole('heading',{name:'الطلبات',level:1})).toBeVisible();
  91  |  const index=await (await request.get('/llms.txt')).text(); expect(index).toContain('/templates/list-detail.md');
  92  |  await openPreview(page,{locale:'en',direction:'ltr',theme:'light'},'/dashboards/admin');
  93  |  await page.getByRole('button',{name:'Squad images'}).click();
  94  |  await page.getByRole('row',{name:/registry\.agents\.example\/orders:1\.8\.2/}).click();
  95  |  const rows=page.locator('.template-detail-rows');
  96  |  await expect(rows).toContainText('registry.agents.example/orders:1.8.2');
  97  |  await expect(rows).toHaveCSS('display','grid');
  98  |  await page.screenshot({path:`${evidence}/admin-detail-styles.png`,fullPage:true});
  99  | });
  100 | 
```