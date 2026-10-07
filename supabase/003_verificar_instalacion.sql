-- Solo lectura. Comprobación estructural; no sustituye las pruebas de acceso reales.
select tablename, rowsecurity
from pg_tables where schemaname='public' and tablename in
('ht_admins','ht_content','ht_media','ht_consents','ht_site_settings') order by tablename;

select schemaname,tablename,policyname,roles,cmd
from pg_policies
where (schemaname='public' and tablename like 'ht_%')
   or (schemaname='storage' and policyname like 'ht_%')
order by schemaname,tablename,policyname;

select id,public,file_size_limit,allowed_mime_types
from storage.buckets where id='ht-media';
-- public debe ser FALSE. El bucket no contiene documentos de consentimiento.

select
 (select count(*) from public.ht_admins) as editores_autorizados,
 (select count(*) from public.ht_site_settings where id=1) as configuraciones,
 (select count(*) from public.ht_content) as fichas_totales,
 (select count(*) from public.ht_content where status='published') as fichas_publicadas;

-- Desde una sesión anónima real, comprobar después:
--   ht_content: solo fichas publicadas y revisadas.
--   ht_consents: sin acceso.
--   ht_admins: sin acceso.
--   INSERT/UPDATE/DELETE públicos: denegados.
--   Storage: sin acceso a medios de borradores o no autorizados.
