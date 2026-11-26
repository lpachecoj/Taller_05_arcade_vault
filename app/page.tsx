import type { Metadata } from "next";
import { HomePage } from "@/components/home/home-page";

export const metadata: Metadata = {
  // El template del layout raíz no aplica a la página de la misma carpeta
  title: { absolute: "Arcade Vault · Arcade clásico en tu navegador" },
  description:
    "Juega los mejores clásicos arcade directamente en tu navegador. Sin descargas, sin costo y con ranking global.",
};

export default function Home() {
  return <HomePage />;
}
