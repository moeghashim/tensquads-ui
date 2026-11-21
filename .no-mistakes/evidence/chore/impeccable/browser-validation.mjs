import { chromium } from 'playwright';
import { writeFile, mkdir } from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7YKYQ3T7K7HREVNKYWTP5TG';
await mkdir(evidence,{recursive:true});
const browser=await chromium.launch();
const page=await browser.newPage();
const results=[];
const check=(value,message)=>{if(!value) throw new Error(message)};
const box=async l=>l.boundingBox();
const inside=(a,b)=>a && b && a.x>=b.x-1 && a.y>=b.y-1 && a.x+a.width<=b.x+b.width+1 && a.y+a.height<=b.y+b.height+1;
async function open(route,locale,theme,width=1440){await page.setViewportSize({width,height:1000});await page.goto(`http://localhost:5173${route}?locale=${locale}&dir=${locale==='ar'?'rtl':'ltr'}&theme=${theme}`);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(200);check(await page.locator('html').getAttribute('data-theme')===theme,'wrong rendered theme');check(await page.locator('html').getAttribute('lang')===locale,'wrong rendered locale');}
async function shot(name,loc){await (loc||page).screenshot({path:`${evidence}/${name}.png`,animations:'disabled',...(loc?{}:{fullPage:true})});}
async function scenario(name,fn){try{await fn();results.push({name,result:'pass'});}catch(e){results.push({name,result:'fail',error:String(e)});await shot(`failure-${results.length}`);}await writeFile(`${evidence}/browser-results.json`,JSON.stringify(results,null,2));}
async function contrast(locator){return locator.evaluate(el=>{const s=getComputedStyle(el);let bg=s.backgroundColor;let p=el;while(bg==='rgba(0, 0, 0, 0)'&&p.parentElement){p=p.parentElement;bg=getComputedStyle(p).backgroundColor;}const lum=c=>{const v=c.match(/[\d.]+/g).slice(0,3).map(Number).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});return .2126*v[0]+.7152*v[1]+.0722*v[2]};let a=lum(s.color),b=lum(bg);return {foreground:s.color,background:bg,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};});}
try{
for(const locale of ['en','ar'])for(const theme of ['light','dark']){
 await scenario(`Gallery tiles contain ChatLauncher, StatTile and PageHeader in ${locale} ${theme} at desktop and mobile widths`,async()=>{
  for(const width of [1440,390]){
   await open('/components',locale,theme,width);
   for(const name of ['ChatLauncher','StatTile','PageHeader']){
    const card=page.locator('.component-card').filter({has:page.locator(`a[href*="/components/${name}?"]`)});
    await card.scrollIntoViewIfNeeded();
    const content=card.locator(name==='ChatLauncher'?'.ts-chat-launcher':name==='StatTile'?'.ts-stat-tile':'.ts-page-header').first();
    check(inside(await box(content),await box(card.locator('.component-card__preview'))),`${name} escapes its gallery preview at ${width}`);
    if(name!=='ChatLauncher')check((await box(content)).width>=(await box(card.locator('.component-card__preview'))).width*.85,`${name} shrinks below useful tile width`);
    await shot(`gallery-${name}-${locale}-${theme}-${width}`,card);
   }
   check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'gallery horizontal overflow');
  }
 });
 await scenario(`Home stream status and dashboard waiting count meet 4.5:1 text contrast in ${locale} ${theme}`,async()=>{
  await open('/',locale,theme);
  const status=page.locator('.stream-code__status');const statusContrast=await contrast(status);check(statusContrast.ratio>=4.5,JSON.stringify(statusContrast));
  await shot(`stream-${locale}-${theme}`,page.locator('.stream-code'));
  await open('/dashboards/home',locale,theme,390);
  const launcher=page.locator('.ts-chat-launcher');const count=launcher.locator('.ts-chat-launcher__count');await count.waitFor();
  const countContrast=await contrast(count);check(countContrast.ratio>=4.5,JSON.stringify(countContrast));
  check(inside(await box(launcher),{x:0,y:0,width:390,height:1000}),'dashboard launcher outside viewport');
  await shot(`launcher-${locale}-${theme}`,launcher);
  results.push({measurement:{locale,theme,statusContrast,countContrast}});
  await launcher.focus();await page.keyboard.press('Enter');await page.waitForURL('**/chat?**');
 });
 await scenario(`StatTile grid keeps metrics separate as its container narrows in ${locale} ${theme}`,async()=>{
  await open('/dashboards/home',locale,theme);
  const grid=page.locator('.ts-stat-grid').first();
  for(const width of [900,500,260,120]){
   await grid.evaluate((el,w)=>el.style.inlineSize=w+'px',width);
   const tiles=await grid.locator('.ts-stat-tile').all();
   for(const tile of tiles){
    const tileBox=await box(tile);check(tileBox.width>=Math.min(width,128)-1,'tile below container-aware minimum');
    check(inside(tileBox,await box(grid)),'tile outside grid');
    const val=await box(tile.locator('.ts-stat-tile__value'));const trend=tile.locator('svg');
    if(await trend.count()){const t=await box(trend);check(val.x+val.width<=t.x+1||t.x+t.width<=val.x+1||val.y+val.height<=t.y+1||t.y+t.height<=val.y+1,'value overlaps trend');}
   }
   if(width===260||width===500)await shot(`stats-${locale}-${theme}-${width}`,grid);
  }
  await grid.evaluate(el=>el.style.removeProperty('inline-size'));
  for(const width of [390,339]){await page.setViewportSize({width,height:1000});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'stat page mobile overflow');}
 });
 await scenario(`PageHeader moves actions below copy in narrow desktop containers and on mobile in ${locale} ${theme}`,async()=>{
  await open('/components/PageHeader',locale,theme);
  const header=page.locator('.dashboard-component-preview > .ts-page-header');
  for(const width of [800,360,260]){
   await header.evaluate((el,w)=>el.style.inlineSize=w+'px',width);
   const copy=await box(header.locator('.ts-page-header__copy'));const actions=await box(header.locator('.ts-page-header__actions'));
   check(inside(copy,await box(header))&&inside(actions,await box(header)),'header content escapes');
   check(copy.x+copy.width<=actions.x+1||actions.x+actions.width<=copy.x+1||copy.y+copy.height<=actions.y+1,'copy and actions overlap');
   if(width<=360)check(actions.y>=copy.y+copy.height,'narrow desktop actions fail to wrap');
   if(width===360)await shot(`header-${locale}-${theme}-narrow`,header);
  }
  await header.evaluate(el=>el.style.removeProperty('inline-size'));
  await page.setViewportSize({width:390,height:1000});
  const c=await box(header.locator('.ts-page-header__copy')),a=await box(header.locator('.ts-page-header__actions'));check(a.y>=c.y+c.height,'mobile actions not below copy');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'header page horizontal overflow');
  await shot(`header-${locale}-${theme}-mobile`,header);
 });
}
}finally{await browser.close();await writeFile(`${evidence}/browser-results.json`,JSON.stringify(results,null,2));}
console.log(JSON.stringify(results,null,2));
process.exitCode=results.some(r=>r.result==='fail')?1:0;
