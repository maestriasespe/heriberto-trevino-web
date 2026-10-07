# Heriberto Treviño · Sitio documental

**Versión 0.1.0 · Entrega inicial · 7 de octubre de 2026**

Proyecto independiente de Electron. Incluye sitio público, panel editorial, migración de base de datos y configuración para Vercel. **El código está creado; no se han creado recursos ni realizado un despliegue en tus cuentas.**

## 1. Verlo en tu computadora

Descomprime la carpeta `heriberto-trevino-web` en `C:\dev\`. Requiere Node.js 22 y npm. No tiene dependencias de ejecución de terceros.

En PowerShell:

```powershell
cd C:\dev\heriberto-trevino-web
Copy-Item .env.example .env
npm ci
npm run dev
```

Abre en tu navegador:

```text
http://localhost:3000
```

También puedes abrir `ARRANCAR_WINDOWS.cmd` dentro de la carpeta. Se crea `.env` desde el ejemplo solamente cuando aún no existe. No modifica Electron ni otra instalación.

La demostración funciona sin Supabase. Sus cinco fichas están identificadas como ejemplos: **no representan obras ni resultados reales**. Los espacios de fotografía están preparados para reemplazarlos desde el panel.

## 2. Secciones incluidas

| Sección | Ruta | Contenido preparado |
|---|---|---|
| Inicio | `/` | Portada, retrato profesional, navegación visible y acceso a las cinco áreas. |
| Obras | `/obras` | «Qué hicimos de la mano del ciudadano». Listado con fotografías desvanecidas, búsqueda y filtros. |
| Programas sociales | `/programas-sociales` | «Escuchando a la raza». Año, cargo, objetivos, funcionamiento y resultados. |
| Evolución de Juárez | `/evolucion-de-juarez` | Comparación de antes y después, fechas, fuentes y contexto. |
| Testimonios | `/testimonios` | «Visitando a la raza en la colonia». Video, transcripción y contexto. |
| Logros como legislador | `/logros-legislativos` | Iniciativas, gestiones, expedientes, autoría y estado de cada asunto. |
| Administración | `/admin` | Crear, documentar, subir imágenes, revisar, publicar y retirar fichas. |

Cada ficha tiene una dirección individual y admite una explicación extensa, periodo, ubicación, cargo, participación acreditada, otras instituciones, fuentes y fotografías. Obras y programas incorporan inversión, alcance y personas o unidades beneficiadas, con sus respectivas referencias.

Los videos se incorporan mediante enlaces de YouTube. También puedes añadir videos de recorridos a otros tipos de ficha. Los archivos de video no se alojan directamente en esta versión.

## 3. Crear un Supabase nuevo

**No ejecutes estos archivos en la base de Electron.** Utiliza un proyecto nuevo, por ejemplo `heriberto-trevino-web`, en tu cuenta.

1. Crea el proyecto en el panel de Supabase y conserva la contraseña de base de datos en tu gestor de contraseñas. Esa contraseña no se utiliza en este sitio.
2. Abre SQL Editor. Copia y ejecuta `supabase/001_ht_web.sql` **una sola vez**. La migración crea las tablas, controles de acceso y el bucket privado `ht-media`.
3. En Authentication → Users, crea manualmente tu usuario editorial con correo y contraseña. Confirma el correo en ese flujo. No uses la opción de invitar por enlace: esta versión inicia sesión por contraseña y no implementa callbacks de invitación.
4. En la configuración de autenticación, desactiva el registro público de usuarios. Configura la URL del sitio y comprueba que el proveedor de correo/contraseña esté habilitado.
5. Abre `supabase/002_autorizar_editor.sql`. Sustituye `REEMPLAZAR_CON_TU_CORREO` por el correo que acabas de crear y ejecútalo. No incluyas la contraseña en el SQL.
6. Ejecuta `supabase/003_verificar_instalacion.sql`. Es una comprobación de estructura y permisos, no una certificación de seguridad.
7. Copia la URL del proyecto y la clave **publishable**, y completa `.env`.

```dotenv
CONTENT_MODE=live
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_REEMPLAZAR
SITE_URL=http://localhost:3000
ALLOW_INDEXING=false
PORT=3000
```

Detén el servidor con Ctrl+C y vuelve a ejecutar `npm run dev`. Accede a `/admin` e inicia sesión con la cuenta autorizada. Si necesitas recuperar o restablecer la contraseña en esta primera versión, adminístrala desde Supabase; no se incluye un flujo público de recuperación.

**Nunca pegues contraseñas, `service_role`, claves `sb_secret_` o tokens de sesión en un chat, repositorio o captura.** La aplicación rechaza claves elevadas y solo utiliza publishable (o anon heredada). No necesita una clave secreta de servidor.

La API REST de Supabase se consulta directamente y sus políticas de acceso a filas (RLS) controlan qué puede consultar o modificar cada usuario. La clave publicable identifica la aplicación, no concede por sí sola acceso editorial. Referencias: [API y claves](https://supabase.com/docs/guides/getting-started/api-keys), [API REST](https://supabase.com/docs/guides/api/creating-routes), [autenticación](https://supabase.github.io/auth/).

## 4. Cargar contenido desde el panel

### Crear una ficha

Elige «Nueva ficha», selecciona la sección y completa título, ruta, descripción, periodo, cargo y participación. Añade las fuentes indicando qué dato respalda cada una. Guarda un borrador para empezar sin publicar.

Las cifras desconocidas deben dejarse vacías. El valor **0** se muestra como cero; no es equivalente a «No documentado». Un programa se atribuye a un año y cargo específicos. En actividad legislativa se distingue presentación de iniciativa, aprobación y publicación.

### Fotografías

Sube JPG, PNG, WebP o AVIF de hasta 10 MB y elige su uso: portada, galería, antes o después. Registra descripción accesible, crédito y autorización. Antes y después requieren también fecha y enlace de fuente. Máximo ocho imágenes por expediente: una portada, una anterior, una posterior y hasta completar el cupo con la galería.

La aplicación genera una copia WebP de hasta 2,600 píxeles en su lado mayor y elimina los metadatos del archivo original. **Conserva los originales y sus metadatos documentales en un archivo aparte.** No subas permisos firmados, identificaciones ni información privada al bucket de fotografías.

El bucket es privado. La consulta pública solo permite imágenes vinculadas a fichas publicadas y autorizadas, además del retrato autorizado. Los enlaces temporales tienen una vigencia de dos minutos. Retirar una publicación bloquea las nuevas consultas, pero no anula al instante enlaces ya emitidos ni copias que alguien haya conservado. Referencias: [buckets privados](https://supabase.com/docs/guides/storage/buckets/fundamentals), [enlaces firmados](https://supabase.com/docs/guides/storage/serving/downloads).

### Testimonios

Añade enlace de YouTube, nombre público autorizado, contexto y transcripción. Registra la fecha y referencia interna del permiso de publicación. Estas referencias se conservan en `ht_consents`, accesible únicamente a editores autorizados. Los documentos originales del permiso se conservan por separado en un expediente restringido.

El contenido editorial debe tener autorización que cubra a todas las personas identificables. La casilla del panel registra una revisión: no reemplaza la obtención del permiso ni su valoración jurídica. El reproductor externo solo se carga cuando el visitante pulsa reproducir.

### Publicar y retirar

«Guardar borrador» retira una ficha que ya estuviera publicada. «Revisar y publicar» guarda primero un borrador y verifica los campos requeridos; si falta información, permanece sin publicar. La validación se incluye tanto en el navegador como en la migración SQL.

Cambiar fotografías o autorizaciones de una ficha publicada la devuelve a borrador. Después hay que revisarla y publicarla de nuevo. «Retirar publicación» conserva el expediente dentro del panel.

Todos los editores autorizados tienen el mismo nivel de acceso en esta versión. La separación futura entre redacción, revisión y publicación está pendiente; no existe todavía una doble firma obligatoria. Tampoco existe un historial inmutable de versiones.

### Portada

En «Portada y privacidad» carga la fotografía profesional de Heriberto, registra crédito y permiso, y configura el correo público de contacto y el aviso de privacidad revisado. El retrato no viene incluido porque no se proporcionó una fotografía autorizada para este proyecto.

## 5. Publicar en Vercel sin complementos

La configuración está incluida en `vercel.json`: función Node.js, contenido estático en `dist` y rutas del sitio. Se utiliza Node.js 22, sin Next.js ni un paso de instalación de dependencias de interfaz. Referencias: [funciones Node.js](https://vercel.com/docs/functions/runtimes/node-js), [configuración](https://vercel.com/docs/project-configuration).

### Opción A: repositorio

Sube el proyecto a un repositorio **nuevo**, sin `.env`, y desde Vercel importa ese repositorio. No enlaces esta carpeta al proyecto de Electron.

| Ajuste | Valor |
|---|---|
| Framework Preset | Other |
| Root Directory | La carpeta que contiene `package.json` |
| Node.js | 22.x |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

En Environment Variables registra `CONTENT_MODE`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SITE_URL` y `ALLOW_INDEXING`. Copia los valores correspondientes a cada entorno. No necesitas configurar `PORT` en Vercel.

