import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { GAMES } from "@/lib/data";
import { GamePlayer } from "@/components/game-player";

export function generateStaticParams() {
  return GAMES.map((g) => ({ id: g.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/juegos/[id]/jugar">): Promise<Metadata> {
  const { id } = await params;
  const game = GAMES.find((g) => g.id === id);
  if (!game) return { title: "Juego no encontrado" };
  return { title: `Jugando ${game.title}`, description: game.short };
}

export default function JugarPage({ params }: PageProps<"/juegos/[id]/jugar">) {
  return (
    <Suspense fallback={<div className="av-player" />}>
      <Jugar params={params} />
    </Suspense>
  );
}

async function Jugar({ params }: Pick<PageProps<"/juegos/[id]/jugar">, "params">) {
  const { id } = await params;
  const game = GAMES.find((g) => g.id === id);
  if (!game) notFound();

  return <GamePlayer game={game} />;
}
