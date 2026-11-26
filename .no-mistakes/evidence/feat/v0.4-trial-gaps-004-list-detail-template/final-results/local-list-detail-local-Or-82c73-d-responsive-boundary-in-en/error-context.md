# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: local-list-detail.spec.ts >> local Orders shared edges and responsive boundary in en
- Location: e2e/local-list-detail.spec.ts:56:43

# Error details

```
Error: Timeout 5000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - link "Skip to content" [ref=f1e3] [cursor=pointer]:
    - /url: "#main"
  - banner [ref=f1e4]:
    - generic [ref=f1e5]:
      - link "Design system" [ref=f1e6] [cursor=pointer]:
        - /url: /?locale=en&dir=ltr&theme=light
      - navigation "Primary navigation" [ref=f1e7]:
        - link "Foundations" [ref=f1e8] [cursor=pointer]:
          - /url: /foundations?locale=en&dir=ltr&theme=light
        - link "Components" [ref=f1e9] [cursor=pointer]:
          - /url: /components?locale=en&dir=ltr&theme=light
        - link "Templates" [ref=f1e10] [cursor=pointer]:
          - /url: /templates?locale=en&dir=ltr&theme=light
        - link "Nodes" [ref=f1e11] [cursor=pointer]:
          - /url: /nodes?locale=en&dir=ltr&theme=light
        - link "Chat" [ref=f1e12] [cursor=pointer]:
          - /url: /chat?locale=en&dir=ltr&theme=light
        - link "Get started" [ref=f1e13] [cursor=pointer]:
          - /url: /get-started?locale=en&dir=ltr&theme=light
      - generic [ref=f1e14]:
        - button "Search ⌘K" [ref=f1e15] [cursor=pointer]:
          - generic [ref=f1e19]: Search
          - generic [ref=f1e20]: ⌘K
        - button "العربية" [ref=f1e21] [cursor=pointer]
        - radiogroup "Theme" [ref=f1e22]:
          - radio "Light" [checked] [ref=f1e23] [cursor=pointer]
          - radio [checked] [aria-hidden]
          - radio "Dark" [ref=f1e26] [cursor=pointer]
          - radio [aria-hidden]
          - radio "System" [ref=f1e29] [cursor=pointer]
          - radio [aria-hidden]
  - generic [ref=f1e32]:
    - generic [ref=f1e33]:
      - navigation "Templates" [ref=f1e34]:
        - link "Templates" [ref=f1e35] [cursor=pointer]:
          - /url: /templates?locale=en&dir=ltr&theme=light
        - generic [ref=f1e36]: List and detail
      - region "Template files" [ref=f1e37]:
        - generic [ref=f1e38]:
          - button "Copy source" [ref=f1e39] [cursor=pointer]
          - status
        - generic [ref=f1e40]:
          - button "Copy styles" [ref=f1e41] [cursor=pointer]
          - status
        - link "View source on GitHub" [ref=f1e42] [cursor=pointer]:
          - /url: https://github.com/moeghashim/tensquads-ui/blob/main/templates/list-detail/ListDetail.tsx
    - generic [ref=f1e43]:
      - complementary "Store workspace" [ref=f1e44]:
        - generic [ref=f1e46]:
          - button "Open workspace navigation" [ref=f1e47]
          - generic [ref=f1e50]: Workspace navigation
      - main [ref=f1e51]:
        - generic [ref=f1e53]:
          - generic [ref=f1e54]:
            - heading "Orders" [level=1] [ref=f1e55]
            - paragraph [ref=f1e56]: Orders from your store, newest first.
          - generic [ref=f1e57]:
            - generic "Order dates" [ref=f1e58]:
              - generic [ref=f1e59]:
                - button "Order dates" [ref=f1e60] [cursor=pointer]
                - generic [ref=f1e64]:
                  - textbox "Start date" [ref=f1e65]: 11/01/2026
                  - generic [aria-hidden]: Nov 1, 2026
                - generic [aria-hidden] [ref=f1e66]: –
                - generic [ref=f1e67]:
                  - textbox "End date" [ref=f1e68]: 11/26/2026
                  - generic [aria-hidden]: Nov 26, 2026
              - generic [ref=f1e69]: Nov 1, 2026 – Nov 26, 2026
            - button "Export" [ref=f1e70] [cursor=pointer]
        - generic [ref=f1e75]:
          - generic [ref=f1e76]:
            - generic [ref=f1e78]:
              - heading "Orders" [level=2] [ref=f1e79]
              - generic [ref=f1e80]: "128"
            - generic [ref=f1e83]:
              - searchbox "Search orders" [ref=f1e84]
              - 'button "Status: All" [ref=f1e85] [cursor=pointer]'
          - generic [ref=f1e88]:
            - generic "Orders" [ref=f1e89]:
              - table [ref=f1e90]:
                - caption [ref=f1e91]: Orders
                - rowgroup [ref=f1e92]:
                  - row [ref=f1e93]:
                    - columnheader "Order" [ref=f1e94]
                    - columnheader "Customer" [ref=f1e95]
                    - columnheader "Date" [ref=f1e96]
                    - columnheader "Status" [ref=f1e97]
                    - columnheader "Total" [ref=f1e98]
                - rowgroup [ref=f1e99]:
                  - row [ref=f1e100] [cursor=pointer]:
                    - cell "#1047" [ref=f1e101]
                    - cell [ref=f1e102]:
                      - generic [ref=f1e103]:
                        - generic [aria-hidden] [ref=f1e104]: SA
                        - strong [ref=f1e106]: Sara Al-Qahtani
                    - cell "Nov 25, 2026" [ref=f1e107]
                    - cell "Pending" [ref=f1e108]
                    - cell "SAR 412.00" [ref=f1e110]
                  - row [ref=f1e111] [cursor=pointer]:
                    - cell "#1046" [ref=f1e112]
                    - cell [ref=f1e113]:
                      - generic [ref=f1e114]:
                        - generic [aria-hidden] [ref=f1e115]: OH
                        - strong [ref=f1e117]: Omar Haddad
                    - cell "Nov 25, 2026" [ref=f1e118]
                    - cell "Processing" [ref=f1e119]
                    - cell "SAR 1,290.00" [ref=f1e121]
                  - row [ref=f1e122] [cursor=pointer]:
                    - cell "#1045" [ref=f1e123]
                    - cell [ref=f1e124]:
                      - generic [ref=f1e125]:
                        - generic [aria-hidden] [ref=f1e126]: LF
                        - strong [ref=f1e128]: Lina Farouk
                    - cell "Nov 24, 2026" [ref=f1e129]
                    - cell "Paid" [ref=f1e130]
                    - cell "SAR 86.50" [ref=f1e132]
                  - row [active] [ref=f1e133] [cursor=pointer]:
                    - cell "#1044" [ref=f1e134]
                    - cell [ref=f1e135]:
                      - generic [ref=f1e136]:
                        - generic [aria-hidden] [ref=f1e137]: YN
                        - strong [ref=f1e139]: Yousef Nasser
                    - cell "Nov 23, 2026" [ref=f1e140]
                    - cell "Paid" [ref=f1e141]
                    - cell "SAR 779.70" [ref=f1e143]
                  - row [ref=f1e144] [cursor=pointer]:
                    - cell "#1043" [ref=f1e145]
                    - cell [ref=f1e146]:
                      - generic [ref=f1e147]:
                        - generic [aria-hidden] [ref=f1e148]: HS
                        - strong [ref=f1e150]: Huda Salem
                    - cell "Nov 22, 2026" [ref=f1e151]
                    - cell "Refunded" [ref=f1e152]
                    - cell "SAR 240.00" [ref=f1e154]
                  - row [ref=f1e155] [cursor=pointer]:
                    - cell "#1042" [ref=f1e156]
                    - cell [ref=f1e157]:
                      - generic [ref=f1e158]:
                        - generic [aria-hidden] [ref=f1e159]: KM
                        - strong [ref=f1e161]: Khalid Mansour
                    - cell "Nov 21, 2026" [ref=f1e162]
                    - cell "Failed" [ref=f1e163]
                    - cell "SAR 155.00" [ref=f1e165]
            - generic [ref=f1e166]:
              - generic [ref=f1e167]: Showing 6 of 128
              - generic [ref=f1e168]:
                - button "Previous page" [disabled] [ref=f1e169]
                - button "Next page" [ref=f1e172] [cursor=pointer]
  - contentinfo [ref=f1e175]:
    - generic [ref=f1e176]:
      - generic [ref=f1e177]: tensquads · Design system
      - navigation "Project resources" [ref=f1e178]:
        - link "GitHub" [ref=f1e179] [cursor=pointer]:
          - /url: https://github.com/moeghashim/tensquads-ui
        - link "Get started" [ref=f1e180] [cursor=pointer]:
          - /url: /get-started?locale=en&dir=ltr&theme=light
        - link "llms.txt" [ref=f1e181] [cursor=pointer]:
          - /url: /llms.txt
        - link "View as Markdown" [ref=f1e182] [cursor=pointer]:
          - /url: /templates/list-detail.md
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
  41  |  await expect(table).toContainText('#1046');
  42  |  await expect(page.getByRole('menu')).toHaveCount(0);
  43  |  await table.getByRole('row').filter({hasText:'#1046'}).press('Enter');
  44  |  await expect(panel.getByRole('button',{name:'Refund',exact:true})).toBeDisabled();
  45  |  const pending = page.waitForEvent('download');
  46  |  await page.getByRole('button',{name:'Export',exact:true}).click();
  47  |  const download=await pending; expect(download.suggestedFilename()).toBe('orders.csv');
  48  |  await download.saveAs(`${evidence}/filtered-orders.csv`);
  49  |  const csv=await readFile(`${evidence}/filtered-orders.csv`,'utf8');
  50  |  const records=csv.split('\r\n').slice(1).map(line=>line.split(',').map(x=>x.replaceAll('"','')));
  51  |  expect(records.length).toBeGreaterThan(0);
  52  |  for(const record of records){ expect(record[2] >= '2026-11-20' && record[2] <= '2026-11-26').toBe(true); expect(record[3]).toBe('processing'); }
  53  |  await page.screenshot({path:`${evidence}/filtered-orders.png`,fullPage:true});
  54  | });
  55  | 
  56  | for(const locale of ['en','ar'] as const) test(`local Orders shared edges and responsive boundary in ${locale}`,async({page})=>{
  57  |  const state={locale,direction:locale==='ar'?'rtl':'ltr',theme:'light'} as const;
  58  |  const edges=async(selector:string)=>page.locator(selector).evaluate(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right};});
  59  |  const expected=new Map();
  60  |  await openPreview(page,state,'/components');
  61  |  for(const width of [1440,1024,1023,390]){await page.setViewportSize({width,height:900}); await expect(page.getByRole('main')).toBeVisible(); await expect.poll(async()=>{const e=await edges('main');return e.right>e.left;}).toBe(true); expected.set(width,await edges('main'));}
  62  |  await openPreview(page,state,'/templates/list-detail');
  63  |  for(const width of [1440,1024,1023,390]){
  64  |   await page.setViewportSize({width,height:900});
  65  |   await expect.poll(()=>edges('.template-preview')).toEqual(expected.get(width));
  66  |   const panel=page.locator('.template-order__panel');
  67  |   if(width>=1024){
  68  |    await expect(panel).toBeVisible();
  69  |    const list=await page.locator('.template-order__list').boundingBox(); const detail=await panel.boundingBox();
  70  |    expect(locale==='en'?list!.x+list!.width<=detail!.x:detail!.x+detail!.width<=list!.x).toBe(true);
  71  |   }else{
  72  |    await expect(panel).toHaveCount(0);
  73  |    const row=page.getByRole('table').getByRole('row').filter({hasText:locale==='en'?'#1044':'#١٠٤٤'});
  74  |    await row.click();
  75  |    const sheet=page.getByRole('dialog'); await expect(sheet).toBeVisible();
  76  |    await expect(sheet).toHaveCSS('inset-block-end','0px');
  77  |    await page.screenshot({path:`${evidence}/pointer-sheet-${locale}-${width}.png`,fullPage:true});
  78  |    console.log('pointer sheet state', locale,width, await page.evaluate(()=>({active:document.activeElement?.outerHTML, dialogs:document.querySelectorAll('[role=dialog]').length})));
> 79  |    await expect.poll(()=>sheet.evaluate(el=>el.contains(document.activeElement))).toBe(true);
      |                                                                                   ^ Error: Timeout 5000ms exceeded while waiting on the predicate
  80  |    await page.keyboard.press('Tab');
  81  |    await expect.poll(()=>sheet.evaluate(el=>el.contains(document.activeElement))).toBe(true);
  82  |    if(width===1023)await page.screenshot({path:`${evidence}/boundary-${locale}-1023.png`,fullPage:true});
  83  |    await page.keyboard.press('Escape'); await expect(row).toBeFocused();
  84  |    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  85  |    const scroll=page.locator('.ts-data-table__scroll');
  86  |    if(width===390) expect(await scroll.evaluate(el=>el.scrollWidth>el.clientWidth && getComputedStyle(el).overflowX==='auto')).toBe(true);
  87  |   }
  88  |  }
  89  | });
  90  | 
  91  | test('local gallery exposes the Orders template and moved admin detail styles render',async({page,request})=>{
  92  |  await openPreview(page,{locale:'ar',direction:'rtl',theme:'dark'},'/templates');
  93  |  await page.getByRole('main').getByRole('link',{name:/القائمة والتفاصيل/}).click();
  94  |  await expect(page.getByRole('heading',{name:'الطلبات',level:1})).toBeVisible();
  95  |  const index=await (await request.get('/llms.txt')).text(); expect(index).toContain('/templates/list-detail.md');
  96  |  await openPreview(page,{locale:'en',direction:'ltr',theme:'light'},'/dashboards/admin');
  97  |  await page.getByRole('button',{name:'Squad images'}).click();
  98  |  await page.getByRole('row',{name:/registry\.agents\.example\/orders:1\.8\.2/}).click();
  99  |  const rows=page.locator('.template-detail-rows');
  100 |  await expect(rows).toContainText('registry.agents.example/orders:1.8.2');
  101 |  await expect(rows).toHaveCSS('display','grid');
  102 |  await page.screenshot({path:`${evidence}/admin-detail-styles.png`,fullPage:true});
  103 | });
  104 | 
```