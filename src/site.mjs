import {randomBytes} from 'node:crypto';
import {readConfig,byPath,byKind,sections} from './config.mjs';
import {loadArchive,resolvePublicMedia} from './data.mjs';
import {defaultSettings} from './demo.mjs';
import {shell,home,listing,detail,criteria,privacy,adminPage,emptyState} from './views.mjs';
import {esc,validSlug} from './utils.mjs';

export async function handleRequest(req,res,overrides={}) {
  const nonce = randomBytes(18).toString('base64');
  let config;
  try { config=overrides.config || readConfig(); }
  catch(err) { console.error('Configuration error:',err.message); res.writeHead(503,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}); res.end('Configuración pendiente. Revisa las variables del proyecto; no se publicaron datos de demostración como datos reales.'); return; }
  const url = new URL(req.url || '/','http://localhost');
  let path=url.pathname.replace(/\/+$/,'') || '/';
  const apiOrigin=config.supabaseUrl || '';
  const csp = `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' ${apiOrigin} data: blob:; connect-src 'self' ${apiOrigin}; frame-src https://www.youtube-nocookie.com; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`;
  const headers = {'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','X-Frame-Options':'DENY','Permissions-Policy':'camera=(), microphone=(), geolocation=()','Content-Security-Policy':csp};
  if(!config.index||path==='/admin') headers['X-Robots-Tag']='noindex, nofollow';
  if(req.method && !['GET','HEAD'].includes(req.method)) { res.writeHead(405,{...headers,Allow:'GET, HEAD'}); res.end('Método no permitido'); return; }
  if(path==='/robots.txt') { res.writeHead(200,{...headers,'Content-Type':'text/plain; charset=utf-8'}); res.end(config.index ? `User-agent: *\nAllow: /\nDisallow: /admin\n${config.siteUrl?`Sitemap: ${config.siteUrl}/sitemap.xml\n`:''}` : 'User-agent: *\nDisallow: /\n'); return; }
  if(path==='/api/health') {res.writeHead(200,{...headers,'Content-Type':'application/json'});res.end(JSON.stringify({ok:true,mode:config.mode,configured:config.configured,version:'0.1.0'}));return;}
  if(path.startsWith('/media/')) {
    try {
      const location=await (overrides.resolvePublicMedia || resolvePublicMedia)(config,path.slice(7));
      res.writeHead(location?302:404,{...headers,...(location?{Location:location}:{})});
      res.end(req.method==='HEAD'?'':(location?'':'Imagen no disponible')); return;
    } catch {res.writeHead(503,headers);res.end('Imagen temporalmente no disponible');return;}
  }
  let title='Inicio',active='',body='',status=200,settings=defaultSettings,items=[];
  try {
    if(path==='/admin') { title='Administración';body=adminPage(config); }
    else if(path==='/criterios') { title='Criterios y fuentes';body=criteria(); }
    else {
      const archive=await (overrides.loadArchive || loadArchive)(config); items=archive.items; settings=archive.settings;
      if(path==='/sitemap.xml') {
        const links=['/',...sections.map(s=>`/${s.path}`),'/criterios','/privacidad',...items.filter(i=>!i.is_demo).map(i=>`/${byKind[i.kind].path}/${i.slug}`)];
        const body=`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${config.index&&config.siteUrl?links.map(p=>`<url><loc>${esc(config.siteUrl+p)}</loc></url>`).join(''):''}</urlset>`;
        res.writeHead(200,{...headers,'Content-Type':'application/xml; charset=utf-8'});res.end(body);return;
      }
      if(path==='/') body=home(items,settings);
      else if(path==='/privacidad') {title='Privacidad';body=privacy(settings);}
      else {
        const [sectionPath,slug,...rest]=path.slice(1).split('/'); const section=byPath[sectionPath];
        if(section&&!slug) {title=section.label;active=section.path;body=listing(section,items,url.searchParams);}
        else if(section&&validSlug(slug)&&rest.length===0) {
          const item=items.find(i=>i.kind===section.kind&&i.slug===slug);
          if(item) {title=item.title;active=section.path;body=detail(item);} else status=404;
        } else status=404;
      }
    }
  } catch(err) { console.error('Archive load failure:',err.message);status=503;title='Archivo temporalmente no disponible';body=`<section class="wrap section-space">${emptyState('No fue posible consultar el archivo','La conexión con la base de datos no está disponible. Intenta nuevamente. No se mostrarán ejemplos en lugar de información real.')}<a class="button primary" href="/">Volver a intentar</a></section>`; }
  if(status===404) {title='Página no encontrada';body=`<section class="wrap section-space">${emptyState('Esta ficha no está disponible','Puede no existir o no estar publicada.')}<a class="button primary" href="/">Volver al inicio</a></section>`;}
  if(status!==200) headers['X-Robots-Tag']='noindex, nofollow';
  const html=shell({config,settings,title,active,body,path,admin:path==='/admin',nonce});
  res.writeHead(status,headers);res.end(req.method==='HEAD'?'':html);
}
