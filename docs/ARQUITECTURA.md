# Arquitectura y alcance de la primera versión

## Flujo público

El navegador solicita una página a `api/index.mjs` en Vercel (o al servidor de `scripts/dev.mjs` en local). `src/site.mjs` resuelve la ruta, `src/data.mjs` consulta las filas publicadas mediante la clave de bajo privilegio y `src/views.mjs` genera HTML escapado. El visitante no necesita JavaScript para leer fichas o utilizar los filtros del catálogo. JavaScript añade menú móvil, comparador y carga voluntaria del reproductor.

La aplicación usa renderizado de servidor, no un único archivo vacío que depende de JavaScript para mostrar texto. No necesita React, Next.js, un CDN de librerías, fuentes web externas ni una clave secreta de servidor. Los elementos gráficos de estructura son CSS y SVG locales; no son fotografías de obras.

## Separación de demostración y producción

`CONTENT_MODE=demo` carga únicamente las estructuras declaradas en `src/demo.mjs`. No consulta ni siembra esas estructuras en Supabase. `CONTENT_MODE=live` requiere URL y clave válidas: si la consulta falla, responde un error temporal y nunca vuelve automáticamente a la demostración.

El sitio real muestra únicamente datos revisados y publicados, sujeto a las políticas de la base. Tener `ALLOW_INDEXING=false` no equivale a acceso privado; únicamente configura metadatos y directivas para buscadores.

## Tablas

- `ht_content`: texto público, periodo, cifras, fuentes, detalles por tipo y estado editorial.
- `ht_media`: referencia del objeto de Storage, uso de la imagen, descripción, crédito, fecha y derechos.
- `ht_consents`: referencia privada del permiso para testimonios, fecha y posible revocación.
- `ht_admins`: usuarios autorizados. Solo el propietario de la base puede añadir o retirar registros por SQL; la aplicación no permite autoasignarse el rol.
- `ht_site_settings`: retrato, crédito, autorización, correo público y aviso de privacidad.

Las funciones auxiliares están en `ht_private`, fuera del esquema de la API pública. Fijan su ruta de búsqueda y sus permisos de ejecución de manera explícita. Las políticas RLS se incluyen para todas las tablas públicas del proyecto.

## Estados y autorizaciones

Estados posibles: `draft`, `review`, `published`, `archived`. En el panel v0.1 se trabaja principalmente con borrador y publicación; los otros estados quedan disponibles para una ampliación del flujo. La revisión utiliza `pending` o `verified`.

La base ejecuta un trigger antes de publicar. Exige contenido mínimo, periodo, cargo, participación, fuente y verificación. Las cifras requieren referencia o método. Testimonios requieren permiso y video; comparaciones requieren ambas imágenes y contexto; asuntos legislativos requieren estado.

Modificar o retirar un medio o consentimiento vinculado a un expediente publicado lo devuelve a borrador para revisión. La revocación de la autorización se evalúa también en la política que permite la lectura pública del testimonio.

## Fotografías

El navegador editorial valida y convierte las imágenes a una copia WebP optimizada, con eliminación de metadatos. Conserva el original fuera de la aplicación. No se suben videos pesados ni documentos de consentimiento a `ht-media`.

El servidor público utiliza `/media/{id}` o `/media/portrait` para comprobar la referencia y solicitar un enlace firmado de dos minutos. Las imágenes se obtienen directamente de Supabase, no se retransmiten sus bytes por Vercel. Así, una imagen con carga diferida no recibe un enlace que ya venció antes de entrar en pantalla.

Las respuestas HTML y redirecciones de medios no se guardan en una caché compartida. Una URL temporal ya emitida puede seguir funcionando hasta vencer; despublicar no elimina copias externas. El panel utiliza enlaces de previsualización de hasta una hora, disponibles únicamente después de autenticar al editor.

## Autenticación

El panel usa los endpoints REST de Supabase Auth para entrar con correo/contraseña y renovar la sesión. El JWT de sesión se transmite en `Authorization`; la clave publishable va en `apikey`. La sesión se conserva en `sessionStorage`, no en un archivo del servidor ni en el repositorio. La autorización se comprueba contra Supabase y `ht_admins`; no basta con modificar la interfaz.

No se implementaron flujos de invitación, autorregistro, recuperación de contraseña ni autenticación multifactor. Gestiona las cuentas desde Supabase en esta versión. Antes de ampliar el equipo, conviene implementar segundo factor, revocación y cierre de sesiones, roles diferenciados y bitácora inmutable.

## Rutas y archivos

```text
api/index.mjs                 Entrada de la función de Vercel
src/site.mjs                  Resolución de rutas y cabeceras
src/views.mjs                 Páginas y componentes HTML
src/data.mjs                  Lectura de Supabase y firma de medios
src/config.mjs                Secciones y validación de configuración
src/demo.mjs                  Ejemplos identificados, nunca sembrados en producción
public/assets/site.css        Diseño público adaptable
public/assets/admin.css       Diseño del panel
public/assets/site.js         Menú, comparador y reproducción voluntaria
public/assets/admin.js        Editor, autenticación y cargas
public/assets/utils.mjs       Escape, enlaces, búsqueda y validaciones compartidas
supabase/                     Migración, alta de editor y comprobación estructural
scripts/                      Servidor, revisión de sintaxis y build
```

## Límites y pendientes conocidos

El catálogo de esta etapa carga hasta 5,000 fichas y ocho imágenes por ficha. No es una promesa de rendimiento para ese volumen o para tráfico masivo: hay que medir en el servicio real. Para crecer, realizar búsqueda/paginación por consulta y definir una caché compatible con la retirada de contenido.

El panel no tiene guardado automático, edición simultánea con bloqueo, historial de versiones ni aprobación por dos usuarios. El texto se guarda como texto plano con párrafos, no como HTML arbitrario. Las correcciones del texto requieren revisión para volver a publicar.

No incluye mapas, métricas de publicidad, afiliación, comentarios, captación de testimonios públicos, importaciones masivas, registro de electores, mensajería, donativos o integración con Electron. Los videos admitidos son enlaces de YouTube. No hay almacenamiento directo de video ni soporte para todas las plataformas.

No se ha incorporado una fotografía profesional real ni se ha investigado y cargado todavía el archivo histórico completo. Esta entrega construye la plataforma, no certifica obras, periodos o atribuciones.
