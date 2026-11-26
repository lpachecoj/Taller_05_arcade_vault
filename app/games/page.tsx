import type { Metadata } from "next";
import { Library } from "@/components/library";

export const metadata: Metadata = {
  // El template del layout raíz no aplica a la página de la misma carpeta
  title: { absolute: "Biblioteca · Arcade Vault" },
  description: "Explora la biblioteca de juegos arcade de Arcade Vault.",
};

export default function GamesPage() {
  return <Library />;
}
