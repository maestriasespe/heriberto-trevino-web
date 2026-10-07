export const sections = [
  { kind: 'obra', path: 'obras', nav: 'Obras', label: 'Obras', title: 'Qué hicimos de la mano del ciudadano', intro: 'Un archivo de obras para consultar su historia, alcance, inversión y participación documentada.', icon: 'building', number: '01' },
  { kind: 'programa', path: 'programas-sociales', nav: 'Programas sociales', label: 'Programas sociales', title: 'Escuchando a la raza', intro: 'Programas organizados por año, cargo, objetivos y resultados documentados.', icon: 'hands', number: '02' },
  { kind: 'evolucion', path: 'evolucion-de-juarez', nav: 'Evolución de Juárez', label: 'Evolución de Juárez', title: 'La evolución de nuestro querido municipio', intro: 'Juárez en el corazón de Nuevo León. Fotografías y documentos para recorrer los cambios de sus espacios.', icon: 'landscape', number: '03' },
  { kind: 'testimonio', path: 'testimonios', nav: 'Testimonios', label: 'Testimonios', title: 'Visitando a la raza en la colonia', intro: 'Un espacio para relatos en primera persona, videos de recorridos y experiencias documentadas.', icon: 'play', number: '04' },
  { kind: 'legislativo', path: 'logros-legislativos', nav: 'Logros legislativos', label: 'Logros como legislador', title: 'Actividad y resultados legislativos', intro: 'Iniciativas, gestiones y resoluciones, con fechas, participación acreditada y estado de cada asunto.', icon: 'document', number: '05' }
];
export const byKind = Object.fromEntries(sections.map(s => [s.kind, s]));
export const byPath = Object.fromEntries(sections.map(s => [s.path, s]));

export function readConfig(env = process.env) {
  const mode = env.CONTENT_MODE || 'demo';
  if (!['demo', 'live'].includes(mode)) throw new Error('CONTENT_MODE debe ser demo o live.');
  const supabaseUrl = (env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
  const key = (env.SUPABASE_PUBLISHABLE_KEY || '').trim();
  if (key.startsWith('sb_secret_')) throw new Error('No se admite una clave secreta. Usa publishable o anon.');
  if (key.startsWith('eyJ')) {
    try {
      const payload = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString());
      if (payload.role !== 'anon') throw new Error('La clave JWT debe tener rol anon, nunca service_role.');
    } catch (err) { throw new Error(`Clave no admitida: ${err.message}`); }
  } else if (key && !key.startsWith('sb_publishable_')) {
    throw new Error('Formato de clave no reconocido; usa la clave publishable o anon de Supabase.');
  }
  if (supabaseUrl) {
    const u = new URL(supabaseUrl);
    if (u.protocol !== 'https:' || u.username || u.password || u.pathname !== '/') throw new Error('SUPABASE_URL debe ser una URL HTTPS de proyecto, sin ruta ni credenciales.');
  }
  if (mode === 'live' && (!supabaseUrl || !key)) throw new Error('Modo live sin configuración de Supabase.');
  const siteUrl = (env.SITE_URL || '').trim().replace(/\/+$/, '');
  if (siteUrl) {
    const u=new URL(siteUrl);
    if(!['http:','https:'].includes(u.protocol) || u.username || u.password || u.pathname!=='/' || u.search || u.hash) throw new Error('SITE_URL debe ser el origen del sitio, sin rutas, credenciales ni parámetros.');
  }
  const index = mode === 'live' && env.ALLOW_INDEXING === 'true' && /^https:\/\//.test(siteUrl);
  return { mode, supabaseUrl, key, siteUrl, index, configured: Boolean(supabaseUrl && key) };
}
