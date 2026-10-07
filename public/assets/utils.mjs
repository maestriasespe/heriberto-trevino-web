export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
export function jsonSafe(value) { return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029'); }
export function safeUrl(raw, {local = false} = {}) {
  if (typeof raw !== 'string' || !raw.trim()) return '';
  if (local && (raw.startsWith('/assets/') || /^\/media\/(?:portrait|[0-9a-f-]{36})$/.test(raw)) && !raw.includes('..') && !raw.includes('\\')) return raw;
  try { const u = new URL(raw); return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password ? u.href : ''; } catch { return ''; }
}
export function safeImageUrl(raw) {
  const value = safeUrl(raw, {local: true});
  return value.startsWith('/assets/') || value.startsWith('/media/') || value.startsWith('https://') ? value : '';
}
export function youtubeId(raw) {
  const url = safeUrl(raw);
  if (!url) return '';
  const u = new URL(url); let id = '';
  if (['youtu.be'].includes(u.hostname)) id = u.pathname.slice(1);
  if (['www.youtube.com','youtube.com','m.youtube.com','www.youtube-nocookie.com'].includes(u.hostname)) {
    id = u.searchParams.get('v') || u.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1] || '';
  }
  return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : '';
}
export function paragraphs(text) { return String(text || '').split(/\n\s*\n/).filter(Boolean).map(s => `<p>${esc(s).replace(/\n/g, '<br>')}</p>`).join(''); }
export function yearLabel(item) { return item.year_start ? `${item.year_start}${item.year_end && item.year_end !== item.year_start ? `–${item.year_end}` : ''}` : 'Año por documentar'; }
export function money(value) { return value === null || value === undefined || value === '' ? 'No documentado' : new Intl.NumberFormat('es-MX', {style:'currency', currency:'MXN', maximumFractionDigits: 2}).format(Number(value)); }
export function number(value) { return value === null || value === undefined || value === '' ? 'No documentado' : new Intl.NumberFormat('es-MX').format(Number(value)); }
export function dateLabel(value) {
  if (!value) return 'Fecha por documentar';
  const date = new Date(value.length === 10 ? `${value}T12:00:00Z` : value);
  return Number.isNaN(date.valueOf()) ? 'Fecha por documentar' : new Intl.DateTimeFormat('es-MX',{dateStyle:'long', timeZone:'America/Monterrey'}).format(date);
}
export function validSlug(value) { return typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 120; }
export function filterItems(items, {kind, q = '', year = '', topic = ''} = {}) {
  const normalize = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const needle = normalize(q.trim());
  return items.filter(i => (!kind || i.kind === kind) && (!year || (i.year_start && Number(year) >= i.year_start && Number(year) <= (i.year_end || i.year_start))) && (!topic || i.topic === topic) && (!needle || normalize([i.title,i.summary,i.location,i.topic,i.body].join(' ')).includes(needle)));
}
export function validatePublish(item, {media = [], consent = null} = {}) {
  const errors = [];
  if (!validSlug(item.slug)) errors.push('La ruta debe usar letras minúsculas, números y guiones.');
  if (!(item.title || '').trim()) errors.push('Falta el título.');
  if (!(item.summary || '').trim()) errors.push('Falta la descripción breve.');
  if (!(item.body || '').trim()) errors.push('Falta la explicación detallada.');
  if (!item.year_start) errors.push('Falta el año de inicio.');
  if (!(item.role || '').trim()) errors.push('Falta el cargo que ocupaba.');
  if (!(item.participation || '').trim()) errors.push('Falta la participación acreditada.');
  if (item.verification !== 'verified') errors.push('Registra la revisión editorial antes de publicar.');
  if (!Array.isArray(item.sources) || !item.sources.some(s => (s.title || '').trim() && safeUrl(s.url))) errors.push('Incluye al menos una fuente identificada y consultable.');
  if (media.some(m => !m.rights_confirmed || !(m.alt || '').trim() || !(m.credit || '').trim())) errors.push('Cada imagen necesita autorización, descripción y crédito.');
  if (item.kind === 'testimonio') {
    if (!youtubeId(item.details?.video_url)) errors.push('El testimonio requiere un video de YouTube válido.');
    if (!consent?.confirmed || !consent?.evidence_reference?.trim() || !consent?.signed_on || consent?.revoked_at) errors.push('Falta autorización documental vigente del testimonio.');
  }
  if (item.kind === 'evolucion') {
    if (!media.some(m => m.purpose === 'before' && m.taken_on && m.source_url) || !media.some(m => m.purpose === 'after' && m.taken_on && m.source_url)) errors.push('El antes y después requiere ambas imágenes con fechas y fuentes.');
    if (!(item.details?.comparison_notes || '').trim()) errors.push('Explica el alcance y los límites de la comparación.');
  }
  if (item.kind === 'legislativo' && !(item.details?.legislative_status || '').trim()) errors.push('Indica el estado del asunto legislativo.');
  if (item.investment_amount != null && (!(item.investment_scope || '').trim() || !(item.investment_method || '').trim())) errors.push('Documenta alcance y referencia de la inversión.');
  if (item.beneficiaries != null && !(item.beneficiary_method || '').trim()) errors.push('Documenta el cálculo o la fuente de personas beneficiadas.');
  return errors;
}
