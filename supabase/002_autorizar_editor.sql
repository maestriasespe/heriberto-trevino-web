-- Ejecutar DESPUÉS de 001_ht_web.sql y de crear el usuario en Authentication > Users.
-- Sustituye únicamente el correo. No incluyas ni pegues contraseñas en SQL.
do $$
declare editor_id uuid;
begin
  select id into editor_id from auth.users where lower(email)=lower('REEMPLAZAR_CON_TU_CORREO');
  if editor_id is null then raise exception 'No existe el usuario. Créalo en Authentication > Users y sustituye el correo en este archivo.'; end if;
  insert into public.ht_admins(user_id) values(editor_id) on conflict do nothing;
end $$;
-- Para retirar acceso editorial posteriormente (sustituye el correo):
-- delete from public.ht_admins where user_id in (select id from auth.users where email='correo@dominio.mx');
