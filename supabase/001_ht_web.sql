-- HT WEB · v0.1.0 · Proyecto NUEVO y separado de Electron.
-- Ejecutar una sola vez con el SQL Editor de Supabase.
-- No contiene obras, testimonios ni cifras ficticias para producción.
begin;
create schema if not exists ht_private;
revoke all on schema ht_private from public;
grant usage on schema ht_private to anon, authenticated;

create table public.ht_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.ht_admins enable row level security;
revoke all on public.ht_admins from anon, authenticated;
grant select on public.ht_admins to authenticated;
create policy ht_admin_self_read on public.ht_admins for select to authenticated using (user_id=(select auth.uid()));
create function ht_private.is_admin() returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.ht_admins a where a.user_id=(select auth.uid()));
$$;
revoke all on function ht_private.is_admin() from public;
grant execute on function ht_private.is_admin() to anon, authenticated;

create table public.ht_content (
  id uuid primary key default gen_random_uuid(),
  kind text not null check(kind in ('obra','programa','evolucion','testimonio','legislativo')),
  slug text not null check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug)<=120),
  title text not null check(length(btrim(title)) between 1 and 240),
  topic text not null default '' check(length(topic)<=120),
  year_start integer check(year_start between 1800 and 2100),
  year_end integer check(year_end between 1800 and 2100),
  role text not null default '' check(length(role)<=240),
  location text not null default '' check(length(location)<=300),
  summary text not null default '' check(length(summary)<=1500),
  body text not null default '' check(length(body)<=200000),
  participation text not null default '',
  partners text not null default '',
  investment_amount numeric(18,2) check(investment_amount>=0),
  investment_scope text not null default '',
  investment_method text not null default '',
  beneficiaries bigint check(beneficiaries between 0 and 9007199254740991),
  beneficiary_unit text not null default 'personas',
  beneficiary_method text not null default '',
  sources jsonb not null default '[]'::jsonb check(jsonb_typeof(sources)='array' and jsonb_array_length(sources)<=30),
  details jsonb not null default '{}'::jsonb check(jsonb_typeof(details)='object'),
  status text not null default 'draft' check(status in ('draft','review','published','archived')),
  verification text not null default 'pending' check(verification in ('pending','verified')),
  featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ht_content_years check(year_end is null or (year_start is not null and year_end>=year_start)),
  unique(kind,slug)
);
create index ht_content_catalog on public.ht_content(kind,status,year_start desc);

create table public.ht_media (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.ht_content(id) on delete cascade,
  path text not null unique,
  purpose text not null check(purpose in ('cover','gallery','before','after')),
  alt text not null default '' check(length(alt)<=500),
  credit text not null default '' check(length(credit)<=500),
  taken_on date,
  source_url text not null default '' check(source_url='' or source_url ~ '^https?://[^[:space:]]+$'),
  rights_confirmed boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint ht_media_object_path check(path ~ ('^content/'||content_id::text||'/[0-9a-f-]+\.(jpg|jpeg|png|webp|avif)$'))
);
create index ht_media_content_idx on public.ht_media(content_id);
create unique index ht_media_unique_cover on public.ht_media(content_id,purpose) where purpose in ('cover','before','after');

-- Solo referencias internas al permiso. No se exponen documentos o firmas personales.
create table public.ht_consents (
  content_id uuid primary key references public.ht_content(id) on delete cascade,
  confirmed boolean not null default false,
  evidence_reference text not null default '',
  signed_on date,
  revoked_at timestamptz,
  notes text not null default '',
  updated_at timestamptz not null default now(),
  check(not confirmed or (length(btrim(evidence_reference))>0 and signed_on is not null))
);

