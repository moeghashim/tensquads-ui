# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase-admin.spec.ts >> phase company filters and image attention boundary en
- Location: ../../worktrees/383d5bb0a3fa/01M7TR2K5KB9FWFR7D5HNWYW27/e2e/phase-admin.spec.ts:4:2

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
        - /url: /?locale=en&dir=ltr&theme=dark
      - generic [ref=e11]: ui
    - navigation "Primary navigation" [ref=e12]:
      - link "Home" [ref=e13] [cursor=pointer]:
        - /url: /?locale=en&dir=ltr&theme=dark
      - link "Components" [ref=e14] [cursor=pointer]:
        - /url: /components?locale=en&dir=ltr&theme=dark
      - link "Chat demo" [ref=e15] [cursor=pointer]:
        - /url: /chat?locale=en&dir=ltr&theme=dark
      - link "Dashboards" [ref=e16] [cursor=pointer]:
        - /url: /dashboards/home?locale=en&dir=ltr&theme=dark
      - link "Get started" [ref=e17] [cursor=pointer]:
        - /url: /get-started?locale=en&dir=ltr&theme=dark
    - generic [ref=e18]:
      - radiogroup "Language" [ref=e19]:
        - radio "English" [checked] [ref=e20] [cursor=pointer]
        - radio [checked] [aria-hidden]
        - radio "العربية" [ref=e21] [cursor=pointer]
        - radio [aria-hidden]
      - radiogroup "Theme" [ref=e22]:
        - radio "Light" [ref=e23] [cursor=pointer]
        - radio [aria-hidden]
        - radio "Dark" [checked] [ref=e24] [cursor=pointer]
        - radio [checked] [aria-hidden]
        - radio "System" [ref=e25] [cursor=pointer]
        - radio [aria-hidden]
  - main [ref=e26]:
    - generic [ref=e27]:
      - navigation "Platform admin" [ref=e29]:
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
            - generic [ref=e90]: +1 in the last 2 weeks
          - article [ref=e92]:
            - generic [ref=e93]: Active companies
            - generic [ref=e95]: "6"
            - generic [ref=e98]: 2 on trial · 1 paused
          - article [ref=e100]:
            - generic [ref=e101]: Squads
            - generic [ref=e103]: "66"
            - generic [ref=e106]: 53 online right now
          - article [ref=e108]:
            - generic [ref=e109]: Tasks done 7d
            - generic [ref=e111]: 4,765
            - generic [ref=e114]: +9% vs last week
          - article [ref=e116]:
            - generic [ref=e117]: Monthly recurring
            - generic [ref=e119]: $1,294
            - generic [ref=e122]: 6 paying companies
          - article [ref=e124]:
            - generic [ref=e125]: All-time value
            - generic [ref=e127]: $14,568
            - generic [ref=e130]: Avg $2,081 per paying company
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
            - generic [ref=e191]:
              - list [ref=e192]:
                - listitem [ref=e193]:
                  - generic [ref=e194]:
                    - generic [ref=e195]: Growth
                    - generic [ref=e196]: 4 companies · 27 squads
                  - 'generic "Growth: 4 companies · 27 squads" [ref=e197]'
                - listitem [ref=e199]:
                  - generic [ref=e200]:
                    - generic [ref=e201]: Starter
                    - generic [ref=e202]: 3 companies · 17 squads
                  - 'generic "Starter: 3 companies · 17 squads" [ref=e203]'
                - listitem [ref=e205]:
                  - generic [ref=e206]:
                    - generic [ref=e207]: Scale
                    - generic [ref=e208]: 2 companies · 22 squads
                  - 'generic "Scale: 2 companies · 22 squads" [ref=e209]'
              - paragraph [ref=e211]: Average of 7.3 squads per company
        - generic [ref=e212]:
          - generic [ref=e213]:
            - generic [ref=e214]:
              - heading "All companies" [level=2] [ref=e216]
              - paragraph [ref=e217]: Company accounts across the platform
            - generic [ref=e220]:
              - textbox "Search companies" [active] [ref=e221]:
                - /placeholder: Search
                - text: AMIRA
              - button "All" [ref=e222] [cursor=pointer]
              - button "Active" [ref=e223] [cursor=pointer]
              - button "Trial" [ref=e224] [cursor=pointer]
              - button "Paused" [ref=e225] [cursor=pointer]
          - generic "All companies" [ref=e227]:
            - table [ref=e228]:
              - caption [ref=e229]: All companies
              - rowgroup [ref=e230]:
                - row [ref=e231]:
                  - columnheader "Company and mission" [ref=e232]
                  - columnheader "Owner" [ref=e233]
                  - columnheader "Plan" [ref=e234]
                  - columnheader "Subscription" [ref=e235]
                  - columnheader "Started" [ref=e236]
                  - columnheader "All-time value" [ref=e237]
                  - columnheader "Squads" [ref=e238]
                  - columnheader "Online" [ref=e239]
              - rowgroup [ref=e240]:
                - row [ref=e241]:
                  - cell "Northstar Goods Everyday outdoor essentials" [ref=e242]:
                    - generic [ref=e243]:
                      - generic [aria-hidden] [ref=e244]: "No"
                      - generic [ref=e245]:
                        - strong [ref=e246]: Northstar Goods
                        - generic "Everyday outdoor essentials" [ref=e247]
                  - cell "Amira Haddad amira@example.com" [ref=e248]:
                    - generic [ref=e249]:
                      - strong [ref=e250]: Amira Haddad
                      - generic "amira@example.com" [ref=e251]
                  - cell "Growth" [ref=e252]
                  - cell "Active" [ref=e253]
                  - cell "Oct 18, 2025" [ref=e255]
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