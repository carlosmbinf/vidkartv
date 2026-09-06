import React from "react";

// El paquete publica el componente mediante CommonJS y no ofrece una exportación
// ESM fiable para Metro; el acceso queda aislado en esta variante nativa.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { VLCPlayer: NativeVLCPlayer } = require("react-native-vlc-media-player");

export const VLCPlayer = NativeVLCPlayer as React.ComponentType<any>;
