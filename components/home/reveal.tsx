"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

interface RevealProps {
  as?: "section" | "div";
  className?: string;
  children: ReactNode;
  "aria-hidden"?: boolean | "true" | "false";
}

// Añade la clase `.in` cuando el elemento entra en el viewport (animación `.reveal`).
// El HTML del servidor trae `.reveal` sin `.in`; el CSS lo deja visible si no hay JS
// (`@media (scripting: none)`). Si no existe IntersectionObserver, se muestra de inmediato.
export function Reveal({
  as = "section",
  className = "",
  children,
  "aria-hidden": ariaHidden,
}: RevealProps) {
  const Tag: ElementType = as;
  const ref = useRef<HTMLDivElement>(null); // también sirve para <section>: solo se usa classList

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={(className + " reveal").trim()} aria-hidden={ariaHidden}>
      {children}
    </Tag>
  );
}
