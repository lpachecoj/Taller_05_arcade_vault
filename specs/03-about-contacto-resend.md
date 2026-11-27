# SPEC 03 — Acerca de y formulario de contacto con Resend

> **Status:** aprobado
> **Depends on:** SPEC 01 (navbar, `app/globals.css`, estilos `.field`/`.btn`), SPEC 02 (`Reveal`, enlace "Inicio" del navbar, convención de metadatos)
> **Date:** 2026-11-27
> **Objective:** Implementar la página "Acerca de" idéntica a `references/templates/home-about/about.jsx`, con un formulario de contacto que envía el mensaje por correo mediante Resend desde una Server Action.

## Por qué existe esta spec

SPEC 02 dejó "Acerca de" fuera de alcance. La plantilla simula el envío (`setSent(...)` sin red). Aquí el envío es real, lo que añade secretos (API key), validación en servidor y estados de carga/error que la plantilla no tiene. Esos tres añadidos son las únicas diferencias con la plantilla; el resto debe ser idéntico.

`AGENTS.md` sigue vigente: antes de escribir código se leen las guías de `node_modules/next/dist/docs/01-app/` sobre Server Actions/formularios y `cacheComponents` (una acción de servidor no debe leer datos de runtime fuera de `Suspense` en el render de la página).

## Alcance

**Dentro:**

- Ruta `/about` con: hero ("ACERCA DE ARCADE VAULT", misión, 3 highlights con ícono pixel), divisor animado y sección de contacto (intro con 3 tips + formulario).
- Enlace "Acerca de" en el navbar y menú móvil (después de "Salón de la Fama", activo en `/about`), como en `nav.jsx`.
- Formulario con campos NOMBRE, CORREO ELECTRÓNICO y MENSAJE, animación `shake` en validación fallida y terminal de éxito ("VAULT-OS // TERMINAL") con botón "ENVIAR OTRO MENSAJE".
- Server Action `enviarContacto` que valida y envía el correo con Resend (SDK `resend`).
- Estados añadidos respecto a la plantilla: botón deshabilitado "▶  ENVIANDO…" mientras se envía y terminal de error con el mismo estilo si Resend falla.
- Remitente `onboarding@resend.dev`; destinatario tomado de la variable de entorno `CONTACT_TO_EMAIL`; `replyTo` = correo del visitante.
- Portar a `app/globals.css` los estilos de Acerca de desde `references/templates/home-about/styles.css` (líneas ~1072–1146 de esa hoja).
- Variables de entorno `RESEND_API_KEY` y `CONTACT_TO_EMAIL`, documentadas en `.env.example`.
- Metadatos (`title`/`description` en español) para `/about`.

**Fuera de alcance (specs futuras):**

- Dominio propio verificado en Resend (con `onboarding@resend.dev` solo se puede enviar al correo de la cuenta de Resend).
- Correo de confirmación al visitante.
- Guardar mensajes en base de datos o `localStorage`.
- Rate limiting, CAPTCHA o honeypot.
- Plantilla HTML/React Email del correo (se envía texto plano).
- Tests automatizados.
- Cualquier cambio en la Home, Biblioteca, Salón o Acceso, salvo el navbar.

## Rutas

| Pantalla | Ruta | Cambio |
| --- | --- | --- |
| Acerca de | `/about` | Nueva |
| Resto | sin cambios | — |

## Modelo de datos

No se persiste nada. Se añaden solo estos tipos y contrato en `lib/contacto.ts` (sin `"use server"`, importable desde cliente y servidor):

```ts
export interface ContactoInput { name: string; email: string; msg: string }

export type ContactoResultado =
  | { ok: true; name: string }
  | { ok: false; error: "validacion" | "envio" };

export const LIMITES = { name: 80, email: 254, msg: 2000 } as const;
export function validarContacto(input: ContactoInput): boolean; // trim, no vacío, email con regex simple, longitudes <= LIMITES
```

Server Action en `app/about/actions.ts` (`"use server"`):

```ts
export async function enviarContacto(input: ContactoInput): Promise<ContactoResultado>;
```

Configuración de correo:

| Campo Resend | Valor |
| --- | --- |
| `from` | `Arcade Vault <onboarding@resend.dev>` |
| `to` | `process.env.CONTACT_TO_EMAIL` |
| `replyTo` | `email` del visitante |
| `subject` | `[Arcade Vault] Mensaje de {name}` |
| `text` | nombre, correo y mensaje en texto plano |

Convenciones:

- La validación corre en cliente (para el `shake`) **y** en servidor (fuente de verdad).
- El servidor nunca devuelve el mensaje de error de Resend al cliente; solo `"envio"`. El detalle se registra con `console.error` sin incluir la API key.
- Los saltos de línea y caracteres `\r\n` del `name` se eliminan antes de usarlo en `subject` (evita inyección de cabeceras).
- `RESEND_API_KEY` y `CONTACT_TO_EMAIL` no llevan prefijo `NEXT_PUBLIC_`.

