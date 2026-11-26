# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: local-list-detail.spec.ts >> local Orders filters reject nonmatches, clear safely and export only matching records
- Location: e2e/local-list-detail.spec.ts:6:1

# Error details

```
Error: expect(locator).toBeDisabled() failed

Locator: locator('.template-order__panel').getByRole('button', { name: 'Refund', exact: true })
Expected: disabled
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeDisabled" locator('.template-order__panel').getByRole('button', { name: 'Refund', exact: true }) with timeout 5000ms
  - waiting for locator('.template-order__panel').getByRole('button', { name: 'Refund', exact: true })

```

```yaml
- link "Skip to content":
  - /url: "#main"
- banner:
  - link "Design system":
    - /url: /?locale=en&dir=ltr&theme=light
  - navigation "Primary navigation":
    - link "Foundations":
      - /url: /foundations?locale=en&dir=ltr&theme=light
    - link "Components":
      - /url: /components?locale=en&dir=ltr&theme=light
    - link "Templates":
      - /url: /templates?locale=en&dir=ltr&theme=light
    - link "Nodes":
      - /url: /nodes?locale=en&dir=ltr&theme=light
    - link "Chat":
      - /url: /chat?locale=en&dir=ltr&theme=light
    - link "Get started":
      - /url: /get-started?locale=en&dir=ltr&theme=light
  - button "Search ⌘K"
  - button "العربية"
  - radiogroup "Theme":
    - radio "Light" [checked]
    - radio "Dark"
    - radio "System"
- navigation "Templates":
  - link "Templates":
    - /url: /templates?locale=en&dir=ltr&theme=light
  - text: List and detail
- region "Template files":
  - button "Copy source"
  - status
  - button "Copy styles"
  - status
  - link "View source on GitHub":
    - /url: https://github.com/moeghashim/tensquads-ui/blob/main/templates/list-detail/ListDetail.tsx
- complementary "Store workspace":
  - navigation "Workspace navigation":
    - strong: Northstar Goods
    - text: Store workspace
    - heading "Store workspace" [level=2]
    - link "Overview":
      - /url: /templates/dashboard?locale=en&dir=ltr&theme=light
    - link "Orders":
      - /url: /templates/list-detail?locale=en&dir=ltr&theme=light
    - link "Accounts":
      - /url: /templates/list?locale=en&dir=ltr&theme=light
    - link "Rules":
      - /url: /templates/settings?locale=en&dir=ltr&theme=light
    - link "Chat":
      - /url: /templates/chat?locale=en&dir=ltr&theme=light
    - heading "Your squad" [level=2]
    - img "Petra, Idle"
    - strong: Petra
    - text: Squad lead
    - img "Pisa, Running skill"
    - strong: Pisa
    - text: Orders Online
    - img "Kyoto, Idle"
    - strong: Kyoto
    - text: Support Online
    - img "Zurich, Idle"
    - strong: Zurich
    - text: Finance Online
    - strong: Moe Ghashim
    - text: Store owner
- main:
  - heading "Orders" [level=1]
  - paragraph: Orders from your store, newest first.
  - button "Order dates"
  - textbox "Start date": 11/20/2026
  - textbox "End date": 11/26/2026
  - text: Nov 20, 2026 – Nov 26, 2026
  - button "Export"
  - heading "Orders" [level=2]
  - text: "2"
  - searchbox "Search orders"
  - 'button "Status: Processing"'
  - table "Orders":
    - caption: Orders
    - rowgroup:
      - row "Order Customer Date Status Total":
        - columnheader "Order"
        - columnheader "Customer"
        - columnheader "Date"
        - columnheader "Status"
        - columnheader "Total"
    - rowgroup:
      - row "#1046 Omar Haddad Nov 25, 2026 Processing SAR 1,290.00":
        - cell "#1046"
        - cell "Omar Haddad":
          - strong: Omar Haddad
        - cell "Nov 25, 2026"
        - cell "Processing"
        - cell "SAR 1,290.00"
      - row "#1040 Omar Haddad Nov 20, 2026 Processing SAR 1,290.00":
        - cell "#1040"
        - cell "Omar Haddad":
          - strong: Omar Haddad
        - cell "Nov 20, 2026"
        - cell "Processing"
        - cell "SAR 1,290.00"
  - text: Showing 2 of 2
  - button "Previous page" [disabled]
  - button "Next page" [disabled]
- contentinfo:
  - text: tensquads · Design system
  - navigation "Project resources":
    - link "GitHub":
      - /url: https://github.com/moeghashim/tensquads-ui
    - link "Get started":
      - /url: /get-started?locale=en&dir=ltr&theme=light
    - link "llms.txt":
      - /url: /llms.txt
    - link "View as Markdown":
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
  42  |  await table.getByRole('row').filter({hasText:'#1046'}).click();
> 43  |  await expect(panel.getByRole('button',{name:'Refund',exact:true})).toBeDisabled();
      |                                                                     ^ Error: expect(locator).toBeDisabled() failed
  44  |  const pending = page.waitForEvent('download');
  45  |  await page.getByRole('button',{name:'Export',exact:true}).click();
  46  |  const download=await pending; expect(download.suggestedFilename()).toBe('orders.csv');
  47  |  await download.saveAs(`${evidence}/filtered-orders.csv`);
  48  |  const csv=await readFile(`${evidence}/filtered-orders.csv`,'utf8');
  49  |  const records=csv.split('\r\n').slice(1).map(line=>line.split(',').map(x=>x.replaceAll('"','')));
  50  |  expect(records.length).toBeGreaterThan(0);
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
  76  |    await expect.poll(()=>sheet.evaluate(el=>el.contains(document.activeElement))).toBe(true);
  77  |    await page.keyboard.press('Tab');
  78  |    await expect.poll(()=>sheet.evaluate(el=>el.contains(document.activeElement))).toBe(true);
  79  |    if(width===1023)await page.screenshot({path:`${evidence}/boundary-${locale}-1023.png`,fullPage:true});
  80  |    await page.keyboard.press('Escape'); await expect(row).toBeFocused();
  81  |    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  82  |    const scroll=page.locator('.ts-data-table__scroll');
  83  |    if(width===390) expect(await scroll.evaluate(el=>el.scrollWidth>el.clientWidth && getComputedStyle(el).overflowX==='auto')).toBe(true);
  84  |   }
  85  |  }
  86  | });
  87  | 
  88  | test('local gallery exposes the Orders template and moved admin detail styles render',async({page,request})=>{
  89  |  await openPreview(page,{locale:'ar',direction:'rtl',theme:'dark'},'/templates');
  90  |  await page.getByRole('main').getByRole('link',{name:/القائمة والتفاصيل/}).click();
  91  |  await expect(page.getByRole('heading',{name:'الطلبات',level:1})).toBeVisible();
  92  |  const index=await (await request.get('/llms.txt')).text(); expect(index).toContain('/templates/list-detail.md');
  93  |  await openPreview(page,{locale:'en',direction:'ltr',theme:'light'},'/dashboards/admin');
  94  |  await page.getByRole('button',{name:'Squad images'}).click();
  95  |  await page.getByRole('row',{name:/registry\.agents\.example\/orders:1\.8\.2/}).click();
  96  |  const rows=page.locator('.template-detail-rows');
  97  |  await expect(rows).toContainText('registry.agents.example/orders:1.8.2');
  98  |  await expect(rows).toHaveCSS('display','grid');
  99  |  await page.screenshot({path:`${evidence}/admin-detail-styles.png`,fullPage:true});
  100 | });
  101 | 
```