import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {expect,test} from '@playwright/test';
const require=createRequire(new URL('../apps/preview/package.json',import.meta.url));
const {createServer}=await import(pathToFileURL(require.resolve('vite')).href);
let server:any,url:string;
const evidence='~/.no-mistakes/evidence/01M7TPSWRD43TYFTEVB7V8914N';
test.beforeAll(async()=>{server=await createServer({configFile:false,root:process.cwd()+'/.phase-test',server:{host:'127.0.0.1',port:0,fs:{allow:[process.cwd()]}}});await server.listen();url=server.resolvedUrls.local[0];});
test.afterAll(async()=>{await server?.close();});
for(const locale of ['en','ar']) for(const theme of ['light','dark']) {
 test(`Consumer counts currency initials and approval labels ${locale} ${theme}`,async({page})=>{
 await page.goto(`${url}?locale=${locale}&theme=${theme}`);
 await expect(page.locator('#counts .ts-bar-chart__column')).toHaveCount(3);
 await page.evaluate(()=>document.fonts.ready);
 await expect(page.locator('#counts .ts-bar-chart__gridline > span')).toHaveText(['10','5','0']);
 const heights=await page.locator('#counts .ts-bar-chart__column').evaluateAll(cols=>cols.map(c=>({column:c.getBoundingClientRect().height,mark:c.querySelector('.ts-bar-chart__stack')!.getBoundingClientRect().height})));
 expect(heights[0].mark/heights[0].column).toBeCloseTo(.2,2);expect(heights[1].mark/heights[1].column).toBeCloseTo(.3,2);expect(heights[2].mark).toBe(0);
 await expect(page.locator('#initials .ts-data-table__tile')).toHaveText(['NG','NO','AS','BS']);
 await expect(page.locator('#unmapped')).not.toContainText('daily_limit');
 await expect(page.locator('#unmapped .ts-approval-card__limit')).toContainText(locale==='ar'?'٢٠٫٠٠':'$20.00');
 await expect(page.locator('#mapped .ts-approval-card__limit')).toContainText('Daily refund limit');
 await expect(page.locator('#stream').getByRole('button',{name:'Allow',exact:true})).toBeEnabled();
 await expect(page.locator('#stream').getByRole('button',{name:'رفض',exact:true})).toBeEnabled();
 await expect(page.locator('#stream')).toContainText('Daily refund limit');
 for(const width of [1440,390]){
 await page.setViewportSize({width,height:1000});
 const currency=page.locator('#currency');
 await expect(currency.locator('.ts-bar-chart__gridline > span')).toHaveText(['$10,000.00','$5,000.00','$0.00']);
 const bounds=await currency.evaluate(el=>{const v=el.querySelector('.ts-bar-chart__viewport')!.getBoundingClientRect();return [...el.querySelectorAll('.ts-bar-chart__gridline > span')].map(l=>{const r=l.getBoundingClientRect();const range=document.createRange();range.selectNodeContents(l);const t=range.getBoundingClientRect();return {left:r.left-v.left,right:v.right-r.right,textInside:t.left>=v.left && t.right<=v.right};});});
 for(const b of bounds){expect(b.left).toBeGreaterThanOrEqual(0);expect(b.right).toBeGreaterThanOrEqual(0);expect(b.textInside).toBe(true);}
 const cols=currency.locator('.ts-bar-chart__column');await cols.first().focus();await page.keyboard.press(locale==='ar'?'ArrowLeft':'ArrowRight');await expect(cols.nth(1)).toBeFocused();
 await expect(page.getByRole('tooltip')).toContainText('B: $10,000.00');
 await page.screenshot({path:`${evidence}/consumer-${locale}-${theme}-${width}.png`,fullPage:true});
 await cols.nth(1).blur();
 }
 await page.locator('#stream').getByRole('button',{name:'Allow',exact:true}).click();
 await expect(page.locator('#stream')).toContainText('تمت الموافقة');
 await expect(page.locator('#stream').getByRole('button',{name:'رفض',exact:true})).toBeDisabled();
 await expect(page.getByRole('status',{name:'Sent commands'})).toContainText('"approvalId":"a1","contentHash":"hash-42","decision":"approve"');
 await page.screenshot({path:`${evidence}/approval-decided-${locale}-${theme}.png`,fullPage:true});
 });
}
