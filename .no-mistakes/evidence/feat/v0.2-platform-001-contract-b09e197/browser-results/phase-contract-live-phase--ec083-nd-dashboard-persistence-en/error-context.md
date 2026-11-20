# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase-contract-live.spec.ts >> phase approval details and dashboard persistence en
- Location: e2e/phase-contract-live.spec.ts:5:3

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

Expected: [{"approvalId": "approval-1042", "contentHash": "sha256:request-1042", "decision": "approve", "type": "ApprovalDecision"}, {"approvalId": "approval-1043", "contentHash": "sha256:request-1043", "decision": "reject", "type": "ApprovalDecision"}]
Received: {"approvalId": "approval-1043", "contentHash": "sha256:request-1043", "decision": "reject", "type": "ApprovalDecision"}
```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - banner [ref=f1e3]:
    - generic [ref=f1e4]:
      - link "tensquads" [ref=f1e5] [cursor=pointer]:
        - /url: /?locale=en&dir=ltr&theme=light
      - generic [ref=f1e11]: ui
    - navigation "Primary navigation" [ref=f1e12]:
      - link "Home" [ref=f1e13] [cursor=pointer]:
        - /url: /?locale=en&dir=ltr&theme=light
      - link "Components" [ref=f1e14] [cursor=pointer]:
        - /url: /components?locale=en&dir=ltr&theme=light
      - link "Chat demo" [ref=f1e15] [cursor=pointer]:
        - /url: /chat?locale=en&dir=ltr&theme=light
      - link "Dashboards" [ref=f1e16] [cursor=pointer]:
        - /url: /dashboards/home?locale=en&dir=ltr&theme=light
      - link "Get started" [ref=f1e17] [cursor=pointer]:
        - /url: /get-started?locale=en&dir=ltr&theme=light
    - generic [ref=f1e18]:
      - radiogroup "Language" [ref=f1e19]:
        - radio "English" [checked] [ref=f1e20] [cursor=pointer]
        - radio [checked] [aria-hidden]
        - radio "العربية" [ref=f1e21] [cursor=pointer]
        - radio [aria-hidden]
      - radiogroup "Theme" [ref=f1e22]:
        - radio "Light" [checked] [ref=f1e23] [cursor=pointer]
        - radio [checked] [aria-hidden]
        - radio "Dark" [ref=f1e24] [cursor=pointer]
        - radio [aria-hidden]
        - radio "System" [ref=f1e25] [cursor=pointer]
        - radio [aria-hidden]
  - main [ref=f1e26]:
    - generic [ref=f1e27]:
      - navigation "Store navigation" [ref=f1e29]:
        - generic [ref=f1e34]:
          - strong [ref=f1e35]: Moe's store
          - generic [ref=f1e36]: Workspace
        - generic [ref=f1e37]:
          - heading "Squad" [level=2] [ref=f1e38]
          - generic [ref=f1e39]:
            - generic [ref=f1e40]:
              - img "Petra, Running skill" [ref=f1e41]
              - generic [ref=f1e42]:
                - strong [ref=f1e43]: Petra
                - generic [ref=f1e44]: Runs 5 squads · Demo store
            - generic [ref=f1e45]:
              - img "Pisa, Running skill" [ref=f1e46]
              - generic [ref=f1e47]:
                - strong [ref=f1e48]: Pisa
                - generic [ref=f1e49]: Orders
              - generic [ref=f1e51]: Online
            - generic [ref=f1e52]:
              - img "Kyoto, Idle" [ref=f1e53]
              - generic [ref=f1e54]:
                - strong [ref=f1e55]: Kyoto
                - generic [ref=f1e56]: Marketing
              - generic [ref=f1e58]: Online
            - generic [ref=f1e59]:
              - img "Rio, Running skill" [ref=f1e60]
              - generic [ref=f1e61]:
                - strong [ref=f1e62]: Rio
                - generic [ref=f1e63]: Inventory
              - generic [ref=f1e65]: Online
            - generic [ref=f1e66]:
              - img "Zurich, Idle" [ref=f1e67]
              - generic [ref=f1e68]:
                - strong [ref=f1e69]: Zurich
                - generic [ref=f1e70]: Support
              - generic [ref=f1e72]: Idle
            - generic [ref=f1e73]:
              - img "Giza, Running skill" [ref=f1e74]
              - generic [ref=f1e75]:
                - strong [ref=f1e76]: Giza
                - generic [ref=f1e77]: Analytics
              - generic [ref=f1e79]: Online
        - generic [ref=f1e80]:
          - generic [aria-hidden] [ref=f1e81]: MG
          - generic [ref=f1e82]:
            - strong [ref=f1e83]: Moe Ghashim
            - generic [ref=f1e84]: Store owner
      - generic [ref=f1e85]:
        - generic [ref=f1e86]:
          - generic [ref=f1e88]:
            - heading "Good morning, Moe" [level=1] [ref=f1e89]
            - paragraph [ref=f1e90]: Here is your store overview for today
          - generic [ref=f1e91]:
            - generic [ref=f1e92]:
              - generic [ref=f1e93]: Mission
              - text: Make skincare feel simple
            - generic [ref=f1e94]: Demo data
            - generic [ref=f1e95]: 4 of 5 squads online
        - generic [ref=f1e96]:
          - article [ref=f1e97]:
            - generic [ref=f1e98]: Revenue
            - generic [ref=f1e100]:
              - generic [ref=f1e101]: $24,680
              - img "Revenue" [ref=f1e103]
            - generic [ref=f1e107]:
              - generic [ref=f1e108]: +12% vs last week
              - generic [ref=f1e109]: This month
          - article [ref=f1e110]:
            - generic [ref=f1e111]: Orders
            - generic [ref=f1e113]:
              - generic [ref=f1e114]: 1,284
              - img "Orders" [ref=f1e116]
            - generic [ref=f1e120]:
              - generic [ref=f1e121]: +8% vs last week
              - generic [ref=f1e122]: This month
          - article [ref=f1e123]:
            - generic [ref=f1e124]: Average order
            - generic [ref=f1e126]:
              - generic [ref=f1e127]: $19.22
              - img "Average order" [ref=f1e129]
            - generic [ref=f1e133]:
              - generic [ref=f1e134]: +4% vs last week
              - generic [ref=f1e135]: Across all orders
          - article [ref=f1e136]:
            - generic [ref=f1e137]: Profit margin
            - generic [ref=f1e139]:
              - generic [ref=f1e140]: 32.8%
              - img "Profit margin" [ref=f1e142]
            - generic [ref=f1e146]:
              - generic [ref=f1e147]: "-1 pt vs last week"
              - generic [ref=f1e148]: After operating costs
          - article [ref=f1e149]:
            - generic [ref=f1e150]: Tasks done by squads
            - generic [ref=f1e152]:
              - generic [ref=f1e153]: "186"
              - img "Tasks done by squads" [ref=f1e155]
            - generic [ref=f1e159]: Across your squads
          - article [ref=f1e161]:
            - generic [ref=f1e162]: Hours saved
            - generic [ref=f1e164]:
              - generic [ref=f1e165]:
                - generic [ref=f1e166]: "42.5"
                - generic [ref=f1e167]: h
              - img "Hours saved" [ref=f1e168]
            - generic [ref=f1e172]: Estimated this week
        - generic [ref=f1e174]:
          - generic [ref=f1e175]:
            - generic [ref=f1e177]:
              - heading "Revenue, last 14 days" [level=2] [ref=f1e179]
              - paragraph [ref=f1e180]: Daily revenue
            - generic [ref=f1e182]:
              - paragraph [ref=f1e183]: "Revenue, last 14 days: 1: 700, 2: 738, 3: 776, 4: 814, 5: 852, 6: 890, 7: 928, 8: 850, 9: 884, 10: 918, 11: 952, 12: 986, 13: 1020, 14: 1054"
              - generic [ref=f1e185]:
                - generic [ref=f1e186]:
                  - generic: "1200"
                  - generic: "600"
                  - generic: "0"
                  - generic [ref=f1e190]:
                    - 'button "1: 700" [ref=f1e191] [cursor=pointer]'
                    - 'button "2: 738" [ref=f1e194] [cursor=pointer]'
                    - 'button "3: 776" [ref=f1e197] [cursor=pointer]'
                    - 'button "4: 814" [ref=f1e200] [cursor=pointer]'
                    - 'button "5: 852" [ref=f1e203] [cursor=pointer]'
                    - 'button "6: 890" [ref=f1e206] [cursor=pointer]'
                    - 'button "7: 928" [ref=f1e209] [cursor=pointer]'
                    - 'button "8: 850" [ref=f1e212] [cursor=pointer]'
                    - 'button "9: 884" [ref=f1e215] [cursor=pointer]'
                    - 'button "10: 918" [ref=f1e218] [cursor=pointer]'
                    - 'button "11: 952" [ref=f1e221] [cursor=pointer]'
                    - 'button "12: 986" [ref=f1e224] [cursor=pointer]'
                    - 'button "13: 1020" [ref=f1e227] [cursor=pointer]'
                    - 'button "14: 1054" [ref=f1e230] [cursor=pointer]'
                - generic [aria-hidden] [ref=f1e233]:
                  - generic [ref=f1e234]: "1"
                  - generic [ref=f1e235]: "2"
                  - generic [ref=f1e236]: "3"
                  - generic [ref=f1e237]: "4"
                  - generic [ref=f1e238]: "5"
                  - generic [ref=f1e239]: "6"
                  - generic [ref=f1e240]: "7"
                  - generic [ref=f1e241]: "8"
                  - generic [ref=f1e242]: "9"
                  - generic [ref=f1e243]: "10"
                  - generic [ref=f1e244]: "11"
                  - generic [ref=f1e245]: "12"
                  - generic [ref=f1e246]: "13"
                  - generic [ref=f1e247]: "14"
              - list [ref=f1e248]:
                - listitem [ref=f1e249]: Previous week
                - listitem [ref=f1e251]: This week
          - generic [ref=f1e253]:
            - generic [ref=f1e256]:
              - heading "Needs your approval" [level=2] [ref=f1e257]
              - generic [ref=f1e258]: "2"
            - generic [ref=f1e259]:
              - generic [ref=f1e260]:
                - generic [ref=f1e261]:
                  - heading "Discount" [level=2] [ref=f1e265]
                  - generic [ref=f1e266]:
                    - generic [ref=f1e267]:
                      - generic [ref=f1e268]:
                        - img "Kyoto, Waiting" [ref=f1e269]
                        - text: Kyoto
                      - generic [ref=f1e270]: "Task: task-1044"
                    - paragraph [ref=f1e271]: Offer a 15% discount on the next order
                    - paragraph [ref=f1e272]:
                      - generic [ref=f1e273]:
                        - generic [ref=f1e274]: Amount
                        - strong [ref=f1e275]: $15.00
                      - generic [ref=f1e276]: Discount limit
                      - generic [ref=f1e277]: Limit $20.00
                    - generic [ref=f1e278]:
                      - button "Approve" [ref=f1e279] [cursor=pointer]
                      - button "Decline" [ref=f1e280] [cursor=pointer]
                - generic [ref=f1e281]:
                  - heading "Refund" [level=2] [ref=f1e285]
                  - generic [ref=f1e286]:
                    - generic [ref=f1e287]: "Task: task-1088"
                    - paragraph [ref=f1e289]: Refund order 1088 after duplicate payment
                    - paragraph [ref=f1e290]:
                      - generic [ref=f1e291]:
                        - generic [ref=f1e292]: Amount
                        - strong [ref=f1e293]: $42.00
                      - generic [ref=f1e294]: Refund limit
                      - generic [ref=f1e295]: Limit $55.00
                    - generic [ref=f1e296]:
                      - button "Approve" [ref=f1e297] [cursor=pointer]
                      - button "Decline" [ref=f1e298] [cursor=pointer]
              - group [ref=f1e299]:
                - generic "Sent commands" [active] [ref=f1e300] [cursor=pointer]
                - generic [ref=f1e301]: "{ \"type\": \"ApprovalDecision\", \"approvalId\": \"approval-1043\", \"decision\": \"reject\", \"contentHash\": \"sha256:request-1043\" }"
    - button "Ask Petra , 2 waiting" [ref=f1e302] [cursor=pointer]:
      - generic [ref=f1e305]: Ask Petra
      - generic [aria-hidden] [ref=f1e306]: "2"
      - generic [ref=f1e307]: ", 2 waiting"
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | import { openPreview } from './helpers/preview';
  3  | const evidence = '~/.no-mistakes/evidence/01M7VWXNB6F1BKSS2D1T6BMTKF';
  4  | for (const locale of ['en', 'ar'] as const) {
  5  |   test(`phase approval details and dashboard persistence ${locale}`, async ({page}) => {
  6  |     const state = {locale, direction: locale === 'ar' ? 'rtl' as const : 'ltr' as const, theme: 'light' as const};
  7  |     await openPreview(page, state, '/components/ApprovalCard');
  8  |     const cards = page.locator('.ts-approval-card');
  9  |     await expect(cards.first().locator('.ts-approval-card__amount')).toHaveText(locale === 'en' ? '$42.00' : '٤٢٫٠٠ US$');
  10 |     await expect(cards.first().locator('.ts-approval-card__agent')).toContainText(locale === 'en' ? 'Petra' : 'بيترا');
  11 |     await expect(cards.first().locator('.ts-approval-card__task')).toContainText('task_42');
  12 |     await expect(cards.nth(1).locator('.ts-approval-card__agent')).toHaveCount(0);
  13 |     await expect(cards.nth(1).locator('.ts-approval-card__task')).toContainText('task-1042');
  14 |     await page.locator('.owner-message-preview').screenshot({path: `${evidence}/approval-details-${locale}.png`});
  15 |     await openPreview(page, state, '/dashboards/home');
  16 |     const requests = page.locator('.ts-approval-card');
  17 |     await expect(requests).toHaveCount(4);
  18 |     await expect(requests.nth(1).locator('.ts-approval-card__amount')).toHaveCount(0);
  19 |     await expect(requests.nth(1).locator('.ts-approval-card__limit')).toHaveCount(0);
  20 |     await expect(requests.nth(3).locator('.ts-approval-card__agent')).toHaveCount(0);
  21 |     await expect(requests.nth(3)).not.toContainText('unmapped-bot');
  22 |     await expect(requests.nth(3).locator('.ts-approval-card__task')).toContainText('task-1088');
  23 |     await requests.first().getByRole('button', {name: locale === 'en' ? 'Approve' : 'موافقة', exact: true}).click();
  24 |     await requests.first().getByRole('button', {name: locale === 'en' ? 'Decline' : 'رفض', exact: true}).click();
  25 |     await expect(requests).toHaveCount(2);
  26 |     await page.locator('.sent-commands summary').click();
  27 |     const commands = JSON.parse((await page.locator('.sent-commands pre').textContent())!);
> 28 |     expect(commands).toEqual([
     |                      ^ Error: expect(received).toEqual(expected) // deep equality
  29 |       {type:'ApprovalDecision', approvalId:'approval-1042', contentHash:'sha256:request-1042', decision:'approve'},
  30 |       {type:'ApprovalDecision', approvalId:'approval-1043', contentHash:'sha256:request-1043', decision:'reject'},
  31 |     ]);
  32 |     await page.getByRole('button', {name: locale === 'en' ? 'العربية' : 'English', exact:true}).click();
  33 |     await expect(requests).toHaveCount(2);
  34 |     await expect(requests.first().locator('.ts-approval-card__task')).toContainText('task-1044');
  35 |     await page.screenshot({path:`${evidence}/dashboard-decisions-${locale}.png`, fullPage:true});
  36 |   });
  37 | }
  38 | 
```