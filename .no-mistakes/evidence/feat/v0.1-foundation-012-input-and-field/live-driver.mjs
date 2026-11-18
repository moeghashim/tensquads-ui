import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const evidence='~/.no-mistakes/evidence/01M7PW8P4S5GKXNZ25E44Z2QJ6';
const browser=await chromium.launch({headless:true});
const log=[];
try {
 const page=await browser.newPage({viewport:{width:900,height:1000}});
 page.on('pageerror',e=>log.push({pageerror:String(e)}));
 for(const locale of ['en','ar']){
 await page.goto(`http://127.0.0.1:5188/.test-phase/index.html?locale=${locale}`);
 await page.evaluate(l=>{document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr'},locale);
 for(const component of ['Input','Field']){
 const prefix=component==='Input'?'root = Input("Stream search", "Find", "':'root = Field("Stream search", "query", "Find", "';
 await page.evaluate(s=>window.updateStream(s),prefix+'N');
 const input=page.getByRole('textbox',{name:'Stream search'});
 await expect(input).toHaveValue('N');
 await input.evaluate(el=>el.setAttribute('data-persistent','yes'));
 for(const fragment of ['North','Northstar']) {
 await page.evaluate(s=>window.updateStream(s),prefix+fragment+'")');
 await expect(input).toHaveValue(fragment);
 await expect(input).toHaveAttribute('data-persistent','yes');
 }
 const edit=locale==='ar'?'مشروعي':'My project';
 await input.fill(edit);
 await page.evaluate(()=>window.rerender());
 await expect(input).toHaveValue(edit);
 await page.screenshot({path:`${evidence}/stream-${component}-${locale}.png`,fullPage:true});
 await page.evaluate(s=>window.updateStream(s),prefix+'")');
 await expect(input).toHaveValue('');
 log.push({scenario:'stream',component,locale,partial:'N',completed:'Northstar',userEdit:edit,retainedOnRerender:true,clearedByIncomingValue:true,sameDOMNode:true});
 }
 const search=page.getByRole('searchbox',{name:'Website'});
 await expect(search).toHaveAttribute('data-slot','input');
 await expect(search).toHaveAttribute('name','website');
 await expect(search).toHaveClass(/ts-input--outline/);
 await expect(page.getByTestId('input-group')).toHaveJSProperty('tagName','SECTION');
 await search.fill('example.org');
 await expect(page.getByLabel('Value event')).toContainText('input-change');
 await page.getByRole('button',{name:'Clear website'}).focus();
 await page.keyboard.press('Enter');
 await expect(search).toHaveValue('');
 await expect(search).toBeFocused();
 await expect(page.getByLabel('Value event')).toContainText('clear-press');
 await expect(page.getByRole('button',{name:'Clear website'})).toHaveCount(0);
 await expect(page.getByTestId('input-group')).toHaveClass('empty');
 const group=page.getByRole('group',{name:'Address'});
 await expect(group).toHaveAttribute('data-slot','field-set');
 await expect(group).toHaveAccessibleDescription('Delivery address');
 await expect(page.getByText('Address',{exact:true})).toHaveJSProperty('tagName','DIV');
 await expect(page.getByTestId('field-group')).toHaveJSProperty('tagName','SECTION');
 for(const name of ['City','Postal code'])await expect(page.getByRole('textbox',{name,exact:true})).toBeDisabled();
 await page.getByRole('button',{name:'Submit address'}).click();
 await expect(page.getByLabel('Submitted address')).toHaveText('{}');
 await page.getByRole('button',{name:'Toggle field set'}).click();
 for(const name of ['City','Postal code'])await expect(page.getByRole('textbox',{name,exact:true})).toBeEnabled();
 await page.getByText('City',{exact:true}).click();
 await expect(page.getByRole('textbox',{name:'City',exact:true})).toBeFocused();
 await page.getByRole('button',{name:'Submit address'}).click();
 await expect(page.getByLabel('Submitted address')).toHaveText('{"city":"Chicago","postal":"60601"}');
 await expect(page.getByText('Project is required',{exact:true})).toBeHidden();
 await page.getByRole('button',{name:'Validate',exact:true}).click();
 const required=page.getByRole('textbox',{name:'Required project'});
 await expect(required).toBeFocused();
 await expect(required).toHaveAttribute('aria-invalid','true');
 await expect(required).toHaveAccessibleDescription(/Project is required/);
 await required.fill('Atlas');
 await expect(page.getByText('Project is required',{exact:true})).toBeHidden();
 await page.getByRole('button',{name:'Reset',exact:true}).click();
 await expect(required).toHaveValue('');
 await expect(page.getByText('Project is required',{exact:true})).toBeHidden();
 await page.screenshot({path:`${evidence}/parts-${locale}.png`,fullPage:true});
 log.push({scenario:'parts',locale,direction:locale==='ar'?'rtl':'ltr',clear:'keyboard Enter clears, emits clear-press and restores focus',disabledSubmission:{},enabledSubmission:{city:'Chicago',postal:'60601'},validation:'empty submit focuses control and associates error; filling hides error; reset restores default'});
 }
 console.log(JSON.stringify(log,null,2));
 await writeFile(`${evidence}/live-behavior.json`,JSON.stringify(log,null,2));
}finally{await browser.close()}
