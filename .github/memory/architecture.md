# Arquitectura de VIDKAR TV

- Entrada: `app/index.tsx`; conecta con Meteor y decide login o shell autenticado.
- Autenticación: `app/(auth)/login.tsx` mediante `Meteor.loginWithPassword`.
- Shell autenticado: `app/(app)/_layout.tsx` con `home`, `course`, `course-player`, `subscription` y `player`.
- Catálogo: `components/MovieCatalog.tsx`; muestra cursos para toda cuenta autenticada y solo publica `pelis`/`series` cuando `subscipcionPelis === true`.
- Cursos: `components/CourseCatalog.tsx`, `components/CourseDetail.tsx` y `components/CoursePlayer.tsx`; usan `cursos.catalogo.obtener`, `cursos.detalle.obtener`, `cursos.puedeAcceder` y `cursos.media.solicitarReproduccion`.
- Cards: `components/MovieCard.tsx`; se consumen en listas horizontales con navegación D-pad.
- Reproducción: `components/MoviePlayer.tsx` y `services/`; respeta los contratos HLS compartidos.
- Sesión: `services/meteor/client.ts` encapsula `@meteorrn/core`, SecureStore y configuración de entorno.

## Estado de acceso

1. Meteor conectado sin usuario: `/(auth)/login`.
2. Usuario autenticado: `/(app)/home`, con Cursos como superficie común.
3. `subscipcionPelis === true`: habilita además las pestañas y reproducción de Películas y Series.

La ruta histórica `/(app)/subscription` se conserva como redirección de compatibilidad y no expone una superficie audiovisual a cuentas sin suscripción.
