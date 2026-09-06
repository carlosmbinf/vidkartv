# VIDKAR Android TV

Este proyecto es el cliente independiente de VIDKAR para Android TV, construido con Expo SDK 54, React Native, Expo Router y `@meteorrn/core`.

## Reglas del proyecto

- Mantén la navegación bajo `app/` y la lógica reutilizable bajo `components/` o `services/`.
- Conserva los contratos Meteor existentes: login, publicación `user`, publicación `pelis`, `subscipcionPelis` y métodos compartidos.
- El acceso al catálogo exige `user.subscipcionPelis === true`; la UI nunca sustituye la autorización del backend/HLS.
- Diseña primero para pantalla 16:9 y control D-pad: foco visible, targets grandes, navegación predecible y sin depender de gestos táctiles.
- Antes de tocar dimensiones visuales, revisa la pantalla en el emulador Android TV si está disponible.
- Evita copiar componentes visuales de web o mobile cuando no respeten distancia de lectura y foco TV.
- No introduzcas secretos, tokens ni URLs privadas en código, logs, memoria o documentación.
- Después de cambios TypeScript/React Native ejecuta `npm run lint` y `npm run typecheck`; para cambios de plataforma ejecuta también `npm run build`.

## Contexto adicional

Lee `instructions/tv.instructions.md`, `memory/architecture.md` y `memory/visual-guidelines.md` cuando la tarea toque navegación, catálogo, reproducción o UI.
