import {demoItems, defaultSettings} from './demo.mjs';
import {safeImageUrl} from './utils.mjs';
const columns = 'id,kind,slug,title,topic,year_start,year_end,role,location,summary,body,participation,partners,investment_amount,investment_scope,investment_method,beneficiaries,beneficiary_unit,beneficiary_method,sources,details,status,verification,featured,updated_at,published_at';

export async function supabaseRequest(config, path, options = {}) {
  const response = await fetch(`${config.supabaseUrl}${path}`, {
    ...options, headers:{apikey:config.key, ...(config.key.startsWith('eyJ') ? {Authorization:`Bearer ${config.key}`} : {}), 'Content-Type':'application/json', ...options.headers}, signal:AbortSignal.timeout(10000), cache:'no-store'
  });
  if (!response.ok) {
    // No devolver claves, cuerpos de respuesta ni datos internos al visitante.
    console.error('Supabase request failed', response.status, path.split('?')[0]);
    throw new Error('No fue posible consultar el archivo.');
  }
  return response.status === 204 ? null : response.json();
}
export async function signMedia(config, paths) {
  const list = [...new Set(paths.filter(Boolean))];
  if (!list.length) return {};
  const result = await supabaseRequest(config, '/storage/v1/object/sign/ht-media', {method:'POST', body:JSON.stringify({paths:list, expiresIn:120})});
  return Object.fromEntries((Array.isArray(result) ? result : []).filter(x => x.signedURL && !x.error).map(x => [x.path, safeImageUrl(`${config.supabaseUrl}/storage/v1${x.signedURL}`)]));
}
export async function loadArchive(config) {
  if (config.mode === 'demo') return {items:demoItems.map(i=>({...i,media:[]})),settings:defaultSettings};
  const allItems = []; let offset = 0;
  // Paginación real: no se trunca silenciosamente en las primeras 1,000 filas.
  while (true) {
    const query = new URLSearchParams({select:columns, status:'eq.published',verification:'eq.verified', order:'year_start.desc.nullslast,title.asc',limit:'250',offset:String(offset)});
    const batch = await supabaseRequest(config, `/rest/v1/ht_content?${query}`);
    allItems.push(...batch); if (batch.length < 250) break; offset += 250;
    if (offset > 5000) throw new Error('El catálogo supera esta versión. Amplía la paginación antes de publicar.');
  }
  const settingsRows = await supabaseRequest(config, '/rest/v1/ht_site_settings?select=name,portrait_path,portrait_alt,portrait_credit,portrait_rights_confirmed,contact_email,privacy_notice&id=eq.1');
  const settings = {...defaultSettings, ...(settingsRows?.[0] || {})};
  // Las políticas del bucket vuelven a comprobar publicación y autorización.
  const media = [];
  for (let start = 0; start < allItems.length; start += 100) {
    const ids = allItems.slice(start,start+100).map(i=>i.id).join(',');
    const query = new URLSearchParams({select:'id,content_id,path,purpose,alt,credit,taken_on,source_url,rights_confirmed,sort_order', content_id:`in.(${ids})`,order:'sort_order.asc',limit:'1000'});
    const batch = await supabaseRequest(config, `/rest/v1/ht_media?${query}`);
    // Cada ficha admite como máximo ocho imágenes desde este panel.
    if (batch.length === 1000) throw new Error('Demasiadas imágenes para un lote.');
    media.push(...batch);
  }
  return {items:allItems.map(item=>({...item,media:media.filter(m=>m.content_id===item.id).map(m=>({...m,url:`/media/${m.id}`}))})), settings:{...settings,portrait_url:settings.portrait_rights_confirmed && settings.portrait_path ? '/media/portrait' : ''}};
}

// Se comprueba acceso en cada solicitud. La URL firmada expira en dos minutos.
// No se almacenan URLs temporales en fichas ni se exponen archivos de borrador.
export async function resolvePublicMedia(config, id) {
  if (config.mode !== 'live') return '';
  let path='';
  if (id==='portrait') {
    const rows=await supabaseRequest(config,'/rest/v1/ht_site_settings?select=portrait_path,portrait_rights_confirmed&id=eq.1');
    if(rows[0]?.portrait_rights_confirmed) path=rows[0].portrait_path;
  } else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(id)) {
    const rows=await supabaseRequest(config,`/rest/v1/ht_media?select=path&id=eq.${id}&rights_confirmed=eq.true`);
    path=rows[0]?.path;
  }
  if(!path) return '';
  const signed=await signMedia(config,[path]);
  return signed[path] || '';
}