## Plan de implementación

Cada paso deja la app compilando y ejecutable (`npm run dev`).

1. Leer en `node_modules/next/dist/docs/01-app/` las guías de Server Actions/formularios y `cacheComponents`; anotar restricciones (p. ej. uso de `useTransition`, lectura de `process.env` en la acción).
2. Instalar `resend` (`npm install resend`) y crear `.env.example` con `RESEND_API_KEY=` y `CONTACT_TO_EMAIL=`. Como `.gitignore` ignora `.env*`, añadir la excepción `!.env.example`. El usuario crea `.env.local` con valores reales (nunca se commitean).
3. Crear `lib/contacto.ts` con tipos, `LIMITES` y `validarContacto`. Verificar con `npx tsc --noEmit`.
4. Crear `app/about/actions.ts` con `enviarContacto`: revalida en servidor, falla con `"envio"` si faltan las variables de entorno, llama a `resend.emails.send` y mapea errores. Probar con una invocación manual desde el formulario del paso 7 o con un script puntual.
5. Portar a `app/globals.css` los estilos de Acerca de: `about*`, `highlight*`, `hl-*`, `about-divider`, `div-bar`, `div-pixels`, `about-contact`, `contact-*`, `.contact-form textarea`, `terminal-success`, `term-*` y los `@keyframes` `shake` y `pxblink`. Si un `@keyframes` o clase ya existe (`blink`, `.field`, `fadeIn`), reutilizarlo sin duplicar. Añadir solo el estilo mínimo para el botón deshabilitado y la línea de error de la terminal (`.term-body .error`).
6. Crear componentes en `components/about/`: `highlight-icon.tsx` (HEART, BROWSER, PLANT, `aria-hidden`), `about-hero.tsx` (hero + highlights con `transitionDelay: i*80ms`, divisor con 24 píxeles) y reutilizar `Reveal` de SPEC 02 para `about-divider` y `about-contact`.
7. Crear `components/about/contact-form.tsx` (Client Component): estado `{name,email,msg}`, `sent`, `shake`, `enviando`, `error`; valida en cliente, llama a `enviarContacto` dentro de `useTransition`, muestra terminal de éxito con `GRACIAS, {NOMBRE}` en mayúsculas o terminal de error con "ERROR AL ENVIAR. INTÉNTALO DE NUEVO." y botón para reintentar. "ENVIAR OTRO MENSAJE" limpia el formulario.
8. Crear `app/about/page.tsx` con metadatos (`title: { absolute: "Acerca de · Arcade Vault" }`, `description` en español) y la composición `about-hero` + divisor + sección de contacto, dentro de `<div className="about fade-in">`.
9. Navbar (`components/nav.tsx`): añadir "Acerca de" (`/about`, activo con `pathname.startsWith("/about")`) tras "Salón de la Fama", en escritorio y menú móvil.
10. Comparar visualmente `/about` con `references/templates/home-about/arcade-vault-standalone.html` en 375 px, 768 px y 1280 px, y probar un envío real con claves válidas.

## Criterios de aceptación

- [ ] `npm run build` termina sin errores de TypeScript y `npm run lint` sin errores.
- [ ] `/about` responde 200 y muestra, en orden: kicker "▸ ACERCA DE", título "ACERCA DE ARCADE VAULT", misión, 3 highlights, divisor, kicker "▸ CONTACTO", "CONTÁCTANOS" y el formulario.
- [ ] Los textos, colores (`magenta`, `cyan`, `green`), íconos y 3 tips ("RESPUESTA EN 24-48H", "SUGERENCIAS BIENVENIDAS", "SIN SPAM, JAMÁS") coinciden literalmente con `about.jsx`.
- [ ] Los 3 íconos de highlight son SVG y el divisor tiene 24 píxeles animados y `aria-hidden="true"`.
- [ ] `about-divider` y `about-contact` pasan a clase `.in` al entrar en el viewport; con `IntersectionObserver` ausente el contenido sigue visible.
- [ ] Enviar con cualquier campo vacío (o solo espacios) no llama a la acción y aplica la clase `shake` durante ~400 ms.
- [ ] Enviar con un correo inválido (p. ej. `abc`) no envía y aplica `shake`.
- [ ] Mientras la acción está en curso, el botón está deshabilitado y muestra "ENVIANDO…"; no se puede enviar dos veces.
- [ ] Con claves válidas, un envío exitoso entrega un correo a `CONTACT_TO_EMAIL` con `from` `onboarding@resend.dev`, asunto `[Arcade Vault] Mensaje de {nombre}`, y responder al correo lo dirige al email del visitante.
- [ ] Tras el éxito se muestra la terminal "VAULT-OS // TERMINAL" con "> MENSAJE RECIBIDO. TE RESPONDEREMOS PRONTO. GRACIAS, {NOMBRE EN MAYÚSCULAS}." y el botón "ENVIAR OTRO MENSAJE" restablece el formulario vacío.
- [ ] Con `RESEND_API_KEY` ausente o inválida se muestra la terminal de error con opción de reintentar y no se muestra el éxito.
- [ ] Llamar a `enviarContacto` con datos inválidos (vacíos, email malformado, `msg` > 2000 caracteres) devuelve `{ ok: false, error: "validacion" }` sin contactar a Resend.
- [ ] `RESEND_API_KEY` no aparece en el bundle del cliente (`grep` en `.next/static` no la encuentra) ni en la respuesta de la acción.
- [ ] `.env.example` existe y está versionable; `.env.local` sigue ignorado por git.
- [ ] El navbar muestra "Acerca de" después de "Salón de la Fama", activo solo en `/about`, también en el menú móvil.
- [ ] A 375 px `/about` no tiene scroll horizontal: highlights y `contact-grid` pasan a una columna.
- [ ] La consola del navegador no muestra errores de hidratación en `/about`.
- [ ] `grep` en `app/globals.css` no encuentra `@keyframes` duplicados con el mismo nombre y las pantallas de SPEC 01 y SPEC 02 siguen respondiendo 200.

