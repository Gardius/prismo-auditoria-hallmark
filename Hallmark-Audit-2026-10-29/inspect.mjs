import { chromium } from 'playwright-core';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]){
 const context=await browser.newContext({viewport:{width,height}}); const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173',{waitUntil:'networkidle',timeout:120000});
 await page.screenshot({path:`${name}.png`,fullPage:true});
 const data={url:page.url(),text:await page.locator('body').innerText(),errors,links:await page.locator('a').evaluateAll(es=>es.map(e=>({text:e.textContent,href:e.getAttribute('href')}))),buttons:await page.locator('button').allTextContents(),axe:(await new AxeBuilder({page}).analyze()).violations};
 await fs.writeFile(`${name}.json`,JSON.stringify(data,null,2));
 await context.close();
}
await browser.close();
