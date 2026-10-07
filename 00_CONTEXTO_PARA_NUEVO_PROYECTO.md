# Contexto de continuidad · Web de Heriberto Treviño

Crear y desarrollar progresivamente un sitio documental sobre la trayectoria pública de Heriberto Treviño. Es un proyecto distinto de Electron: no usar su repositorio, base de datos, credenciales, usuarios ni módulos.

## Secciones acordadas

Inicio con retrato profesional y navegación visible. Obras: «Qué hicimos de la mano del ciudadano». Programas sociales: «Escuchando a la raza». Evolución de Juárez: «La evolución de nuestro querido municipio», con «Juárez en el corazón de Nuevo León». Testimonios: «Visitando a la raza en la colonia». Logros como legislador.

Cada obra debe permitir explicación extensa, fotografías, año, cargo, ubicación, participación acreditada, instituciones participantes, inversión y beneficiarios con su método y fuente. Las comparaciones deben corresponder al mismo espacio y tener fecha, crédito y respaldo para ambas imágenes. Los videos de recorridos también pueden incorporarse a las fichas. No fabricar cifras, imágenes históricas, testimonios ni autorías.

## Entrega v0.1.0

Carpeta `heriberto-trevino-web`. Node.js 22, JavaScript ES modules, HTML renderizado en el servidor y CSS propio. No utiliza Next.js ni React. Configuración para Vercel Functions y Supabase REST/Auth/Storage.

Tablas: `ht_admins`, `ht_content`, `ht_media`, `ht_consents`, `ht_site_settings`. Bucket privado: `ht-media`. Migración inicial: `supabase/001_ht_web.sql`. Alta editorial: `002_autorizar_editor.sql`. Comprobación estructural: `003_verificar_instalacion.sql`.

El sitio permite navegar, filtrar por texto/año/tema, consultar fichas y comparar fotografías. El panel permite crear, guardar borradores, añadir fuentes, cargar imágenes, documentar permisos, publicar o retirar contenido y cambiar retrato y aviso de privacidad.

Variables: `CONTENT_MODE`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SITE_URL`, `ALLOW_INDEXING`, `PORT` (solo local). Modo demo separado de modo live. Solo usar clave publishable o anon, nunca claves de privilegios elevados. No pedir claves secretas por chat.

## Estado real

Código creado y comprobado localmente. No se crearon recursos en cuentas del usuario. Supabase y Vercel no están conectados mediante complementos y el usuario decidió no instalarlos para esta solicitud. No volver a sugerirlos. El despliegue se realiza mediante sus paneles o terminal local.

Las fichas demo son estructuras, no logros reales. No se incorporaron fotografía profesional ni archivos documentales reales. El corpus histórico completo debe investigarse y validarse por etapas; no asumir que ya está cargado ni que todos los datos de conversaciones anteriores están corroborados.

Se ejecutaron 31 pruebas de código y servidor. Se revisaron vistas en 1440 px y 390 px, menú y comparador. El panel se comprobó con respuestas simuladas. La migración PostgreSQL, autenticación, almacenamiento y políticas reales siguen pendientes de probar en el nuevo Supabase. Ver `docs/VALIDACION.md`.

## Próximo paso

Confirmar que la demostración abre en `http://localhost:3000`, crear un Supabase independiente y verificar la conexión. Después incorporar el retrato autorizado y una primera obra respaldada, sin cargar de golpe toda la historia.

Al continuar, comprobar los archivos y la versión realmente instalados antes de enviar reemplazos. No repetir la migración inicial ni modificar Electron. Los cambios deben venir acompañados de instrucciones precisas y de pruebas, distinguiendo lo ejecutado de lo pendiente.
