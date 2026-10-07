import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {extname,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {handleRequest} from '../src/site.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
if(existsSync(resolve(root,'.env'))) process.loadEnvFile(resolve(root,'.env'));
const publicRoot=resolve(root,'public');
const types={'.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.ico':'image/x-icon'};
const server=createServer(async(req,res)=>{
 try {
  const url=new URL(req.url,'http://localhost');
  if(url.pathname.startsWith('/assets/')) {
   if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return;}
   const file=resolve(publicRoot,'.'+decodeURIComponent(url.pathname));
   if(!file.startsWith(publicRoot+sep)){res.writeHead(403);res.end();return;}
   const info=await stat(file).catch(()=>null);
   if(!info?.isFile()){res.writeHead(404);res.end('Archivo no encontrado');return;}
   res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
   res.end(req.method==='HEAD'?undefined:await readFile(file));return;
  }
  await handleRequest(req,res);
 } catch(err){console.error('Request failed:',err.message);if(!res.headersSent)res.writeHead(500);res.end('No fue posible atender la solicitud.');}
});
const port=Number(process.env.PORT||3000);
server.listen(port,'127.0.0.1',()=>console.log(`HT Web listo: http://localhost:${port}\nModo: ${process.env.CONTENT_MODE||'demo'} · Ctrl+C para cerrar.`));
