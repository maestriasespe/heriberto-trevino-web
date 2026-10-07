# Validación de la entrega v0.1.0

## Comprobaciones realizadas

**Sintaxis:** revisión con `node --check` de los archivos JavaScript del proyecto.

**Pruebas automatizadas:** 31 pruebas mediante `npm test`. Cubren escape de HTML y JSON, enlaces inseguros, dominios de video, filtros, cifras nulas frente a cero, rutas, configuración, rechazo de claves elevadas, requisitos editoriales, páginas y fichas demo, códigos 404/405/503, respuestas HEAD de páginas, directivas de robots y cabeceras. La comprobación de la migración incluida en esa suite es estática: detecta declaraciones de RLS y controles esperados, pero no ejecuta PostgreSQL.

**Revisión visual:** se renderizaron 11 vistas a 1440 px y 390 px. Se comprobó que no hubiera desplazamiento horizontal, además del menú móvil, cierre con Escape, comparador con control de rango y estado de búsqueda sin resultados. Se corrigió un desbordamiento en el comparador móvil.

El navegador de esta sesión restringe la navegación de red. Se obtuvo el HTML desde el servidor local y se renderizó su contenido y CSS en una página aislada. No se desactivaron esas restricciones. Esta revisión no es una prueba de conexión completa desde navegador a un alojamiento real.

**Panel editorial:** se probaron acceso, creación de ficha, fuente, guardado, publicación, retirada, ajustes y cierre de sesión con respuestas de API simuladas. No hubo errores JavaScript en ese recorrido. Estas pruebas no validan los servicios reales de autenticación, permisos o almacenamiento.

**Build:** generación de `dist/` y comprobación de que existe la entrada de función de Vercel. No se ejecutó el constructor de la nube con una cuenta del usuario.

## Pendiente, antes de producción

La migración SQL **no ha sido ejecutada contra Supabase**. Faltan las pruebas reales de grants, RLS, triggers, Storage y acceso anónimo frente a acceso editorial. También falta probar contraseña, renovación de sesión, cargas y firma de archivos, cambio del retrato, reproducción de un video autorizado y persistencia tras reiniciar.

La configuración de Vercel no ha sido desplegada con tus credenciales. Faltan la comprobación de las rutas reescritas, variables, región, plan, límites, HTTPS, dominio y comportamiento desde una ventana sin sesión.

No se realizó prueba de penetración, auditoría de accesibilidad completa, revisión jurídica de contenido o permisos, ni prueba de carga. No se ofrece una garantía de seguridad o disponibilidad total.

Las capturas son del prototipo con espacios de material pendiente. No representan fotografías de Heriberto ni de obras reales. Los expedientes usados en la prueba del formulario no forman parte de los datos de producción.
