import { Reveal } from "@/components/home/reveal";
import { HighlightIcon, type HighlightKind } from "@/components/about/highlight-icon";

const HIGHLIGHTS: { i: HighlightKind; t: string; c: "magenta" | "cyan" | "green" }[] = [
  { i: "HEART", t: "HECHO CON ❤️ PARA JUGADORES", c: "magenta" },
  { i: "BROWSER", t: "JUEGOS EN HTML — CORREN EN CUALQUIER NAVEGADOR", c: "cyan" },
  { i: "PLANT", t: "PROYECTO EN CONSTANTE CRECIMIENTO", c: "green" },
];

export function AboutHero() {
  return (
    <section className="about-hero">
      <div className="kicker pixel neon-yellow">▸ ACERCA DE</div>
      <h1 className="about-title">ACERCA DE ARCADE VAULT</h1>
      <p className="about-mission">
        ARCADE VAULT nació del amor por los videojuegos clásicos. Nuestra misión es preservar y
        celebrar los arcades que definieron una generación, haciéndolos accesibles para todos, en
        cualquier lugar y sin costo.
      </p>

      <div className="highlight-row">
        {HIGHLIGHTS.map((h, i) => (
          <div
            key={h.i}
            className={"highlight " + h.c}
            style={{ transitionDelay: i * 80 + "ms" }}
          >
            <HighlightIcon kind={h.i} />
            <div className="hl-text pixel">{h.t}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Divisor animado: 24 píxeles parpadeantes entre dos barras. Decorativo (aria-hidden).
export function AboutDivider() {
  return (
    <Reveal as="div" className="about-divider" aria-hidden="true">
      <div className="div-bar"></div>
      <div className="div-pixels">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} style={{ animationDelay: i * 80 + "ms" }}></span>
        ))}
      </div>
      <div className="div-bar"></div>
    </Reveal>
  );
}
