# Arquitectura de VIDKAR TV

- Entrada: `app/index.tsx`; conecta con Meteor y decide login, suscripción o catálogo.
- Autenticación: `app/(auth)/login.tsx` mediante `Meteor.loginWithPassword`.
- Shell autenticado: `app/(app)/_layout.tsx` con `home`, `subscription` y `player`.
- Catálogo: `components/MovieCatalog.tsx`; publica `pelis` y consulta el usuario mediante `services/meteor/session.ts`.
- Cards: `components/MovieCard.tsx`; se consumen en listas horizontales con navegación D-pad.
- Reproducción: `components/MoviePlayer.tsx` y `services/`; respeta los contratos HLS compartidos.
- Sesión: `services/meteor/client.ts` encapsula `@meteorrn/core`, SecureStore y configuración de entorno.

## Estado de acceso

1. Meteor conectado sin usuario: `/(auth)/login`.
2. Usuario autenticado con `subscipcionPelis === true`: `/(app)/home`.
3. Usuario autenticado sin suscripción: `/(app)/subscription`.

La pantalla TV de suscripción informa el estado y no inventa un flujo de pago distinto al backend existente.
