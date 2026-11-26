# SPEC 02 — Home (landing) de Arcade Vault

> **Status:** aprobado
> **Depends on:** SPEC 01 (reutiliza `GAMES`, `Link`, navbar, footer y `app/globals.css`)
> **Date:** 2026-11-26
> **Objective:** Implementar la Home en `/` portando `references/templates/home-about/home.jsx`, mover la Biblioteca a `/games` y añadir el enlace "Inicio" al navbar.

## Por qué existe esta spec

SPEC 01 dejó la Biblioteca en `/` y no incluyó landing. La plantilla `references/templates/home-about/` define una Home (hero, por qué, juegos, stats, actividad, precios, CTA final) que debe ser la puerta de entrada. Eso obliga a reubicar la Biblioteca y a tocar enlaces de SPEC 01. Los estilos de la Home solo existen en `references/templates/home-about/styles.css`, no en `app/globals.css`.

`AGENTS.md` sigue vigente: antes de escribir código se leen las guías de `node_modules/next/dist/docs/01-app/` (`cacheComponents`, `<Link>` con `partialPrefetching`).

## Alcance

**Dentro:**

- Home en `/` con 7 bloques de la plantilla: hero con siluetas flotantes, "¿POR QUÉ ARCADE VAULT?" (4 tarjetas), "JUEGOS DISPONIBLES AHORA" (6 mini-tarjetas), stats (3), "ACTIVIDAD EN VIVO" (ticker + top del día), "PRECIOS" (plan + 3 FAQ) y CTA final.
- Animación de aparición al hacer scroll (clase `.reveal` + `IntersectionObserver`).
- Mover la Biblioteca de `/` a `/games` (mismo componente `Library`).
- Navbar y menú móvil: nuevo enlace "Inicio" (activo solo en `/`); "Biblioteca" pasa a apuntar a `/games`.
- Actualizar enlaces de SPEC 01 que hoy apuntan a la Biblioteca en `/` (ver plan, paso 2).
- Portar a `app/globals.css` los estilos de la Home desde `references/templates/home-about/styles.css`.
- Datos mock estáticos en `lib/home-data.ts`; el preview de juegos usa `GAMES.slice(0, 6)`.
- Metadatos (`title`/`description` en español) para `/` y `/games`.

**Fuera de alcance (specs futuras):**

- Página "Acerca de" (`about.jsx`) y su enlace en el navbar.
- Leer `av_scores` o cualquier dato real para ticker, top o stats.
- Renombrar `/juegos/[id]` y `/juegos/[id]/jugar` a `/games/...` (se mantienen como en SPEC 01).
- Autenticación real, contador de créditos funcional, juegos reales, tests automatizados.
- Estilos de la plantilla que solo usa Acerca de (`highlight-row`, `contact-grid`, etc.).

## Rutas

| Pantalla | Ruta | Cambio |
| --- | --- | --- |
| Home | `/` | Nueva (antes Biblioteca) |
| Biblioteca | `/games` | Movida desde `/` |
| Detalle, Reproductor, Acceso, Salón | sin cambios | — |

Navegación de la Home (equivalencias con `navigate` de la plantilla):

| Elemento | Destino |
| --- | --- |
| "EXPLORAR JUEGOS", "VER TODOS LOS JUEGOS →", "INSERTAR MONEDA →" | `/games` |
| "CREAR CUENTA", "EMPEZAR GRATIS →" | `/acceso` |
| Mini-tarjeta de juego | `/juegos/[id]` |
| "VER SALÓN →" | `/salon` |

## Modelo de datos

Se reutiliza `Juego` y `GAMES` de `lib/data.ts` sin cambios. Se añade `lib/home-data.ts` con constantes tipadas, portadas tal cual de `home.jsx`:

```ts
export interface Destacado { icon: "GAMEPAD" | "FREE" | "TROPHY" | "ROCKET"; title: string; desc: string; color: Color }
export interface Estadistica { n: string; u: string; s: string }          // "12+", "JUEGOS", "Y CONTANDO"
export interface Actividad { player: string; game: string; score: number; when: string; color: Color }
export interface TopJugador { rank: number; player: string; score: number }
export interface PreguntaFrecuente { q: string; a: string }

export const DESTACADOS: Destacado[];        // 4
export const ESTADISTICAS: Estadistica[];    // 3
export const ACTIVIDAD: Actividad[];         // 7
export const TOP_HOY: TopJugador[];          // 5
export const FAQ: PreguntaFrecuente[];       // 3
export const PLAN_INCLUYE: string[];         // 6 ítems de la lista de precios
```

`Color` se importa de `lib/data.ts`. No hay persistencia nueva ni claves de `localStorage`.

Convenciones:

