"use server";

import { Resend } from "resend";
import {
  validarContacto,
  type ContactoInput,
  type ContactoResultado,
} from "@/lib/contacto";

// Elimina saltos de línea (\r, \n) para evitar inyección de cabeceras.
function sinSaltos(valor: string): string {
  return valor.replace(/[\r\n]+/g, " ").trim();
}

export async function enviarContacto(
  input: ContactoInput,
): Promise<ContactoResultado> {
  // El servidor es la fuente de verdad: se revalida siempre.
  if (!validarContacto(input)) {
    return { ok: false, error: "validacion" };
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    console.error("enviarContacto: faltan RESEND_API_KEY o CONTACT_TO_EMAIL");
    return { ok: false, error: "envio" };
  }

  const name = sinSaltos(input.name);
  const email = sinSaltos(input.email);
  const msg = input.msg.trim();

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "Arcade Vault <onboarding@resend.dev>",
      to,
      replyTo: email,
      subject: `[Arcade Vault] Mensaje de ${name}`,
      text: `Nombre: ${name}\nCorreo: ${email}\n\nMensaje:\n${msg}`,
    });

    if (error) {
      console.error("enviarContacto: Resend devolvió un error", {
        name: error.name,
        message: error.message,
      });
      return { ok: false, error: "envio" };
    }

    return { ok: true, name };
  } catch (e) {
    console.error(
      "enviarContacto: excepción al enviar",
      e instanceof Error ? e.message : "desconocida",
    );
    return { ok: false, error: "envio" };
  }
}
