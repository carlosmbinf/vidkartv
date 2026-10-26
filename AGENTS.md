# Codex: vidkartv

Lee `../AGENTS.md` y las instrucciones locales de `./.github/`: `copilot-instructions.md`, `instructions/tv.instructions.md`, `memory/architecture.md` y `memory/visual-guidelines.md`.

Este es un proyecto Android TV separado de `react-native-VIDKAR-TV/`. No asumas que ambas carpetas son copias equivalentes: confirma el proyecto objetivo y sus manifiestos. Conserva navegación D-pad, foco visible y contratos Meteor/HLS; no cambies contratos compartidos sin revisar backend y clientes.

Valida con `npm run lint` y `npm run typecheck`; ejecuta `npm run build` si el cambio afecta la plataforma Android.