`SITE_URL` debe ser el origen HTTPS definitivo, sin rutas adicionales. Actualiza también la URL del sitio en la configuración de Supabase Auth. Después vuelve a desplegar para aplicar las variables nuevas.

### Opción B: terminal, sin repositorio conectado

Desde la carpeta del proyecto:

```powershell
npx vercel
```

Inicia sesión en tu cuenta y elige crear **un proyecto nuevo**, no enlazarlo con Electron. Después configura las variables del proyecto en Vercel y ejecuta:

```powershell
npx vercel --prod
```

Estos comandos los ejecutas tú en tu equipo: no se han ejecutado con tus credenciales desde esta conversación. Confirma el plan y los consumos antes de publicar. No se promete alojamiento gratuito: las condiciones de Hobby restringen su uso a proyectos personales no comerciales. [Condiciones de uso de Vercel](https://vercel.com/docs/limits/fair-use-guidelines).

## 6. Antes de anunciar la dirección

Completa `docs/CHECKLIST_PUBLICACION.md`. El modo real sin contenido autorizado muestra secciones vacías; no sustituye datos reales por ejemplos.

`ALLOW_INDEXING=false` genera directivas para buscadores, **pero no pone contraseña al sitio ni lo vuelve privado**. Para una revisión verdaderamente privada utiliza las opciones de protección de acceso del alojamiento que tengas contratadas.

Solo después de revisar contenido, permisos, aviso, funciones y respaldo, cambia `ALLOW_INDEXING=true` y vuelve a desplegar. No hay fechas electorales incrustadas ni autorización para difundir fuera del periodo aplicable; las piezas y el contexto deben revisarse de forma independiente.

## 7. Comprobar el proyecto

```powershell
npm run check
npm test
npm run build
```

La entrega incluye 31 pruebas automatizadas de funciones y respuestas del servidor. Se revisaron 11 vistas en anchos de escritorio y celular, y el formulario editorial con respuestas simuladas. **No se ha ejecutado la migración en una cuenta de Supabase ni probado el despliegue real de Vercel.** El informe distingue estas pruebas de una validación en producción.

Ver `docs/VALIDACION.md` y `docs/ARQUITECTURA.md` para el alcance, límites y pasos pendientes.

## 8. Primera sesión de trabajo sugerida

Primero ejecuta la demostración local. Después conecta el Supabase nuevo y publica una única ficha respaldada, con fotografía y fuente. Verifica esa ficha en una ventana sin sesión antes de cargar el resto del archivo.

Para abrir una conversación nueva sobre este proyecto, utiliza `00_CONTEXTO_PARA_NUEVO_PROYECTO.md` y adjunta el ZIP o la versión del repositorio que esté realmente instalada.
