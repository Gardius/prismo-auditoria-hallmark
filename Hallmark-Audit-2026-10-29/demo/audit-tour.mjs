import {chromium} from 'playwright-core';import AxeBuilder from '@axe-core/playwright';import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
await context.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));const records=[];
async function shot(name,axe=false){await page.waitForTimeout(700);await page.screenshot({path:`captures/${name}.png`});await page.screenshot({path:`captures/${name}-full.png`,fullPage:true});const record={name,url:page.url(),text:await page.locator('body').innerText(),errors:[...errors],geometry:await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight})),buttons:await page.locator('button:visible').allTextContents()};if(axe)record.axe=(await new AxeBuilder({page}).analyze()).violations;records.push(record);await fs.writeFile('tour.json',JSON.stringify(records,null,2));console.log(name,record.geometry,errors);}
async function nav(name){await page.getByRole('navigation',{name:'Navegación principal'}).getByRole('button',{name,exact:true}).click();}
async function run(name,fn){try{await fn()}catch(e){console.log('FAILED',name,e.message.slice(0,200));records.push({name,error:e.message});}}
await page.goto('http://127.0.0.1:5190/__demo?role=OPERADOR',{waitUntil:'networkidle'});
await shot('01-operador-home',true);
await page.getByRole('tab',{name:/Seguimiento/}).click();await shot('02-seguimiento');
await nav('Campañas');await shot('03-campanas',true);
await run('pieza',async()=>{await page.getByRole('button',{name:'Piezas',exact:true}).click();await shot('04-piezas');});
await nav('Talentos 6');await shot('05-talentos');
await run('talento',async()=>{await page.getByRole('button').filter({hasText:'Alba Ejemplo'}).first().click();await shot('06-talento-detalle');});
await nav('Clientes 1');await shot('07-clientes');
await nav('Contratos');await shot('08-contratos');
await run('nuevo-contrato',async()=>{await page.getByRole('button',{name:/Nuevo contrato/}).first().click();await shot('09-contrato-form');});
await nav('Agencias');await shot('10-agencias');
await nav('Macros');await shot('11-macros',true);
await nav('Herramientas');await shot('12-herramientas');
await nav('Talentos 6');const before=page.url();await page.reload({waitUntil:'networkidle'});await shot('13-recarga-talentos');records.push({name:'recarga-talentos-evidence',before,after:page.url()});
await page.goto('http://127.0.0.1:5190/__demo?role=CLIENTE',{waitUntil:'networkidle'});await shot('14-cliente-home',true);
await nav('Campañas');await shot('15-cliente-campana');
await page.setViewportSize({width:390,height:844});await shot('16-cliente-movil',true);
await page.goto('http://127.0.0.1:5190/__demo?role=OPERADOR',{waitUntil:'networkidle'});await shot('17-operador-movil',true);
await nav('Macros');await shot('18-macros-movil');
for(const role of ['OPERADOR','CLIENTE']){await page.goto(`http://127.0.0.1:5190/__demo?role=${role}&scenario=empty`,{waitUntil:'networkidle'});await shot('19-vacio-'+role);}
await page.goto('http://127.0.0.1:5190/__demo?role=OPERADOR&scenario=error',{waitUntil:'networkidle'});await shot('20-error');
await page.goto('http://127.0.0.1:5190/__demo?role=OPERADOR&scenario=slow',{waitUntil:'domcontentloaded'});await page.waitForTimeout(1500);await shot('21-carga');
await fs.writeFile('tour.json',JSON.stringify(records,null,2));await browser.close();