create table public.ht_site_settings (
  id integer primary key default 1 check(id=1),
  name text not null default 'Heriberto Treviño',
  portrait_path text check(portrait_path is null or portrait_path ~ '^settings/[0-9a-f-]+\.(jpg|jpeg|png|webp|avif)$'),
  portrait_alt text not null default 'Retrato profesional de Heriberto Treviño',
  portrait_credit text not null default '',
  portrait_rights_confirmed boolean not null default false,
  contact_email text not null default '' check(contact_email='' or contact_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  privacy_notice text not null default '',
  updated_at timestamptz not null default now(),
  check(not portrait_rights_confirmed or (portrait_path is not null and length(btrim(portrait_alt))>0 and length(btrim(portrait_credit))>0))
);
insert into public.ht_site_settings(id) values(1);

create function ht_private.consent_valid(p_id uuid) returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.ht_consents c where c.content_id=p_id and c.confirmed and c.revoked_at is null and c.signed_on is not null and length(btrim(c.evidence_reference))>0);
$$;
create function ht_private.content_visible(p_id uuid) returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.ht_content c where c.id=p_id and c.status='published' and c.verification='verified' and (c.kind<>'testimonio' or ht_private.consent_valid(c.id)));
$$;
revoke all on function ht_private.consent_valid(uuid),ht_private.content_visible(uuid) from public;
grant execute on function ht_private.content_visible(uuid) to anon, authenticated;
-- No grant anon sobre consent_valid: solo la invoca el código de confianza en la base de datos.

alter table public.ht_content enable row level security;
alter table public.ht_media enable row level security;
alter table public.ht_consents enable row level security;
alter table public.ht_site_settings enable row level security;
revoke all on public.ht_content, public.ht_media, public.ht_consents, public.ht_site_settings from anon, authenticated;
grant select on public.ht_content, public.ht_media, public.ht_site_settings to anon, authenticated;
grant insert, update, delete on public.ht_content, public.ht_media to authenticated;
grant select, insert, update, delete on public.ht_consents to authenticated;
grant update on public.ht_site_settings to authenticated;
create policy ht_public_content on public.ht_content for select to anon,authenticated using(ht_private.content_visible(id));
create policy ht_admin_content on public.ht_content for all to authenticated using((select ht_private.is_admin())) with check((select ht_private.is_admin()));
create policy ht_public_media on public.ht_media for select to anon,authenticated using(rights_confirmed and length(btrim(alt))>0 and length(btrim(credit))>0 and ht_private.content_visible(content_id));
create policy ht_admin_media on public.ht_media for all to authenticated using((select ht_private.is_admin())) with check((select ht_private.is_admin()));
create policy ht_admin_consents on public.ht_consents for all to authenticated using((select ht_private.is_admin())) with check((select ht_private.is_admin()));
create policy ht_public_settings on public.ht_site_settings for select to anon,authenticated using(true);
create policy ht_admin_settings on public.ht_site_settings for update to authenticated using((select ht_private.is_admin())) with check((select ht_private.is_admin()));

-- La validación también se ejecuta en PostgreSQL: no basta con el formulario del navegador.
create function ht_private.validate_content() returns trigger language plpgsql security definer set search_path='' as $$
begin
  new.updated_at:=now();
  if new.status='published' then
    if new.verification<>'verified' or btrim(new.summary)='' or btrim(new.body)='' or new.year_start is null or btrim(new.role)='' or btrim(new.participation)='' then
      raise exception 'Completa año, cargo, descripción, participación y revisión editorial antes de publicar.';
    end if;
    if not exists(select 1 from jsonb_array_elements(new.sources) s where btrim(coalesce(s->>'title',''))<>'' and coalesce(s->>'url','') ~ '^https?://[^[:space:]]+$') then
      raise exception 'Se requiere al menos una fuente identificada y consultable.';
    end if;
    if new.investment_amount is not null and (btrim(new.investment_scope)='' or btrim(new.investment_method)='') then raise exception 'Documenta el alcance y la referencia de la inversión.'; end if;
    if new.beneficiaries is not null and btrim(new.beneficiary_method)='' then raise exception 'Documenta el dato de beneficiarios.'; end if;
    if exists(select 1 from public.ht_media m where m.content_id=new.id and (not m.rights_confirmed or btrim(m.alt)='' or btrim(m.credit)='')) then raise exception 'Las fotografías requieren autorización, descripción y crédito.'; end if;
    if new.kind='testimonio' then
      if not ht_private.consent_valid(new.id) then raise exception 'Se requiere autorización documental vigente para publicar el testimonio.'; end if;
      if coalesce(new.details->>'video_url','') !~ '^https://(www\.)?(youtube\.com/(watch\?v=|shorts/|embed/)|youtu\.be/)[A-Za-z0-9_-]{11}([?&].*)?$' then raise exception 'Se requiere un video de YouTube válido.'; end if;
    end if;
    if new.kind='evolucion' then
      if (select count(distinct purpose) from public.ht_media where content_id=new.id and purpose in ('before','after') and rights_confirmed and taken_on is not null and source_url<>'')<>2 or btrim(coalesce(new.details->>'comparison_notes',''))='' then
        raise exception 'El antes y después requiere ambas fotografías, fechas, fuentes y contexto.';
      end if;
    end if;
    if new.kind='legislativo' and btrim(coalesce(new.details->>'legislative_status',''))='' then raise exception 'Indica el estado del asunto legislativo.'; end if;
    if new.published_at is null then new.published_at:=now(); end if;
  end if;
  return new;
