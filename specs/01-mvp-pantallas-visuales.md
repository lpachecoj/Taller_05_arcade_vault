# SPEC 01 — MVP visual de Arcade Vault (5 pantallas)

> **Status:** implementado
> **Depends on:** ninguna (los estilos ya están portados en `app/globals.css` y las fuentes en `app/layout.tsx`, commit `3900915`)
> **Date:** 2026-11-26
> **Objective:** Portar a Next.js (App Router) las 5 pantallas de `references/templates/` — Biblioteca, Detalle, Reproductor, Acceso y Salón de la Fama — como interfaz solo visual, con datos mock y sin lógica de juego real.

## Por qué existe esta spec

Existe un prototipo en React UMD + Babel (`references/templates/*.jsx`, `styles.css`) con navegación por estado/hash. Hay que convertirlo en una app Next 16 real, con rutas propias, sin cambiar el diseño. `AGENTS.md` advierte que esta versión de Next difiere de lo conocido: antes de escribir código se leen las guías de `node_modules/next/dist/docs/01-app/` (en especial `08-caching.md`, por `cacheComponents: true`, y la de `<Link>`/prefetch, por `partialPrefetching: true`).

## Alcance

**Dentro:**

- 5 rutas del App Router (tabla abajo), más navbar, menú móvil y footer compartidos en `app/layout.tsx`.
- Biblioteca: hero, búsqueda por nombre, chips de categoría, grilla de tarjetas con efecto tilt, estado vacío "NO HAY RESULTADOS".
- Detalle: portada, etiquetas, descripción, stats, botones y tabla "MEJORES PUNTUACIONES" (10 filas mock).
- Reproductor simulado: HUD (jugador, puntuación, vidas, nivel), pausa, "FIN", arena CRT decorativa, modal de fin de juego con guardado de puntuación.
- Acceso: pestañas Iniciar sesión / Crear cuenta, "Jugar como invitado", botones sociales decorativos.
- Salón de la Fama: pestañas por juego, podio top 3, tabla de 12 filas y fila "TU MEJOR MARCA" si hay sesión.
- Sesión falsa y puntuaciones guardadas en `localStorage`.
- Responsive según los `@media` ya presentes en `globals.css`.
- Página 404 para `id` de juego inexistente.

**Fuera de alcance (specs futuras):**

- Cualquier juego real (motor, controles, colisiones). El reproductor solo simula.
- Autenticación real (backend, validación, OAuth Google/GitHub). Los botones sociales no hacen nada.
- Base de datos o API para juegos y puntuaciones.
- Mostrar en el Salón/Detalle las puntuaciones guardadas en `av_scores` (se guardan, pero no se leen en esta spec).
- Contador de créditos funcional (queda fijo en "CRÉDITOS · 03").
- Tests automatizados.
- i18n más allá del español.

## Rutas

| Pantalla | Ruta | Plantilla de origen |
| --- | --- | --- |
| Biblioteca | `/` | `biblioteca.jsx` |
| Detalle | `/juegos/[id]` | `detalle.jsx` |
| Reproductor | `/juegos/[id]/jugar` | `reproductor.jsx` |
| Acceso | `/acceso` | `auth.jsx` |
| Salón de la Fama | `/salon` | `salon.jsx` |

## Modelo de datos

Se reutiliza el modelo de `data.jsx`, tipado en TypeScript en `lib/data.ts`:

```ts
export type Categoria = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type Color = "cyan" | "magenta" | "yellow" | "green";

export interface Juego {
  id: string;          // slug: "bloque-buster", "caida", "serpentina", "gloton",
                       // "invasores", "rocas", "ranaria", "duelo-pixel"
  title: string;
  short: string;
  long: string;
  cat: Categoria;
  cover: string;       // clase CSS existente en globals.css, p. ej. "cover-bricks"
  color: Color;
  best: number;
  plays: string;       // "12.4K"
}

export interface Puntuacion { rank: number; name: string; score: number; date: string } // date "DD/MM/2026"
export interface Usuario { name: string }                                              // máx. 10 caracteres, mayúsculas
export interface PuntuacionGuardada { game: string; score: number; name: string; at: number }

export const GAMES: Juego[];            // los 8 juegos de la plantilla
export const CATS = ["TODOS", "ARCADE", "PUZZLE", "SHOOTER", "VERSUS"] as const;
export function seededScores(seed: number, count?: number): Puntuacion[]; // determinista
```

