# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: supplemental.spec.ts >> company status boundaries and image totals en
- Location: .validation/supplemental.spec.ts:7:2

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Squad images', exact: true })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - link "tensquads" [ref=e5] [cursor=pointer]:
        - /url: /?locale=en&dir=ltr&theme=light
      - generic [ref=e11]: ui
    - navigation "Primary navigation" [ref=e12]:
      - link "Home" [ref=e13] [cursor=pointer]:
        - /url: /?locale=en&dir=ltr&theme=light
      - link "Components" [ref=e14] [cursor=pointer]:
        - /url: /components?locale=en&dir=ltr&theme=light
      - link "Chat demo" [ref=e15] [cursor=pointer]:
        - /url: /chat?locale=en&dir=ltr&theme=light
      - link "Dashboards" [ref=e16] [cursor=pointer]:
        - /url: /dashboards/home?locale=en&dir=ltr&theme=light
      - link "Get started" [ref=e17] [cursor=pointer]:
        - /url: /get-started?locale=en&dir=ltr&theme=light
    - generic [ref=e18]:
      - radiogroup "Language" [ref=e19]:
        - radio "English" [checked] [ref=e20] [cursor=pointer]
        - radio [checked] [aria-hidden]
        - radio "العربية" [ref=e21] [cursor=pointer]
        - radio [aria-hidden]
      - radiogroup "Theme" [ref=e22]:
        - radio "Light" [checked] [ref=e23] [cursor=pointer]
        - radio [checked] [aria-hidden]
        - radio "Dark" [ref=e24] [cursor=pointer]
        - radio [aria-hidden]
        - radio "System" [ref=e25] [cursor=pointer]
        - radio [aria-hidden]
  - main [ref=e26]:
    - generic [ref=e27]:
      - navigation "Admin navigation" [ref=e29]:
        - generic [ref=e34]:
          - strong [ref=e35]: Platform admin
          - generic [ref=e36]: Workspace
        - generic [ref=e37]:
          - heading "Workspace" [level=2] [ref=e38]
          - generic [ref=e39]:
            - button "Companies" [ref=e40] [cursor=pointer]
            - button "Squad images 2" [ref=e45] [cursor=pointer]:
              - generic [ref=e49]: Squad images
              - generic [ref=e50]: "2"
        - generic [ref=e51]:
          - heading "Coming next" [level=2] [ref=e52]
          - generic [ref=e53]:
            - generic [ref=e54]: Usage and billing
            - generic [ref=e59]: Platform health
            - generic [ref=e64]: Admin users
        - generic [ref=e69]:
          - generic [aria-hidden] [ref=e70]: MG
          - generic [ref=e71]:
            - strong [ref=e72]: Moe Ghashim
            - generic [ref=e73]: Super admin
      - generic [ref=e74]:
        - generic [ref=e75]:
          - generic [ref=e77]:
            - heading "Companies" [level=1] [ref=e78]
            - paragraph [ref=e79]: A view of companies, squads, and platform activity
          - generic [ref=e80]:
            - generic [ref=e81]: Demo data
            - generic [ref=e82]: 53 squads online now
        - generic [ref=e83]:
          - article [ref=e84]:
            - generic [ref=e85]: Companies
            - generic [ref=e87]: "9"
            - generic [ref=e90]: Across all plans
          - article [ref=e92]:
            - generic [ref=e93]: Active companies
            - generic [ref=e95]: "6"
            - generic [ref=e98]: Currently subscribed
          - article [ref=e100]:
            - generic [ref=e101]: Squads
            - generic [ref=e103]: "66"
            - generic [ref=e106]: Across all companies
          - article [ref=e108]:
            - generic [ref=e109]: Tasks done 7d
            - generic [ref=e111]: 4,765
            - generic [ref=e114]: In the last 7 days
          - article [ref=e116]:
            - generic [ref=e117]: Monthly recurring
            - generic [ref=e119]: $1,294
            - generic [ref=e122]: Current monthly value
          - article [ref=e124]:
            - generic [ref=e125]: All-time value
            - generic [ref=e127]: $14,568
            - generic [ref=e130]: Since launch
        - generic [ref=e132]:
          - generic [ref=e133]:
            - generic [ref=e135]:
              - heading "Companies created, last 8 weeks" [level=2] [ref=e137]
              - paragraph [ref=e138]: New company accounts
            - generic [ref=e140]:
              - paragraph [ref=e141]: "Companies created, last 8 weeks: W1: 4, W2: 5, W3: 4, W4: 7, W5: 6, W6: 8, W7: 9, W8: 11"
              - generic [ref=e142]:
                - generic [ref=e143]:
                  - generic [ref=e144]: "11"
                  - generic [ref=e146]: "5.5"
                  - generic [ref=e148]: "0"
                  - generic [ref=e150]:
                    - 'button "W1: 4" [ref=e151] [cursor=pointer]'
                    - 'button "W2: 5" [ref=e154] [cursor=pointer]'
                    - 'button "W3: 4" [ref=e157] [cursor=pointer]'
                    - 'button "W4: 7" [ref=e160] [cursor=pointer]'
                    - 'button "W5: 6" [ref=e163] [cursor=pointer]'
                    - 'button "W6: 8" [ref=e166] [cursor=pointer]'
                    - 'button "W7: 9" [ref=e169] [cursor=pointer]'
                    - 'button "W8: 11" [ref=e172] [cursor=pointer]'
                - generic [aria-hidden] [ref=e175]:
                  - generic [ref=e176]: W1
                  - generic [ref=e177]: W2
                  - generic [ref=e178]: W3
                  - generic [ref=e179]: W4
                  - generic [ref=e180]: W5
                  - generic [ref=e181]: W6
                  - generic [ref=e182]: W7
                  - generic [ref=e183]: W8
          - generic [ref=e184]:
            - generic [ref=e186]:
              - heading "Companies by plan" [level=2] [ref=e188]
              - paragraph [ref=e189]: Current plan mix
            - list [ref=e192]:
              - listitem [ref=e193]:
                - generic [ref=e194]:
                  - generic [ref=e195]: Growth
                  - generic [ref=e196]: "4"
                - 'generic "Growth: 4" [ref=e197]'
              - listitem [ref=e199]:
                - generic [ref=e200]:
                  - generic [ref=e201]: Starter
                  - generic [ref=e202]: "3"
                - 'generic "Starter: 3" [ref=e203]'
              - listitem [ref=e205]:
                - generic [ref=e206]:
                  - generic [ref=e207]: Scale
                  - generic [ref=e208]: "2"
                - 'generic "Scale: 2" [ref=e209]'
        - generic [ref=e211]:
          - generic [ref=e212]:
            - generic [ref=e213]:
              - heading "All companies" [level=2] [ref=e215]
              - paragraph [ref=e216]: Company accounts across the platform
            - generic [ref=e219]:
              - textbox "Search companies" [ref=e220]:
                - /placeholder: Search
              - button "All" [active] [ref=e221] [cursor=pointer]
              - button "Active" [ref=e222] [cursor=pointer]
              - button "Trial" [ref=e223] [cursor=pointer]
              - button "Paused" [ref=e224] [cursor=pointer]
          - generic "All companies" [ref=e226]:
            - table [ref=e227]:
              - caption [ref=e228]: All companies
              - rowgroup [ref=e229]:
                - row [ref=e230]:
                  - columnheader "Company and mission" [ref=e231]
                  - columnheader "Owner" [ref=e232]
                  - columnheader "Plan" [ref=e233]
                  - columnheader "Subscription" [ref=e234]
                  - columnheader "Started" [ref=e235]
                  - columnheader "All-time value" [ref=e236]
                  - columnheader "Squads" [ref=e237]
                  - columnheader "Online" [ref=e238]
              - rowgroup [ref=e239]:
                - row [ref=e240]:
                  - cell "Northstar Goods Everyday outdoor essentials" [ref=e241]:
                    - generic [ref=e242]:
                      - generic [aria-hidden] [ref=e243]: "No"
                      - generic [ref=e244]:
                        - strong [ref=e245]: Northstar Goods
                        - generic "Everyday outdoor essentials" [ref=e246]
                  - cell "Amira Haddad amira@example.com" [ref=e247]:
                    - generic [ref=e248]:
                      - strong [ref=e249]: Amira Haddad
                      - generic "amira@example.com" [ref=e250]
                  - cell "Growth" [ref=e251]
                  - cell "Active" [ref=e252]
                  - cell "Oct 18, 2025" [ref=e254]
                  - cell "$3,420" [ref=e255]
                  - cell "8" [ref=e256]
                  - cell "7" [ref=e257]
                - row [ref=e258]:
                  - cell "Cedar & Stone Thoughtful home objects" [ref=e259]:
                    - generic [ref=e260]:
                      - generic [aria-hidden] [ref=e261]: Ce
                      - generic [ref=e262]:
                        - strong [ref=e263]: Cedar & Stone
                        - generic "Thoughtful home objects" [ref=e264]
                  - cell "Lina Rahman lina@example.com" [ref=e265]:
                    - generic [ref=e266]:
                      - strong [ref=e267]: Lina Rahman
                      - generic "lina@example.com" [ref=e268]
                  - cell "Starter" [ref=e269]
                  - cell "Trial" [ref=e270]
                  - cell "Nov 02, 2025" [ref=e272]
                  - cell "$1,860" [ref=e273]
                  - cell "5" [ref=e274]
                  - cell "4" [ref=e275]
                - row [ref=e276]:
                  - cell "Golden Hour Small batch skincare" [ref=e277]:
                    - generic [ref=e278]:
                      - generic [aria-hidden] [ref=e279]: Go
                      - generic [ref=e280]:
                        - strong [ref=e281]: Golden Hour
                        - generic "Small batch skincare" [ref=e282]
                  - cell "Nadia Saleh nadia@example.com" [ref=e283]:
                    - generic [ref=e284]:
                      - strong [ref=e285]: Nadia Saleh
                      - generic "nadia@example.com" [ref=e286]
                  - cell "Scale" [ref=e287]
                  - cell "Active" [ref=e288]
                  - cell "Aug 11, 2025" [ref=e290]
                  - cell "$4,105" [ref=e291]
                  - cell "12" [ref=e292]
                  - cell "11" [ref=e293]
                - row [ref=e294]:
                  - cell "Field Notes Co. Paper goods for curious minds" [ref=e295]:
                    - generic [ref=e296]:
                      - generic [aria-hidden] [ref=e297]: Fi
                      - generic [ref=e298]:
                        - strong [ref=e299]: Field Notes Co.
                        - generic "Paper goods for curious minds" [ref=e300]
                  - cell "Sami Nasser sami@example.com" [ref=e301]:
                    - generic [ref=e302]:
                      - strong [ref=e303]: Sami Nasser
                      - generic "sami@example.com" [ref=e304]
                  - cell "Growth" [ref=e305]
                  - cell "Paused" [ref=e306]
                  - cell "Jun 21, 2025" [ref=e308]
                  - cell "$2,018" [ref=e309]
                  - cell "9" [ref=e310]
                  - cell "2" [ref=e311]
                - row [ref=e312]:
                  - cell "Morrow Supply Low waste kitchen tools" [ref=e313]:
                    - generic [ref=e314]:
                      - generic [aria-hidden] [ref=e315]: Mo
                      - generic [ref=e316]:
                        - strong [ref=e317]: Morrow Supply
                        - generic "Low waste kitchen tools" [ref=e318]
                  - cell "Dalia Faris dalia@example.com" [ref=e319]:
                    - generic [ref=e320]:
                      - strong [ref=e321]: Dalia Faris
                      - generic "dalia@example.com" [ref=e322]
                  - cell "Growth" [ref=e323]
                  - cell "Active" [ref=e324]
                  - cell "Oct 03, 2025" [ref=e326]
                  - cell "$1,208" [ref=e327]
                  - cell "7" [ref=e328]
                  - cell "6" [ref=e329]
                - row [ref=e330]:
                  - cell "Bluebird Press Independent books and journals" [ref=e331]:
                    - generic [ref=e332]:
                      - generic [aria-hidden] [ref=e333]: Bl
                      - generic [ref=e334]:
                        - strong [ref=e335]: Bluebird Press
                        - generic "Independent books and journals" [ref=e336]
                  - cell "Rami Khalil rami@example.com" [ref=e337]:
                    - generic [ref=e338]:
                      - strong [ref=e339]: Rami Khalil
                      - generic "rami@example.com" [ref=e340]
                  - cell "Starter" [ref=e341]
                  - cell "Active" [ref=e342]
                  - cell "Sep 16, 2025" [ref=e344]
                  - cell "$964" [ref=e345]
                  - cell "4" [ref=e346]
                  - cell "4" [ref=e347]
                - row [ref=e348]:
                  - cell "Good Form Studio Daily movement essentials" [ref=e349]:
                    - generic [ref=e350]:
                      - generic [aria-hidden] [ref=e351]: Go
                      - generic [ref=e352]:
                        - strong [ref=e353]: Good Form Studio
                        - generic "Daily movement essentials" [ref=e354]
                  - cell "Hana Nabil hana@example.com" [ref=e355]:
                    - generic [ref=e356]:
                      - strong [ref=e357]: Hana Nabil
                      - generic "hana@example.com" [ref=e358]
                  - cell "Scale" [ref=e359]
                  - cell "Trial" [ref=e360]
                  - cell "Nov 05, 2025" [ref=e362]
                  - cell "$612" [ref=e363]
                  - cell "10" [ref=e364]
                  - cell "9" [ref=e365]
                - row [ref=e366]:
                  - cell "Wildfern Pantry Seasonal pantry staples" [ref=e367]:
                    - generic [ref=e368]:
                      - generic [aria-hidden] [ref=e369]: Wi
                      - generic [ref=e370]:
                        - strong [ref=e371]: Wildfern Pantry
                        - generic "Seasonal pantry staples" [ref=e372]
                  - cell "Yara Mansour yara@example.com" [ref=e373]:
                    - generic [ref=e374]:
                      - strong [ref=e375]: Yara Mansour
                      - generic "yara@example.com" [ref=e376]
                  - cell "Starter" [ref=e377]
                  - cell "Active" [ref=e378]
                  - cell "Jul 08, 2025" [ref=e380]
                  - cell "$271" [ref=e381]
                  - cell "6" [ref=e382]
                  - cell "5" [ref=e383]
                - row [ref=e384]:
                  - cell "Orbit Cycle Repairable city bicycles" [ref=e385]:
                    - generic [ref=e386]:
                      - generic [aria-hidden] [ref=e387]: Or
                      - generic [ref=e388]:
                        - strong [ref=e389]: Orbit Cycle
                        - generic "Repairable city bicycles" [ref=e390]
                  - cell "Karim Odeh karim@example.com" [ref=e391]:
                    - generic [ref=e392]:
                      - strong [ref=e393]: Karim Odeh
                      - generic "karim@example.com" [ref=e394]
                  - cell "Growth" [ref=e395]
                  - cell "Active" [ref=e396]
                  - cell "May 12, 2025" [ref=e398]
                  - cell "$110" [ref=e399]
                  - cell "5" [ref=e400]
                  - cell "5" [ref=e401]
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
> 15 |   await page.getByRole('button',{name:ar?'صور الفرق':'Squad images',exact:true}).click();
     |                                                                                  ^ Error: locator.click: Test timeout of 30000ms exceeded.
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
  32 |   await expect(launcher).toBeVisible();
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