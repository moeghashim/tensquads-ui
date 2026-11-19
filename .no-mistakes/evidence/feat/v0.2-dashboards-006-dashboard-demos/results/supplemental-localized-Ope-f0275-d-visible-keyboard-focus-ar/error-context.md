# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: supplemental.spec.ts >> localized OpenUI ChatLauncher has count and visible keyboard focus ar
- Location: .validation/supplemental.spec.ts:28:2

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('region', { name: 'عينة OpenUI' }).getByRole('button', { name: 'اسأل بيترا، ٤ بانتظارك' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('region', { name: 'عينة OpenUI' }).getByRole('button', { name: 'اسأل بيترا، ٤ بانتظارك' }) with timeout 5000ms
  - waiting for getByRole('region', { name: 'عينة OpenUI' }).getByRole('button', { name: 'اسأل بيترا، ٤ بانتظارك' })

```

```yaml
- banner:
  - link "tensquads":
    - /url: /?locale=ar&dir=rtl&theme=light
  - text: ui
  - navigation "التنقل الرئيسي":
    - link "الرئيسية":
      - /url: /?locale=ar&dir=rtl&theme=light
    - link "المكوّنات":
      - /url: /components?locale=ar&dir=rtl&theme=light
    - link "عرض المحادثة":
      - /url: /chat?locale=ar&dir=rtl&theme=light
    - link "لوحات المعلومات":
      - /url: /dashboards/home?locale=ar&dir=rtl&theme=light
    - link "البدء":
      - /url: /get-started?locale=ar&dir=rtl&theme=light
  - radiogroup "اللغة":
    - radio "English"
    - radio "العربية" [checked]
  - radiogroup "السمة":
    - radio "فاتحة" [checked]
    - radio "داكنة"
    - radio "النظام"
- main:
  - link "كل المكوّنات":
    - /url: /components?locale=ar&dir=rtl&theme=light
  - paragraph: المكوّنات
  - heading "ChatLauncher" [level=1]
  - region "مرجع الواجهة البرمجية":
    - region "الوصف":
      - heading "الوصف" [level=2]
      - paragraph:
        - text: Import
        - code: ChatLauncher
        - text: from
        - code: "@tensquads/ui/react"
        - text: . It is a floating button for opening the assistant chat. The host supplies
        - code: onClick
        - text: and controls navigation.
        - code: label
        - text: ","
        - code: waiting
        - text: ", and"
        - code: locale
        - text: set its localized label and optional waiting count. The accessible name includes the count. The OpenUI definition accepts
        - code: label
        - text: ","
        - code: waiting
        - text: ", and"
        - code: locale
        - text: ; host navigation remains a React callback.
    - region "الخصائص":
      - heading "الخصائص" [level=2]
  - region "أمثلة تفاعلية":
    - heading "أمثلة تفاعلية" [level=2]
    - link "Back to gallery":
      - /url: /components?locale=ar&dir=rtl&theme=light
    - region "عينة OpenUI":
      - button "اسأل بيترا ، ٤ بانتظارك"
  - heading "عينة OpenUI" [level=2]
  - group: عرض مصدر العينة
  - navigation "صفحات المكوّنات":
    - 'link "السابق: ApprovalCard"':
      - /url: /components/ApprovalCard?locale=ar&dir=rtl&theme=light
    - 'link "التالي: OwnerMessageView"':
      - /url: /components/OwnerMessageView?locale=ar&dir=rtl&theme=light
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | import { openPreview, capturePreviewScreenshots } from './helpers/preview';
  3  | 
  4  | for (const locale of ['en','ar'] as const) {
  5  |  const ar=locale==='ar';
  6  |  const state={locale,direction:ar?'rtl' as const:'ltr' as const,theme:'light' as const};
  7  |  test(`company status boundaries and image totals ${locale}`,async({page},info)=>{
  8  |   await openPreview(page,state,'/dashboards/admin');
  9  |   for(const [label,count] of [[ar?'نشطة':'Active',7],[ar?'تجريبية':'Trial',3],[ar?'متوقفة':'Paused',2]] as const){
  10 |    await page.getByRole('button',{name:label,exact:true}).click();
  11 |    await expect(page.getByRole('row')).toHaveCount(count);
  12 |   }
  13 |   await page.getByRole('button',{name:ar?'الكل':'All',exact:true}).click();
  14 |   await expect(page.getByRole('row')).toHaveCount(10);
  15 |   await page.getByRole('button',{name:ar?'صور الفرق':'Squad images',exact:true}).click();
  16 |   const url=new URL(page.url());
  17 |   for(const [key,value] of Object.entries({locale,dir:state.direction,theme:state.theme,view:'images'}))expect(url.searchParams.get(key)).toBe(value);
  18 |   await expect(page.getByRole('row')).toHaveCount(4);
  19 |   await expect(page.locator('.dashboard-stats .ts-stat-tile__value')).toHaveText(['3','3','2','3','5']);
  20 |   await page.getByRole('button',{name:ar?'تحتاج إلى مراجعة':'Needs attention',exact:true}).click();
  21 |   await expect(page.getByRole('row')).toHaveCount(3);
  22 |   await page.getByRole('button',{name:ar?'الكل':'All',exact:true}).click();
  23 |   const pisa=page.getByRole('row',{name:/squad\/pisa.svg/});
  24 |   await pisa.focus(); await pisa.press('Enter');
  25 |   await expect(page.locator('.dashboard-details')).toContainText('pisa.svg');
  26 |   await capturePreviewScreenshots(page,info,`image-totals-${locale}`,[1440]);
  27 |  });
  28 |  test(`localized OpenUI ChatLauncher has count and visible keyboard focus ${locale}`,async({page},info)=>{
  29 |   await openPreview(page,state,'/components/ChatLauncher');
  30 |   const fixture=page.getByRole('region',{name:ar?'عينة OpenUI':'OpenUI fixture'});
  31 |   const launcher=fixture.getByRole('button',{name:ar?'اسأل بيترا، ٤ بانتظارك':'Ask Petra, 4 waiting'});
> 32 |   await expect(launcher).toBeVisible();
     |                          ^ Error: expect(locator).toBeVisible() failed
  33 |   await launcher.focus();
  34 |   await expect(launcher).toBeFocused();
  35 |   await expect(launcher).toHaveCSS('outline-width','2px');
  36 |   await expect(launcher.locator('.ts-chat-launcher__count')).toHaveText(ar?'٤':'4');
  37 |   await capturePreviewScreenshots(page,info,`launcher-fixture-${locale}`,[390]);
  38 |  });
  39 |  test(`all owner decisions remove cards and keyboard launcher preserves state ${locale}`,async({page},info)=>{
  40 |   await openPreview(page,state,'/dashboards/home');
  41 |   for(let remaining=3;remaining>=0;remaining--){
  42 |    await page.getByRole('button',{name:remaining%2===0?(ar?'رفض':'Decline'):(ar?'موافقة':'Approve'),exact:true}).first().click();
  43 |    await expect(page.locator('.ts-card__count')).toHaveText(String(remaining));
  44 |   }
  45 |   await expect(page.locator('.ts-approval-card__content')).toHaveCount(0);
  46 |   await expect(page.locator('.sent-command pre')).toContainText('"decision": "reject"');
  47 |   await capturePreviewScreenshots(page,info,`owner-decisions-${locale}`,[390]);
  48 |   const launcher=page.getByRole('button',{name:ar?'اسأل بيترا':'Ask Petra',exact:true});
  49 |   await launcher.focus(); await expect(launcher).toBeFocused(); await launcher.press('Space');
  50 |   await expect(page).toHaveURL(/\/chat\?/);
  51 |   const url=new URL(page.url());
  52 |   for(const [key,value] of Object.entries({locale,dir:state.direction,theme:state.theme}))expect(url.searchParams.get(key)).toBe(value);
  53 |   await expect(page.locator('.ts-chat-launcher')).toHaveCount(0);
  54 |  });
  55 | }
  56 | 
```