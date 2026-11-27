// Contrato del formulario de contacto. Sin "use server": importable desde cliente y servidor.

export interface ContactoInput {
  name: string;
  email: string;
  msg: string;
}

export type ContactoResultado =
  | { ok: true; name: string }
  | { ok: false; error: "validacion" | "envio" };

export const LIMITES = { name: 80, email: 254, msg: 2000 } as const;

// Regex simple: algo@algo.algo, sin espacios.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarContacto(input: ContactoInput): boolean {
  if (
    !input ||
    typeof input.name !== "string" ||
    typeof input.email !== "string" ||
    typeof input.msg !== "string"
  ) {
    return false;
  }

  const name = input.name.trim();
  const email = input.email.trim();
  const msg = input.msg.trim();

  if (!name || !email || !msg) return false;
  if (name.length > LIMITES.name) return false;
  if (email.length > LIMITES.email) return false;
  if (msg.length > LIMITES.msg) return false;

  return EMAIL_RE.test(email);
}
