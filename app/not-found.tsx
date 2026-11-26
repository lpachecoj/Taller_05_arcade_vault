import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "96px 24px" }} className="fade-in">
      <div className="pixel neon-magenta flicker" style={{ fontSize: 40, marginBottom: 20 }}>
        404
      </div>
      <div className="pixel neon-cyan" style={{ fontSize: 14, marginBottom: 16 }}>
        JUEGO NO ENCONTRADO
      </div>
      <p style={{ color: "var(--ink-faint)", marginBottom: 32 }}>
        Este cartucho no existe en el Vault. <span className="blink">_</span>
      </p>
      <Link href="/" className="btn lg">
        VOLVER AL VAULT
      </Link>
    </div>
  );
}
