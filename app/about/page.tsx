import type { Metadata } from "next";
import { Reveal } from "@/components/home/reveal";
import { AboutHero, AboutDivider } from "@/components/about/about-hero";
import { ContactForm } from "@/components/about/contact-form";

export const metadata: Metadata = {
  // El template del layout raíz no aplica a la página de la misma carpeta
  title: { absolute: "Acerca de · Arcade Vault" },
  description:
    "Conoce la misión de Arcade Vault y escríbenos: sugerencias, propuestas de juegos o simplemente un saludo.",
};

export default function AboutPage() {
  return (
    <div className="about fade-in">
      <AboutHero />

      <AboutDivider />

      <Reveal className="about-contact">
        <div className="contact-grid">
          <div className="contact-intro">
            <div className="kicker pixel neon-cyan">▸ CONTACTO</div>
            <h2 className="contact-title">CONTÁCTANOS</h2>
            <p className="contact-sub">
              ¿Tienes alguna sugerencia, quieres proponer un juego, o simplemente quieres
              saludar? Escríbenos.
            </p>
            <div className="contact-tips">
              <div className="tip">
                <span className="tip-led"></span>RESPUESTA EN 24-48H
              </div>
              <div className="tip">
                <span className="tip-led y"></span>SUGERENCIAS BIENVENIDAS
              </div>
              <div className="tip">
                <span className="tip-led m"></span>SIN SPAM, JAMÁS
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </Reveal>
    </div>
  );
}