- Los datos son estáticos y deterministas (sin `Math.random()` ni `Date.now()`), para evitar desajustes de hidratación.
- Números con `toLocaleString("es-ES")`.
- El nombre de juego en `ACTIVIDAD` se copia literal de la plantilla (p. ej. "Caída", "Glotón"), aunque no coincida con `GAMES`.

## Plan de implementación

Cada paso deja la app compilando y ejecutable (`npm run dev`).

1. Leer en `node_modules/next/dist/docs/01-app/` las guías de `cacheComponents` y de `<Link>`/prefetch; anotar restricciones para Client Components con `IntersectionObserver`.
2. Mover la Biblioteca: crear `app/games/page.tsx` (con `<Library />` y metadatos `absolute: "Biblioteca · Arcade Vault"`); dejar en `app/page.tsx` un placeholder mínimo. Actualizar los enlaces "VOLVER AL VAULT" y equivalentes que apuntan a la Biblioteca: `app/juegos/[id]/page.tsx`, `components/game-player.tsx`, `components/hall-of-fame.tsx` y `app/not-found.tsx` → `/games`. La redirección tras login/invitado en `components/auth-form.tsx` se mantiene en `/`.
3. Navbar (`components/nav.tsx`): añadir "Inicio" (`/`, activo solo con `pathname === "/"`) antes de "Biblioteca" en escritorio y menú móvil; "Biblioteca" apunta a `/games` y está activa en `/games`, `/juegos/*`. El logo sigue yendo a `/`.
4. Crear `lib/home-data.ts` con tipos y constantes. Verificar con `npx tsc --noEmit`.
5. Portar a `app/globals.css` los estilos de la Home desde `references/templates/home-about/styles.css`: `home-*`, `silo`/`home-silos`, `hero-*`, `feature-*`, `mini-*`, `stats-*`/`stat-*`, `activity-*`/`ticker`/`tick-*`/`top-*`/`tp-*`, `pricing-*`/`price-card`/`pc-*`/`faq-*`, `home-final`/`final-*`, `reveal` y sus `@keyframes`/`@media`. Si un `@keyframes` o clase ya existe en `globals.css`, no duplicarlo: comparar y reutilizar. No portar los estilos exclusivos de Acerca de.
6. Crear componentes de la Home: `components/home/floating-silhouettes.tsx` (8 SVG decorativos, `aria-hidden`), `components/home/feature-icon.tsx` (4 íconos), `components/home/mini-card.tsx` (`<Link>` a `/juegos/[id]`) y `components/home/reveal.tsx` (Client Component que añade `.in` con `IntersectionObserver`, `threshold: 0.12`, y no oculta el contenido si el observer no está disponible).
7. Crear `components/home/home-page.tsx` con las 7 secciones y reemplazar el placeholder de `app/page.tsx` con `<HomePage />` y metadatos (`title: { absolute: "Arcade Vault · Arcade clásico en tu navegador" }`, `description` en español).
8. Revisar responsive en 375 px, 768 px y 1280 px contra `references/templates/home-about/arcade-vault-standalone.html` y confirmar que no hay errores de hidratación en consola.

## Criterios de aceptación

- [x] `npm run build` termina sin errores de TypeScript y `npm run lint` sin errores.
- [x] `/` y `/games` responden 200; `/` muestra la Home y `/games` muestra la Biblioteca con 8 tarjetas.
- [x] La Home contiene, en orden: hero, "¿POR QUÉ ARCADE VAULT?", "JUEGOS DISPONIBLES AHORA", stats, "ACTIVIDAD EN VIVO", "PRECIOS" y "¿LISTO PARA JUGAR?".
- [x] El hero muestra el título "EL ARCADE / CLÁSICO ESTÁ / DE VUELTA" y 8 siluetas decorativas con `aria-hidden="true"`.
- [x] La sección de características muestra 4 tarjetas y la de juegos muestra exactamente 6 mini-tarjetas (los 6 primeros de `GAMES`).
- [x] Clic en una mini-tarjeta navega a `/juegos/[id]` del juego correspondiente.
- [x] "EXPLORAR JUEGOS", "VER TODOS LOS JUEGOS →" e "INSERTAR MONEDA →" navegan a `/games`.
- [x] "CREAR CUENTA" y "EMPEZAR GRATIS →" navegan a `/acceso`; "VER SALÓN →" navega a `/salon`.
- [x] El ticker muestra 7 filas y el top del día 5 filas; las 3 primeras del top tienen clase `top1`/`top2`/`top3`.
- [x] La sección de precios muestra "$0 / SIEMPRE", 6 ítems de lista y 3 preguntas frecuentes.
- [x] Las secciones con `.reveal` pasan a visibles (`.in`) al entrar en el viewport.
- [x] Con `IntersectionObserver` ausente o JavaScript deshabilitado, el contenido de la Home sigue siendo visible.
- [x] El navbar muestra "Inicio" antes de "Biblioteca"; "Inicio" está activo solo en `/`; "Biblioteca" está activo en `/games`, `/juegos/bloque-buster` y `/juegos/bloque-buster/jugar`; "Salón de la Fama" en `/salon`.
- [x] El navbar no muestra el enlace "Acerca de".
- [x] "VOLVER AL VAULT" en Detalle, Reproductor y 404 navega a `/games`.
- [x] El inicio de sesión y "JUGAR COMO INVITADO" siguen redirigiendo a `/`.
- [x] `grep` en `app/globals.css` no encuentra `@keyframes` duplicados con el mismo nombre.
- [x] A 375 px la Home no tiene scroll horizontal, las grillas de características y mini-tarjetas se reorganizan y el menú hamburguesa funciona con el enlace "Inicio".
- [x] La consola del navegador no muestra errores de hidratación en `/` ni en `/games`.
- [x] Los criterios de SPEC 01 que citan la Biblioteca en `/` quedan sustituidos por `/games`, y las pantallas de SPEC 01 siguen respondiendo 200.

