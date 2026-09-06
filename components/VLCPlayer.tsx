import React from "react";

// Fallback para typecheck y compilaciones web; VLC solo está disponible en el
// development build nativo de Android TV.
export const VLCPlayer: React.ComponentType<any> = () => null;
