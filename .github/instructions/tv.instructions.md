---
name: "VIDKAR Android TV"
description: "Reglas para modificar la app Expo Android TV de VIDKAR, su navegación, catálogo, reproducción VLC/HLS, foco D-pad y UI de pantalla grande."
applyTo: "**/*"
---

# Reglas de implementación TV

- Usa Expo Router para las rutas y deja las pantallas pequeñas en `app/`.
- Usa `TVFocusButton` y `Pressable` enfocables para acciones; cada pantalla debe tener foco inicial útil.
- Mantén estados visibles de carga, sesión ausente, suscripción inactiva, catálogo vacío y error.
- Para cards horizontales, conserva proporciones de póster, separación entre elementos y espacio para que el foco no tape la card vecina.
- Valida tamaños en dp lógicos del emulador, no solo en la captura física 4K.
- Mantén las transiciones cortas y no uses animaciones decorativas que dificulten el uso con D-pad.
- No cambies nombres de publicaciones, métodos, campos Meteor ni rutas HLS sin revisar web/mobile y backend.
