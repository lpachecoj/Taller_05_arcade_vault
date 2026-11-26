# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado del proyecto

`arcade-vault` es un proyecto recién generado con `create-next-app` (App Router, TypeScript, Tailwind). Por ahora solo existe la plantilla por defecto: `app/page.tsx` y los metadatos de `app/layout.tsx` ("Create Next App") son placeholders. No hay tests, ni directorio `src/`, ni rutas adicionales, ni repositorio git.


## Next.js no es el que conoces

`AGENTS.md` exige leer la guía correspondiente en `node_modules/next/dist/docs/` antes de escribir código: esta versión (Next 16.4.x, React 19.3) tiene cambios incompatibles con lo que se conoce de versiones anteriores. Las guías están organizadas en `01-app/` (App Router, el que usa este proyecto) y `02-pages/` (no aplica).

## Skills

Usa siempre /frontend-desing para diseñar la interfax de usuario.

## Arquitectura y configuración no obvia

- **Router:** solo App Router en `app/`. Alias de imports: `@/*` → raíz del proyecto.
- **`next.config.ts`** habilita funciones nuevas/experimentales que cambian cómo se escribe el código:
  - `cacheComponents: true` — modelo de caché con Cache Components (ver `01-app/01-getting-started/08-caching.md`).
  - `partialPrefetching: true` — afecta el comportamiento de `<Link>` (ver `01-app/02-guides/adopting-partial-prefetching.md`).
  - `experimental.agentFeedback: true` — `next dev` administra un bloque dentro de `AGENTS.md`.
- **Tailwind v4 vía Turbopack:** no hay `postcss.config`; el CSS se procesa con la regla `turbopack.rules["*.css"]` que usa el loader `@tailwindcss/turbopack`. `app/globals.css` usa `@import "tailwindcss"` y define tokens (`--background`, `--foreground`, fuentes) con `@theme inline`; el modo oscuro es por `prefers-color-scheme`, no por clase.
- **Fuentes:** Geist y Geist Mono se cargan con `next/font/google` en `app/layout.tsx` y se exponen como variables CSS `--font-geist-sans` / `--font-geist-mono`.
- **Tipos globales de rutas:** `layout.tsx` usa el helper global `LayoutProps<"/">` (generado por Next en `.next/types`); no se importa.
