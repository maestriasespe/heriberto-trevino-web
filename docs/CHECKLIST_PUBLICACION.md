# Comprobaciones antes de publicar

## A. Separación y acceso

- [ ] Proyecto nuevo en Supabase y nuevo en Vercel; no utilizar recursos de Electron.
- [ ] Migración 001 ejecutada una sola vez; comprobación 003 revisada.
- [ ] Usuario creado, correo confirmado y alta editorial aplicada mediante 002.
- [ ] Registro público desactivado. Contraseña fuerte y credenciales conservadas de forma privada.
- [ ] `.env` fuera de Git; clave publishable correcta, sin claves secretas en cliente.
- [ ] Inicio, renovación y cierre de sesión probados contra Supabase real.

## B. Pruebas reales de permisos

- [ ] Una ventana sin sesión no puede guardar, modificar o borrar fichas.
- [ ] Un usuario autenticado que no figura en `ht_admins` tampoco puede hacerlo.
- [ ] La cuenta editorial no puede darse nuevos privilegios mediante la API.
- [ ] El visitante anónimo no puede leer `ht_consents` ni `ht_admins`.
- [ ] Un borrador no se entrega en `/rest/v1/ht_content` ni en su ficha pública.
- [ ] Un archivo de borrador no puede descargarse ni firmarse como visitante anónimo.
- [ ] Una ficha revisada y publicada sí puede consultarse sin iniciar sesión.
- [ ] Cambiar una fotografía o revocar el permiso retira el expediente para nueva revisión.
- [ ] Publicar un testimonio sin autorización, una comparación sin par de fotos o una cifra sin respaldo se rechaza en la API, no solamente en la interfaz.

## C. Contenidos

- [ ] Retrato profesional auténtico, con crédito y autorización.
- [ ] Primera ficha respaldada, cargo y periodo comprobados, participación correctamente atribuida.
- [ ] Fuente para cada cifra y claridad sobre inversión municipal, estatal, federal u otras aportaciones.
- [ ] Comparaciones del mismo espacio, fechas verificadas y reconocimiento de otros participantes.
- [ ] Videos reales, no ficticios; permisos y transcripción revisados.
- [ ] Iniciativas presentadas diferenciadas de reformas aprobadas y publicadas.
- [ ] Documentos privados fuera del texto y las imágenes públicos.
- [ ] Aviso de privacidad y correo de contacto completados.
- [ ] Revisión jurídica-editorial de la difusión y de su contexto antes de anunciar el sitio.

## D. Alojamiento y operación

- [ ] Variables correctas por entorno y `CONTENT_MODE=live` para el sitio real.
- [ ] Vercel: Other, Node.js 22.x, build `npm run build`, salida `dist`.
- [ ] Inicio, todas las secciones, una ficha, `/admin` y `/media/portrait` probados en el dominio real.
- [ ] Búsqueda y filtros conservan sus parámetros tras las reglas de rutas.
- [ ] Carga de imágenes y reproducción voluntaria de un video probadas en celular.
- [ ] Secciones vacías y errores de conexión se muestran sin recurrir a datos demo.
- [ ] No hay costos o planes asumidos como gratuitos sin revisar sus condiciones.
- [ ] Copias de respaldo, límites de consumo y responsables de incidencias definidos.
- [ ] `ALLOW_INDEXING` se activa únicamente después de revisar el lanzamiento; no confundirlo con protección de acceso.

Conserva capturas de estas comprobaciones sin contraseñas, tokens o claves. Registra fecha, responsable, resultado y cualquier incidencia.
