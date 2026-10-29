import http from 'node:http';
import {fixture} from './fixtures.mjs';
import {appendFileSync} from 'node:fs';
const port=5190;
http.createServer(async(req,res)=>{
 const u=new URL(req.url,'http://127.0.0.1:'+port);
 const cookies=Object.fromEntries((req.headers.cookie||'').split(';').map(x=>x.trim().split('=')));
 const role=cookies.demoRole==='CLIENTE'?'CLIENTE':'OPERADOR', scenario=cookies.demoScenario||'full';
 if(u.pathname==='/__demo'){
  const r=u.searchParams.get('role'),s=u.searchParams.get('scenario');
  if(r||s){res.writeHead(302,{'Set-Cookie':[`demoRole=${r==='CLIENTE'?'CLIENTE':'OPERADOR'}; Path=/; SameSite=Strict`,`demoScenario=${['empty','error','slow'].includes(s)?s:'full'}; Path=/; SameSite=Strict`],Location:'/?campaign=DEMO-C01'});return res.end();}
  res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});return res.end('<h1>Demostración local de PRISMO</h1><p>Todos los datos son ficticios. Escrituras e integraciones desactivadas.</p>'+['OPERADOR','CLIENTE'].flatMap(r=>['full','empty','error','slow'].map(s=>`<p><a href="/__demo?role=${r}&scenario=${s}">${r} · ${s}</a></p>`)).join(''));
 }
 if(u.pathname.startsWith('/api/')){
  appendFileSync(new URL('./requests.jsonl',import.meta.url),JSON.stringify({path:u.pathname,method:req.method,role,scenario})+'\n');
  res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');
  if(req.method!=='GET'){res.statusCode=409;return res.end(JSON.stringify({error:'Demostración local: no se guardó ningún cambio. Escrituras desactivadas.'}));}
  if(scenario==='slow')await new Promise(r=>setTimeout(r,8000));
  if(scenario==='error'&&u.pathname!=='/api/app-version'){res.statusCode=503;return res.end(JSON.stringify({error:'Servicio de demostración no disponible. Error simulado.'}));}
  const result=fixture(u.pathname,role,scenario);
  if(!result){res.statusCode=501;return res.end(JSON.stringify({error:'Esta integración no está reproducida en la demostración local.'}));}
  return res.end(JSON.stringify(result));
 }
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
 if(u.pathname.startsWith('/cdn-cgi')){res.writeHead(302,{Location:'/__demo'});return res.end();}
 try{
  const response=await fetch('http://127.0.0.1:8787'+u.pathname+u.search);
  res.statusCode=response.status;
  for(const k of ['content-type','cache-control'])if(response.headers.has(k))res.setHeader(k,response.headers.get(k));
  res.setHeader('Content-Security-Policy',"connect-src 'self'; img-src 'self' data: blob:; media-src 'self' blob:; frame-src 'self'");
  res.end(Buffer.from(await response.arrayBuffer()));
 }catch(e){res.writeHead(502);res.end('Origen local no disponible');}
}).listen(port,'127.0.0.1',()=>console.log('Demo local 127.0.0.1:'+port+'; sólo fixtures; sin escrituras'));
