import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {expect,test} from '@playwright/test';
const require=createRequire(new URL('../apps/preview/package.json',import.meta.url));
const {createServer}=await import(pathToFileURL(require.resolve('vite')).href);
let server:any,url:string;
const evidence='~/.no-mistakes/evidence/01M7TPSWRD43TYFTEVB7V8914N';
test.beforeAll(async()=>{server=await createServer({configFile:false,root:new URL('./fixture',import.meta.url).pathname,esbuild:{jsx:'automatic'},server:{host:'127.0.0.1',port:0,fs:{allow:[process.cwd()]}}});await server.listen();url=server.resolvedUrls.local[0];});
test.afterAll(async()=>{await server?.close();});
for(const locale of ['en','ar']) for(const theme of ['light','dark']){
test(`public dashboard library ${locale} ${theme}`,async({page})=>{
await page.goto(`${url}?locale=${locale}&theme=${theme}`);await expect(page.locator('#counts .ts-bar-chart__column')).toHaveCount(3);await page.evaluate(()=>document.fonts.ready);
for(const id of ['counts','stacked']){await expect(page.locator(`#${id} .ts-bar-chart__gridline`)).toHaveText(['10','5','0']);const ratios=await page.locator(`#${id} .ts-bar-chart__column`).evaluateAll(columns=>columns.map(c=>c.querySelector('.ts-bar-chart__stack')!.getBoundingClientRect().height/c.getBoundingClientRect().height));expect(ratios[0]).toBeCloseTo(.2,2);expect(ratios[1]).toBeCloseTo(.3,2);}
expect(await page.locator('#counts .ts-bar-chart__stack').last().evaluate(e=>e.getBoundingClientRect().height)).toBe(0);
await expect(page.locator('#fraction .ts-bar-chart__gridline')).toHaveText(['1.5','0.75','0']);
await expect(page.locator('#long .ts-bar-chart__tick')).toHaveCount(15);expect((await page.locator('#long .ts-bar-chart__tick').allTextContents()).filter(Boolean)).toEqual(['Day 1','Day 6','Day 11']);
await expect(page.locator('#entities .ts-data-table__tile')).toHaveText(['AS','NO','A','ما']);
await expect(page.locator('#approvals')).not.toContainText('internal_daily_rule');
await expect(page.locator('#hidden-rule .ts-approval-card__limit')).toContainText(locale==='ar'?'٢٠٫٠٠':'$20.00');
await expect(page.locator('#mapped-rule .ts-approval-card__limit')).toContainText(locale==='ar'?'حد الاسترداد اليومي':'Daily refund limit');
await expect(page.locator('#no-limit .ts-approval-card__limit')).toHaveCount(0);
await expect(page.locator('#openui .ts-approval-card__limit')).toContainText('Daily refund limit');await expect(page.locator('#openui .ts-approval-card__limit')).toContainText(locale==='ar'?'٢٠٫٠٠':'$20.00');
await page.locator('#openui').getByRole('button',{name:'Deny',exact:true}).click();await expect(page.locator('#openui .ts-approval-card__outcome')).toHaveText(locale==='ar'?'تم الرفض':'Declined');
await expect(page.locator('#openui').getByRole('button',{name:'Allow',exact:true})).toBeDisabled();
await expect(page.locator('#commands')).toContainText('"approvalId":"stream","contentHash":"hash-stream","decision":"reject"');
await page.locator('#mapped-rule').getByRole('button',{name:locale==='ar'?'موافقة':'Approve',exact:true}).click();await expect(page.locator('#mapped-rule .ts-approval-card__outcome')).toHaveText(locale==='ar'?'تمت الموافقة':'Approved');
for(const width of [1440,390]){await page.setViewportSize({width,height:900});await page.locator('#currency').scrollIntoViewIfNeeded();const chart=page.locator('#currency');await expect(chart.getByRole('button',{name:'B: $10,000.00'})).toBeVisible();
const bounds=await chart.evaluate(e=>{const viewport=e.querySelector('.ts-bar-chart__viewport')!.getBoundingClientRect();return [...e.querySelectorAll('.ts-bar-chart__gridline > span')].map(label=>{const b=label.getBoundingClientRect();return b.left>=viewport.left&&b.right<=viewport.right;});});expect(bounds).toEqual([true,true,true]);
await chart.getByRole('button',{name:'A: $6,000.00'}).hover();await expect(page.getByRole('tooltip')).toContainText('A: $6,000.00');await page.screenshot({path:`${evidence}/currency-${locale}-${theme}-${width}.png`,fullPage:false});
}
await page.setViewportSize({width:900,height:1000});await page.locator('#entities').screenshot({path:`${evidence}/initials-${locale}-${theme}.png`});await page.locator('#approvals').screenshot({path:`${evidence}/approvals-${locale}-${theme}.png`});await page.locator('#counts').screenshot({path:`${evidence}/counts-${locale}-${theme}.png`});
});}