## Decisiones

- **Sí:** Home en `/` y Biblioteca en `/games`, como pidió el usuario y como en la plantilla (rutas `home`/`biblioteca`). La landing es la puerta de entrada.
- **No:** Home en `/inicio` con la Biblioteca en `/`. No toca nada existente, pero deja la landing como ruta secundaria.
- **Sí:** solo Home + enlace "Inicio". "Acerca de" va en su propia spec para no mezclar dos pantallas.
- **Sí:** portar los estilos a `app/globals.css`. Mismo criterio que SPEC 01: un solo CSS global, máxima fidelidad con el prototipo.
- **No:** `app/home.css` aparte. Rompe la convención de un único CSS global.
- **Sí:** datos mock estáticos en `lib/home-data.ts`. Suficiente para el MVP visual y evita lógica de lectura que SPEC 01 dejó fuera.
- **No:** alimentar ticker y top desde `av_scores`. Añade lectura de `localStorage` y riesgo de hidratación.
- **Sí:** mantener `/juegos/[id]` aunque la Biblioteca sea `/games`. Renombrarlo exige otra spec y rompe URLs ya cubiertas por SPEC 01. Queda una inconsistencia de idioma entre `/games` y `/juegos`; si molesta, se resuelve en una spec de renombrado.
- **Supuesto:** "VOLVER AL VAULT" (Detalle, Reproductor, 404) apunta a `/games`, porque su sentido es volver a la biblioteca. La redirección tras login/invitado se mantiene en `/`, que ahora es la Home.
- **Sí:** `Reveal` como Client Component pequeño, sin convertir toda la Home en cliente.
- **Sí (ajuste en la implementación):** corregir en `app/globals.css` dos desbordamientos a 375 px heredados de SPEC 01, el navbar (`@media (max-width: 480px)`) y la tabla del Salón, para cumplir el criterio de "sin scroll horizontal". Se aceptó la excepción porque sin ellos el criterio era inalcanzable.
- **Sí (ajuste en la implementación):** excluir `references/**` de ESLint y añadir `.playwright-mcp/` a `.gitignore`. Los prototipos de referencia no son código de la app y hacían fallar `npm run lint`.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| `.reveal` parte con `opacity: 0`; sin JS o sin `IntersectionObserver` la página queda en blanco | `Reveal` marca `.in` de inmediato si el observer no existe; se valida en los criterios de aceptación. |
| Enlaces a `/` olvidados tras mover la Biblioteca | El paso 2 enumera los archivos; se comprueba con `grep` de `href="/"` y `push("/")` en `app/` y `components/`. |
| Choque de clases o `@keyframes` (`pulse`, `blink`, `float`, `drift`, `bounce`) con los ya portados en SPEC 01 | El paso 5 compara antes de pegar y evita duplicados. |
| `cacheComponents: true` rechaza datos de runtime fuera de `Suspense` | La Home solo usa constantes; el único código de cliente es `Reveal`. Paso 1 lee la guía. |
| Los criterios de SPEC 01 sobre `/` dejan de ser ciertos | La spec los declara sustituidos por `/games` en el último criterio. |
| Hidratación por números formateados con `toLocaleString("es-ES")` | Datos estáticos y mismo locale en servidor y cliente; se revisa la consola en el paso 8. |

## Lo que **no** está en esta spec

- Página "Acerca de".
- Datos reales para ticker, top o stats.
- Renombrar `/juegos/*` a `/games/*`.
- Autenticación real, créditos funcionales, juegos jugables.
- Tests automatizados.

Cada punto, si llega, va en su propia spec.
