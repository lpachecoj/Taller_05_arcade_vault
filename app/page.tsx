import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { absolute: "Arcade Vault · Arcade clásico en tu navegador" },
  description:
    "Juega los mejores clásicos arcade directamente en tu navegador. Sin descargas y sin costo.",
};

// Placeholder: la Home completa se implementa en los pasos 6 y 7 de SPEC 02.
export default function Home() {
  return (
    <div style={{ textAlign: "center", padding: "96px 24px" }}>
      <Link href="/games" className="btn xl">
        EXPLORAR JUEGOS
      </Link>
    </div>
  );
}
