"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Direction,
  SnakeGameState,
  createInitialGameState,
  setDirection,
  tickGame,
  togglePause
} from "@/lib/snake/game";

const TICK_MS = 140;

const controlMap: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  a: "left",
  s: "down",
  d: "right",
  W: "up",
  A: "left",
  S: "down",
  D: "right"
};

function getCellClass(state: SnakeGameState, x: number, y: number) {
  const isHead = state.snake[0].x === x && state.snake[0].y === y;
  if (isHead) return "bg-accent";

  const isBody = state.snake.slice(1).some((segment) => segment.x === x && segment.y === y);
  if (isBody) return "bg-[#4f968d]";

  if (state.food.x === x && state.food.y === y) return "bg-accent2";
  return "bg-[#f6f0e4]";
}

export default function SnakePage() {
  const [game, setGame] = useState<SnakeGameState>(() => createInitialGameState());

  const gridTemplateColumns = useMemo(
    () => `repeat(${game.gridSize}, minmax(0, 1fr))`,
    [game.gridSize]
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setGame((current) => tickGame(current));
    }, TICK_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === " ") {
        event.preventDefault();
        setGame((current) => togglePause(current));
        return;
      }

      const direction = controlMap[event.key];
      if (!direction) return;
      event.preventDefault();
      setGame((current) => setDirection(current, direction));
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 md:px-10">
      <div className="panel">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="label">Arcade</p>
            <h1 className="font-display text-3xl text-ink">Snake</h1>
          </div>
          <div className="text-sm font-semibold text-[#5b5246]">Score: {game.score}</div>
        </header>

        <p className="mt-3 text-sm text-[#6b6152]">
          Controls: Arrow keys or WASD. Press Space to pause/resume.
        </p>

        <div
          className="mt-5 grid gap-[2px] rounded-xl border border-[#d9ccb6] bg-[#d9ccb6] p-[2px]"
          style={{ gridTemplateColumns }}
        >
          {Array.from({ length: game.gridSize * game.gridSize }, (_, idx) => {
            const x = idx % game.gridSize;
            const y = Math.floor(idx / game.gridSize);
            return <div key={`${x}-${y}`} className={`aspect-square rounded-[2px] ${getCellClass(game, x, y)}`} />;
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button type="button" onClick={() => setGame((current) => togglePause(current))} className="min-w-24">
            {game.status === "paused" ? "Resume" : "Pause"}
          </Button>
          <Button type="button" onClick={() => setGame(createInitialGameState())} className="min-w-24">
            Restart
          </Button>
        </div>

        {game.status === "game-over" ? (
          <p className="mt-4 text-sm font-semibold text-[#b45309]">Game over. Press Restart to play again.</p>
        ) : null}

        <div className="mt-5 max-w-[220px] rounded-xl border border-[#d7ccba] bg-white p-3 md:hidden">
          <p className="label">Touch Controls</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <div />
            <Button type="button" className="px-2 py-2" onClick={() => setGame((current) => setDirection(current, "up"))}>
              Up
            </Button>
            <div />
            <Button type="button" className="px-2 py-2" onClick={() => setGame((current) => setDirection(current, "left"))}>
              Left
            </Button>
            <Button type="button" className="px-2 py-2" onClick={() => setGame((current) => setDirection(current, "down"))}>
              Down
            </Button>
            <Button type="button" className="px-2 py-2" onClick={() => setGame((current) => setDirection(current, "right"))}>
              Right
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
