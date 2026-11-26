import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Acceso",
  description: "Inicia sesión, crea una cuenta o juega como invitado en Arcade Vault.",
};

export default function AccesoPage() {
  return <AuthForm />;
}