Persistencia (`localStorage`, claves de la plantilla):

- `av_user`: `Usuario | null` (JSON).
- `av_scores`: `PuntuacionGuardada[]` (JSON, se añade al final).

Convenciones:

- `seededScores` es determinista (mismo seed → mismas filas), para evitar desajustes de hidratación.
- Seeds: detalle `id.length * 17 + 3` (10 filas); salón `id.length * 23 + 7` (12 filas).
- Números con `toLocaleString("es-ES")`.

## Plan de implementación

Cada paso deja la app compilando y ejecutable (`npm run dev`).

1. Leer las guías de Next relevantes en `node_modules/next/dist/docs/01-app/` y anotar en la sesión cualquier restricción de `cacheComponents` (acceso a `params`, `Suspense`, Client Components).
2. Crear `lib/data.ts` con tipos, `GAMES`, `CATS` y `seededScores`, portados de `data.jsx`. Verificar con `npx tsc --noEmit`.
3. Crear `components/session-provider.tsx` (Client Component con contexto: `user`, `login`, `signOut`, `saveScore`) que lee/escribe `av_user` y `av_scores` en `localStorage` sin romper la hidratación ni fallar si `localStorage` no está disponible.
4. Crear `components/nav.tsx` (logo, enlaces con estado activo según `usePathname`, contador de créditos, botón de sesión, menú móvil con backdrop) y `components/footer.tsx`. Integrarlos en `app/layout.tsx` con el provider, conservando `av-bg`, `av-noise` y las fuentes actuales. Reemplazar la plantilla de `app/page.tsx` por un placeholder mínimo.
5. Biblioteca en `/`: `components/game-card.tsx` (tilt, `<Link>` a `/juegos/[id]`) y `components/library.tsx` (hero, búsqueda, chips, grilla, estado vacío).
6. Detalle en `app/juegos/[id]/page.tsx` con `generateStaticParams` sobre `GAMES` y `notFound()` si el id no existe; `components/leaderboard.tsx` para la tabla lateral. Añadir `app/not-found.tsx` con estética arcade.
7. Acceso en `app/acceso/page.tsx` con `components/auth-form.tsx`: pestañas, campo de correo solo en "Crear cuenta", `login({name})` con `(user || "PLAYER1").toUpperCase().slice(0, 10)`, invitado → `login(null)`, redirección a `/`.
8. Reproductor en `app/juegos/[id]/jugar/page.tsx` con `components/game-player.tsx`: HUD, intervalo de puntaje simulado cada 220 ms, pausa, "FIN", modal con `saveScore`, "JUGAR DE NUEVO", "VOLVER AL VAULT", "SALIR" → `/juegos/[id]`.
9. Salón en `app/salon/page.tsx` con `components/hall-of-fame.tsx`: pestañas por juego, podio, tabla con animación escalonada y fila del usuario si hay sesión.
10. Metadatos por página (`title`/`description` en español) y revisión de responsive en 375 px, 768 px y 1280 px contra el prototipo.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores de TypeScript y `npm run lint` sin errores.
- [ ] Existen las rutas `/`, `/juegos/bloque-buster`, `/juegos/bloque-buster/jugar`, `/acceso` y `/salon` y responden 200.
- [ ] `/juegos/no-existe` y `/juegos/no-existe/jugar` muestran la página 404.
- [ ] La Biblioteca muestra 8 tarjetas; el chip "SHOOTER" deja 2 (INVASORES, ROCAS); el chip "ARCADE" deja 4.
- [ ] Buscar "xyz" muestra "NO HAY RESULTADOS"; buscar "rana" deja solo RANARIA.
- [ ] Clic en una tarjeta o en su botón JUGAR navega a `/juegos/[id]`.
- [ ] El Detalle muestra 10 filas de puntuaciones; las 3 primeras tienen estilo top1/top2/top3.
- [ ] "JUGAR AHORA" navega a `/juegos/[id]/jugar`; "VOLVER AL VAULT" navega a `/`.
- [ ] En el Reproductor la puntuación aumenta sola; "PAUSA" la detiene y muestra "EN PAUSA"; "REANUDAR" la retoma.
- [ ] "FIN" abre el modal; "GUARDAR PUNTUACIÓN" añade una entrada a `localStorage["av_scores"]` y muestra "PUNTUACIÓN GUARDADA_".
- [ ] "JUGAR DE NUEVO" reinicia puntuación a 0, vidas a 3 y nivel a 1.
- [ ] En Acceso, "CREAR CUENTA" muestra el campo de correo; "INICIAR SESIÓN" lo oculta.
- [ ] Enviar el formulario con usuario "kai" guarda `av_user = {"name":"KAI"}` y redirige a `/`; el navbar muestra "KAI ▾".
- [ ] Con el campo vacío, el usuario resultante es "PLAYER1".
- [ ] "JUGAR COMO INVITADO" redirige a `/` y el navbar muestra "Iniciar Sesión".
- [ ] Clic en "KAI ▾" cierra la sesión y elimina `av_user`.
- [ ] Tras recargar la página, la sesión persiste.
- [ ] El Salón muestra podio, 12 filas, y cambia de datos al elegir otro juego; la fila "TU MEJOR MARCA" aparece solo con sesión.
- [ ] El enlace activo del navbar es "Biblioteca" en `/`, `/juegos/*` y `/juegos/*/jugar`, y "Salón de la Fama" en `/salon`.
- [ ] A 375 px aparece el botón hamburguesa; abre y cierra el panel móvil con enlaces funcionales.
- [ ] La consola del navegador no muestra errores de hidratación en ninguna de las 5 pantallas.