## Decisiones

- **Sí:** Server Action. Next 16 la recomienda para mutaciones desde formularios, no expone un endpoint público documentado y mantiene la API key en el servidor.
- **No:** Route Handler `/api/contacto`. Más código (fetch, serialización) sin beneficio mientras solo lo consume este formulario.
- **Sí:** remitente `onboarding@resend.dev` y destinatario en `CONTACT_TO_EMAIL`. Funciona sin verificar dominio; es lo adecuado para el taller. Limitación: Resend solo entrega al correo de la cuenta.
- **No:** dominio propio verificado ahora. Requiere DNS y queda para otra spec cuando haya dominio.
- **Sí:** un solo correo al equipo con `replyTo` del visitante. Permite responder directo sin duplicar envíos.
- **No:** correo de confirmación al visitante. Duplica envíos y exige dominio verificado para llegar a terceros.
- **Sí:** añadir estados "enviando" y "error" aunque la plantilla no los tiene. Sin ellos un fallo de Resend dejaría al usuario sin respuesta; se reutiliza el lenguaje visual de la terminal.
- **Sí:** validar en cliente y en servidor. El cliente da el `shake` inmediato; el servidor es la barrera real.
- **Sí:** texto plano en el correo. Evita dependencias (React Email) y problemas de renderizado.
- **Sí:** ruta `/about`, indicada por el usuario. Es coherente con `/games` (SPEC 02) y deja `/acceso`, `/salon` y `/juegos` como rutas en español heredadas de SPEC 01.
- **No:** `/acerca-de`. Era el supuesto inicial, descartado por el usuario.
- **Sí:** portar los estilos a `app/globals.css` (mismo criterio que SPEC 01 y 02, un único CSS global).
- **No:** rate limiting/CAPTCHA en esta spec. Se declara como riesgo.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Con `onboarding@resend.dev` Resend rechaza destinatarios que no sean el correo de la cuenta | `CONTACT_TO_EMAIL` debe ser el correo de la cuenta Resend; documentado en `.env.example`. |
| Abuso del formulario (spam, agotar cuota gratuita) | Fuera de alcance; límites de longitud en servidor. Rate limiting/CAPTCHA en una spec posterior. |
| Fuga de `RESEND_API_KEY` | Sin prefijo `NEXT_PUBLIC_`, solo leída en la acción, `.env*` ignorado, criterio de `grep` en el bundle. |
| Inyección de cabeceras vía `name` en `subject` o `replyTo` | Se eliminan `\r\n` y se valida el email antes de usarlo. |
| `.gitignore` con `.env*` ignora también `.env.example` | Excepción `!.env.example` en el paso 2. |
| Choque de clases o `@keyframes` (`shake`, `pxblink`, `blink`) con los ya existentes | El paso 5 compara antes de pegar; criterio de `grep` de duplicados. |
| Doble envío por doble clic | Botón deshabilitado con `useTransition` mientras `enviando`. |
| `cacheComponents: true` y lectura de `process.env` | La lectura ocurre dentro de la Server Action, no en el render de la página; paso 1 lo confirma en la guía. |
| API de `resend` distinta a la esperada (p. ej. `replyTo` vs `reply_to`) | Verificar contra la documentación oficial y los tipos del paquete instalado en el paso 4. |

## Lo que **no** está en esta spec

- Dominio propio verificado en Resend.
- Correo de confirmación al visitante.
- Guardar mensajes en base de datos.
- Rate limiting, CAPTCHA u honeypot.
- Plantillas HTML/React Email.
- Cambios en otras pantallas más allá del navbar.
- Tests automatizados.

Cada punto, si llega, va en su propia spec.
