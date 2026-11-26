# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: local-list-detail.spec.ts >> local Orders filters reject nonmatches, clear safely and export only matching records
- Location: e2e/local-list-detail.spec.ts:6:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByRole('table', { name: 'Orders' }).getByRole('row')
Expected: 4
Received: 3
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" getByRole('table', { name: 'Orders' }).getByRole('row') with timeout 5000ms
  - waiting for getByRole('table', { name: 'Orders' }).getByRole('row')
    14 × locator resolved to 3 elements
       - unexpected value "3"

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - link "Skip to content" [ref=e3] [cursor=pointer]:
    - /url: "#main"
  - banner [ref=e4]:
    - generic [ref=e5]:
      - link "Design system" [ref=e6] [cursor=pointer]:
        - /url: /?locale=en&dir=ltr&theme=light
      - navigation "Primary navigation" [ref=e7]:
        - link "Foundations" [ref=e8] [cursor=pointer]:
          - /url: /foundations?locale=en&dir=ltr&theme=light
        - link "Components" [ref=e9] [cursor=pointer]:
          - /url: /components?locale=en&dir=ltr&theme=light
        - link "Templates" [ref=e10] [cursor=pointer]:
          - /url: /templates?locale=en&dir=ltr&theme=light
        - link "Nodes" [ref=e11] [cursor=pointer]:
          - /url: /nodes?locale=en&dir=ltr&theme=light
        - link "Chat" [ref=e12] [cursor=pointer]:
          - /url: /chat?locale=en&dir=ltr&theme=light
        - link "Get started" [ref=e13] [cursor=pointer]:
          - /url: /get-started?locale=en&dir=ltr&theme=light
      - generic [ref=e14]:
        - button "Search ⌘K" [ref=e15] [cursor=pointer]:
          - generic [ref=e19]: Search
          - generic [ref=e20]: ⌘K
        - button "العربية" [ref=e21] [cursor=pointer]
        - radiogroup "Theme" [ref=e22]:
          - radio "Light" [checked] [ref=e23] [cursor=pointer]
          - radio [checked] [aria-hidden]
          - radio "Dark" [ref=e26] [cursor=pointer]
          - radio [aria-hidden]
          - radio "System" [ref=e29] [cursor=pointer]
          - radio [aria-hidden]
  - generic [ref=e32]:
    - generic [ref=e33]:
      - navigation "Templates" [ref=e34]:
        - link "Templates" [ref=e35] [cursor=pointer]:
          - /url: /templates?locale=en&dir=ltr&theme=light
        - generic [ref=e36]: List and detail
      - region "Template files" [ref=e37]:
        - generic [ref=e38]:
          - button "Copy source" [ref=e39] [cursor=pointer]
          - status
        - generic [ref=e40]:
          - button "Copy styles" [ref=e41] [cursor=pointer]
          - status
        - link "View source on GitHub" [ref=e42] [cursor=pointer]:
          - /url: https://github.com/moeghashim/tensquads-ui/blob/main/templates/list-detail/ListDetail.tsx
    - generic [ref=e43]:
      - complementary "Store workspace" [ref=e44]:
        - navigation "Workspace navigation" [ref=e46]:
          - generic [ref=e47]:
            - generic [aria-hidden] [ref=e48]: "N"
            - generic [ref=e49]:
              - strong [ref=e50]: Northstar Goods
              - generic [ref=e51]: Store workspace
          - generic [ref=e52]:
            - heading "Store workspace" [level=2] [ref=e53]
            - generic [ref=e54]:
              - link "Overview" [ref=e55] [cursor=pointer]:
                - /url: /templates/dashboard?locale=en&dir=ltr&theme=light
              - link "Orders" [ref=e60] [cursor=pointer]:
                - /url: /templates/list-detail?locale=en&dir=ltr&theme=light
              - link "Accounts" [ref=e65] [cursor=pointer]:
                - /url: /templates/list?locale=en&dir=ltr&theme=light
              - link "Rules" [ref=e70] [cursor=pointer]:
                - /url: /templates/settings?locale=en&dir=ltr&theme=light
              - link "Chat" [ref=e75] [cursor=pointer]:
                - /url: /templates/chat?locale=en&dir=ltr&theme=light
          - generic [ref=e80]:
            - heading "Your squad" [level=2] [ref=e81]
            - generic [ref=e82]:
              - generic [ref=e83]:
                - img "Petra, Idle" [ref=e84]
                - generic [ref=e85]:
                  - strong [ref=e86]: Petra
                  - generic [ref=e87]: Squad lead
              - generic [ref=e88]:
                - img "Pisa, Running skill" [ref=e89]
                - generic [ref=e90]:
                  - strong [ref=e91]: Pisa
                  - generic [ref=e92]: Orders
                - generic [ref=e94]: Online
              - generic [ref=e95]:
                - img "Kyoto, Idle" [ref=e96]
                - generic [ref=e97]:
                  - strong [ref=e98]: Kyoto
                  - generic [ref=e99]: Support
                - generic [ref=e101]: Online
              - generic [ref=e102]:
                - img "Zurich, Idle" [ref=e103]
                - generic [ref=e104]:
                  - strong [ref=e105]: Zurich
                  - generic [ref=e106]: Finance
                - generic [ref=e108]: Online
          - generic [ref=e109]:
            - generic [aria-hidden] [ref=e110]: MG
            - generic [ref=e111]:
              - strong [ref=e112]: Moe Ghashim
              - generic [ref=e113]: Store owner
      - main [ref=e114]:
        - generic [ref=e116]:
          - generic [ref=e117]:
            - heading "Orders" [level=1] [ref=e118]
            - paragraph [ref=e119]: Orders from your store, newest first.
          - generic [ref=e120]:
            - generic "Order dates" [ref=e121]:
              - generic [ref=e122]:
                - button "Order dates" [ref=e123] [cursor=pointer]
                - generic [ref=e127]:
                  - textbox "Start date" [ref=e128]: 11/20/2026
                  - generic [aria-hidden]: Nov 20, 2026
                - generic [aria-hidden] [ref=e129]: –
                - generic [ref=e130]:
                  - textbox "End date" [ref=e131]: 11/26/2026
                  - generic [aria-hidden]: Nov 26, 2026
              - generic [ref=e132]: Nov 20, 2026 – Nov 26, 2026
            - button "Export" [ref=e133] [cursor=pointer]
        - generic [ref=e138]:
          - generic [ref=e139]:
            - generic [ref=e141]:
              - heading "Orders" [level=2] [ref=e142]
              - generic [ref=e143]: "2"
            - generic [ref=e146]:
              - searchbox "Search orders" [ref=e147]
              - 'button "Status: Processing" [expanded] [ref=e148] [cursor=pointer]'
              - 'menu "Status: Processing" [ref=e151]':
                - group "Status" [ref=e152]:
                  - menuitemradio "All" [ref=e153] [cursor=pointer]
                  - menuitemradio "Paid" [ref=e155] [cursor=pointer]
                  - menuitemradio "Pending" [ref=e157] [cursor=pointer]
                  - menuitemradio "Processing" [checked] [active] [ref=e159] [cursor=pointer]
                  - menuitemradio "Refunded" [ref=e161] [cursor=pointer]
                  - menuitemradio "Failed" [ref=e163] [cursor=pointer]
                - separator [ref=e165]
                - menuitemcheckbox "Hide archived orders" [ref=e166] [cursor=pointer]
          - generic [ref=e168]:
            - generic "Orders" [ref=e169]:
              - table [ref=e170]:
                - caption [ref=e171]: Orders
                - rowgroup [ref=e172]:
                  - row [ref=e173]:
                    - columnheader "Order" [ref=e174]
                    - columnheader "Customer" [ref=e175]
                    - columnheader "Date" [ref=e176]
                    - columnheader "Status" [ref=e177]
                    - columnheader "Total" [ref=e178]
                - rowgroup [ref=e179]:
                  - row [ref=e180] [cursor=pointer]:
                    - cell "#1046" [ref=e181]
                    - cell [ref=e182]:
                      - generic [ref=e183]:
                        - generic [aria-hidden] [ref=e184]: OH
                        - strong [ref=e186]: Omar Haddad
                    - cell "Nov 25, 2026" [ref=e187]
                    - cell "Processing" [ref=e188]
                    - cell "SAR 1,290.00" [ref=e190]
                  - row [ref=e191] [cursor=pointer]:
                    - cell "#1040" [ref=e192]
                    - cell [ref=e193]:
                      - generic [ref=e194]:
                        - generic [aria-hidden] [ref=e195]: OH
                        - strong [ref=e197]: Omar Haddad
                    - cell "Nov 20, 2026" [ref=e198]
                    - cell "Processing" [ref=e199]
                    - cell "SAR 1,290.00" [ref=e201]
            - generic [ref=e202]:
              - generic [ref=e203]: Showing 2 of 2
              - generic [ref=e204]:
                - button "Previous page" [disabled] [ref=e205]
                - button "Next page" [disabled] [ref=e208]
  - contentinfo [ref=e211]:
    - generic [ref=e212]:
      - generic [ref=e213]: tensquads · Design system
      - navigation "Project resources" [ref=e214]:
        - link "GitHub" [ref=e215] [cursor=pointer]:
          - /url: https://github.com/moeghashim/tensquads-ui
        - link "Get started" [ref=e216] [cursor=pointer]:
          - /url: /get-started?locale=en&dir=ltr&theme=light
        - link "llms.txt" [ref=e217] [cursor=pointer]:
          - /url: /llms.txt
        - link "View as Markdown" [ref=e218] [cursor=pointer]:
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
> 41  |  await expect(table.getByRole('row')).toHaveCount(4);
      |                                       ^ Error: expect(locator).toHaveCount(expected) failed
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
  77  |    expect(await sheet.evaluate(el=>el.contains(document.activeElement))).toBe(true);
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