end;
$$;
revoke all on function ht_private.validate_content() from public;
create trigger ht_content_validation before insert or update on public.ht_content for each row execute function ht_private.validate_content();

-- Evita cambiar medios o consentimientos sin una nueva revisión del expediente.
create function ht_private.withdraw_on_change() returns trigger language plpgsql security definer set search_path='' as $$
declare affected uuid;
begin
  affected:=case when TG_OP='DELETE' then old.content_id else new.content_id end;
  update public.ht_content set status='draft', verification='pending' where id=affected and status='published';
  if TG_OP='UPDATE' and old.content_id<>new.content_id then
    update public.ht_content set status='draft', verification='pending' where id=old.content_id and status='published';
  end if;
  if TG_OP='DELETE' then return old; else return new; end if;
end;
$$;
revoke all on function ht_private.withdraw_on_change() from public;
create trigger ht_media_changed after insert or update or delete on public.ht_media for each row execute function ht_private.withdraw_on_change();
create trigger ht_consent_changed after insert or update or delete on public.ht_consents for each row execute function ht_private.withdraw_on_change();

create function ht_private.limit_media() returns trigger language plpgsql security definer set search_path='' as $$
begin
  perform 1 from public.ht_content where id=new.content_id for update;
  if (select count(*) from public.ht_media where content_id=new.content_id and id<>new.id)>=8 then raise exception 'Máximo de ocho imágenes por ficha en esta versión.'; end if;
  return new;
end;
$$;
revoke all on function ht_private.limit_media() from public;
create trigger ht_limit_media before insert or update of content_id on public.ht_media for each row execute function ht_private.limit_media();

-- Bucket privado: una URL conocida no basta para acceder a una foto de borrador.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('ht-media','ht-media',false,10485760,array['image/jpeg','image/png','image/webp','image/avif']);
create function ht_private.media_visible(p_path text) returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.ht_media m where m.path=p_path and m.rights_confirmed and length(btrim(m.alt))>0 and length(btrim(m.credit))>0 and ht_private.content_visible(m.content_id))
      or exists(select 1 from public.ht_site_settings s where s.id=1 and s.portrait_path=p_path and s.portrait_rights_confirmed and btrim(s.portrait_alt)<>'' and btrim(s.portrait_credit)<>'');
$$;
revoke all on function ht_private.media_visible(text) from public;
grant execute on function ht_private.media_visible(text) to anon, authenticated;
create policy ht_storage_read on storage.objects for select to anon,authenticated using(bucket_id='ht-media' and ((select ht_private.is_admin()) or ht_private.media_visible(name)));
create policy ht_storage_insert on storage.objects for insert to authenticated with check(bucket_id='ht-media' and (select ht_private.is_admin()) and name ~ '^(content/[0-9a-f-]+|settings)/[0-9a-f-]+\.(jpg|jpeg|png|webp|avif)$');
-- Archivos inmutables: para reemplazar una imagen se sube un objeto con nombre nuevo.
create policy ht_storage_delete on storage.objects for delete to authenticated using(bucket_id='ht-media' and (select ht_private.is_admin()));

comment on table public.ht_content is 'Archivo documental público. RLS expone únicamente fichas revisadas y publicadas.';
comment on table public.ht_consents is 'Información editorial privada. Nunca se entrega al visitante.';
commit;
