import test from "node:test";
import assert from "node:assert/strict";
import {
  SnakeGameState,
  createInitialGameState,
  placeFood,
  setDirection,
  tickGame
} from "@/lib/snake/game";

test("moves one cell in current direction", () => {
  const state = createInitialGameState({ gridSize: 8, rng: () => 0 });
  const next = tickGame(state, () => 0);
  assert.equal(next.snake[0].x, state.snake[0].x + 1);
  assert.equal(next.snake[0].y, state.snake[0].y);
  assert.equal(next.status, "running");
});

test("prevents immediate 180 degree turns", () => {
  const state = createInitialGameState({ gridSize: 8, rng: () => 0 });
  const updated = setDirection(state, "left");
  assert.equal(updated.nextDirection, "right");
});

test("hits wall and ends game", () => {
  const state: SnakeGameState = {
    gridSize: 6,
    snake: [
      { x: 5, y: 2 },
      { x: 4, y: 2 },
      { x: 3, y: 2 }
    ],
    direction: "right",
    nextDirection: "right",
    food: { x: 0, y: 0 },
    score: 0,
    status: "running"
  };
  const next = tickGame(state);
  assert.equal(next.status, "game-over");
});

test("grows and increments score when eating food", () => {
  const state: SnakeGameState = {
    gridSize: 8,
    snake: [
      { x: 3, y: 3 },
      { x: 2, y: 3 },
      { x: 1, y: 3 }
    ],
    direction: "right",
    nextDirection: "right",
    food: { x: 4, y: 3 },
    score: 0,
    status: "running"
  };
  const next = tickGame(state, () => 0);
  assert.equal(next.snake.length, 4);
  assert.equal(next.score, 1);
});

test("food placement never overlaps snake", () => {
  const snake = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 }
  ];
  const food = placeFood(snake, 4, () => 0);
  assert.ok(food);
  assert.equal(snake.some((segment) => segment.x === food!.x && segment.y === food!.y), false);
});
