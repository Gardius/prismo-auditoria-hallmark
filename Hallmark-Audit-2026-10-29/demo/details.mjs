import {chromium} from 'playwright-core';import fs from 'node:fs/promises';
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});const c=await b.newContext({viewport:{width:1440,height:1000}});await c.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());const p=await c.newPage();p.setDefaultTimeout(5000);const records=[];
async function shot(name){await p.waitForTimeout(700);await p.screenshot({path:`captures/${name}.png`});await p.screenshot({path:`captures/${name}-full.png`,fullPage:true});const r={name,text:await p.locator('body').innerText(),buttons:await p.locator('button:visible').allTextContents()};records.push(r);await fs.writeFile('details.json',JSON.stringify(records,null,2));console.log(name,r.buttons);}
async function nav(name){await p.getByRole('navigation',{name:'Navegación principal'}).getByRole('button',{name,exact:true}).click();}
async function attempt(name,f){try{await f()}catch(e){records.push({name,error:e.message});console.log(name,e.message.slice(0,100));}}
await p.goto('http://127.0.0.1:5190/__demo?role=CLIENTE',{waitUntil:'networkidle'});
await p.setViewportSize({width:390,height:844});await shot('22-cliente-home-movil');
await p.getByRole('button',{name:'Aprobar sin cambios',exact:true}).scrollIntoViewIfNeeded();await shot('23-cliente-decision-movil');
await p.getByRole('button',{name:'Aprobar sin cambios',exact:true}).click();await shot('24-cliente-guardado-bloqueado');
await p.setViewportSize({width:1440,height:1000});await p.goto('http://127.0.0.1:5190/__demo?role=OPERADOR',{waitUntil:'networkidle'});
await p.getByRole('button',{name:'Ver material',exact:true}).first().click();await shot('25-pieza-detalle');await p.keyboard.press('Escape');
await nav('Contratos');await p.getByRole('button',{name:'Nuevo contrato',exact:true}).click();
await attempt('validation',async()=>{await p.getByRole('button',{name:/Continuar|Siguiente/}).last().click();await shot('26-contrato-validacion');});
await nav('Agencias');await p.getByRole('button',{name:'Agencia Prisma Demo',exact:true}).click();await shot('27-agencia-detalle');
await nav('Macros');
await attempt('macro-detail',async()=>{await p.getByRole('button').filter({hasText:'Alba Ejemplo'}).first().click();await shot('28-macro-expediente');});
const summaries=await p.locator('summary:visible').allTextContents();console.log('SUMMARIES',summaries);
await attempt('finance',async()=>{await p.locator('summary').filter({hasText:/Finanzas|Financ|Cobros|Pagos/}).first().click();await shot('29-macro-finanzas');});
await nav('Herramientas');await p.getByRole('button',{name:'Mantenimiento',exact:true}).click();await shot('30-mantenimiento');
await fs.writeFile('details.json',JSON.stringify(records,null,2));await b.close();