## Decisiones

- **Sí:** rutas reales del App Router en español (`/juegos`, `/acceso`, `/salon`). URLs compartibles y aprovecha `<Link>` y el prefetch de Next 16.
- **No:** replicar la SPA con estado + hash JSON de la plantilla. Desaprovecha Next y no permite enlaces directos.
- **Sí:** reutilizar el CSS global ya portado (`app/globals.css`, clases `av-*`). Máxima fidelidad con el prototipo y ya está hecho.
- **No:** reescribir con utilidades Tailwind. Más largo y con riesgo de divergir del diseño.
- **Sí:** mantener la simulación del reproductor (puntaje aleatorio, pausa, fin). Permite revisar HUD y modal sin implementar juegos.
- **Sí:** mock local + `localStorage` con las claves `av_user` y `av_scores` de la plantilla. Suficiente para un MVP visual.
- **No:** base de datos, API o auth real. Van en otra spec.
- **Sí:** sesión en un contexto cliente (`SessionProvider`) en el layout, porque el navbar, Acceso, Reproductor y Salón la comparten.
- **Sí:** `generateStaticParams` para `/juegos/[id]`, dado que los 8 juegos son conocidos y estáticos.
- **Supuesto:** el contador "CRÉDITOS · 03" es decorativo y estático, igual que en la plantilla.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| `cacheComponents: true` rechaza acceso a datos de runtime (`params`, etc.) fuera de `Suspense` | Paso 1 lee la guía; `generateStaticParams` evita datos dinámicos en el detalle; el código dependiente de `localStorage` va en Client Components. |
| Desajuste de hidratación al leer `localStorage` (el servidor no lo tiene) | El provider inicia con `user = null` y lo carga en un efecto tras montar; el navbar tolera el estado inicial. |
| `localStorage` bloqueado (modo privado) | `try/catch` como en la plantilla; la sesión queda solo en memoria. |
| Puntaje simulado con `Math.random()` causa desajuste de hidratación | Empieza en 0 y solo cambia dentro de un efecto en cliente. |
| Diferencia entre `globals.css` y `styles.css` (fuentes vía `next/font`) | Ya resuelto en el commit `3900915`; verificar visualmente en el paso 10. |

## Lo que **no** está en esta spec

- Juegos jugables.
- Autenticación o backend reales, OAuth Google/GitHub.
- Lectura de `av_scores` para alimentar rankings.
- Créditos funcionales.
- Tests automatizados.

Cada punto, si llega, va en su propia spec.
