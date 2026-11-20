import { expect, test } from '@playwright/test';
import { openPreview } from './helpers/preview';
const evidence = '~/.no-mistakes/evidence/01M7VWXNB6F1BKSS2D1T6BMTKF';
for (const locale of ['en', 'ar'] as const) {
  test(`phase approval details and dashboard persistence ${locale}`, async ({page}) => {
    const state = {locale, direction: locale === 'ar' ? 'rtl' as const : 'ltr' as const, theme: 'light' as const};
    await openPreview(page, state, '/components/ApprovalCard');
    const cards = page.locator('.ts-approval-card');
    await expect(cards.first().locator('.ts-approval-card__amount')).toHaveText(locale === 'en' ? '$42.00' : '\u200f٤٢٫٠٠ US$');
    await expect(cards.first().locator('.ts-approval-card__agent')).toContainText(locale === 'en' ? 'Petra' : /[\u0600-\u06ff]/);
    await expect(cards.first().locator('.ts-approval-card__task')).toContainText('task_42');
    await expect(cards.nth(1).locator('.ts-approval-card__agent')).toHaveCount(0);
    await expect(cards.nth(1).locator('.ts-approval-card__task')).toContainText('task-1042');
    await page.locator('.owner-message-preview').screenshot({path: `${evidence}/approval-details-${locale}.png`});
    await openPreview(page, state, '/components/OwnerMessageView');
    const settled = page.locator('.owner-message-preview');
    for (const button of await settled.locator('button').all()) {
      await expect(button).toBeDisabled();
      await button.evaluate((element: HTMLButtonElement) => element.click());
    }
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    await expect(settled.locator('pre')).toHaveText('[]');
    await settled.screenshot({path:`${evidence}/settled-no-repeat-${locale}.png`});
    await openPreview(page, state, '/dashboards/home');
    const requests = page.locator('.ts-approval-card');
    await expect(requests).toHaveCount(4);
    await expect(requests.nth(1).locator('.ts-approval-card__amount')).toHaveCount(0);
    await expect(requests.nth(1).locator('.ts-approval-card__limit')).toHaveCount(0);
    await expect(requests.nth(3).locator('.ts-approval-card__agent')).toHaveCount(0);
    await expect(requests.nth(3)).not.toContainText('unmapped-bot');
    await expect(requests.nth(3).locator('.ts-approval-card__task')).toContainText('task-1088');
    await requests.first().getByRole('button', {name: locale === 'en' ? 'Approve' : 'موافقة', exact: true}).click();
    await requests.first().getByRole('button', {name: locale === 'en' ? 'Decline' : 'رفض', exact: true}).click();
    await expect(requests).toHaveCount(2);
    await page.locator('.sent-commands summary').click();
    const commands = JSON.parse((await page.locator('.sent-commands pre').textContent())!);
    expect(commands).toEqual({type:'ApprovalDecision', approvalId:'approval-1043', contentHash:'sha256:request-1043', decision:'reject'});
    await page.getByRole('radio', {name: locale === 'en' ? 'العربية' : 'English', exact:true}).click();
    await expect(requests).toHaveCount(2);
    await expect(requests.first().locator('.ts-approval-card__task')).toContainText('task-1044');
    await page.screenshot({path:`${evidence}/dashboard-decisions-${locale}.png`, fullPage:true});
  });
}
