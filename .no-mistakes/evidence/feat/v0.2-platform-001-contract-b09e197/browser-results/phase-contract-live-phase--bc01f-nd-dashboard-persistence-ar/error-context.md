# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: phase-contract-live.spec.ts >> phase approval details and dashboard persistence ar
- Location: e2e/phase-contract-live.spec.ts:5:3

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  locator('.ts-approval-card').first().locator('.ts-approval-card__amount')
Expected: "٤٢٫٠٠ US$"
Received: "‏٤٢٫٠٠ US$"
Timeout:  5000ms

Call log:
  - Expect "toHaveText" locator('.ts-approval-card').first().locator('.ts-approval-card__amount') with timeout 5000ms
  - waiting for locator('.ts-approval-card').first().locator('.ts-approval-card__amount')
    14 × locator resolved to <strong class="ts-approval-card__amount">‏٤٢٫٠٠ US$</strong>
       - unexpected value "‏٤٢٫٠٠ US$"

```

```yaml
- strong: ‏٤٢٫٠٠ US$
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
> 9  |     await expect(cards.first().locator('.ts-approval-card__amount')).toHaveText(locale === 'en' ? '$42.00' : '٤٢٫٠٠ US$');
     |                                                                      ^ Error: expect(locator).toHaveText(expected) failed
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
  28 |     expect(commands).toEqual([
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