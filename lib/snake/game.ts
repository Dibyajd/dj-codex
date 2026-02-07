export type Direction = "up" | "down" | "left" | "right";

export type Point = {
  x: number;
  y: number;
};

export type GameStatus = "running" | "paused" | "game-over";

export type SnakeGameState = {
  gridSize: number;
  snake: Point[];
  direction: Direction;
  nextDirection: Direction;
  food: Point;
  score: number;
  status: GameStatus;
};

export type CreateGameOptions = {
  gridSize?: number;
  rng?: () => number;
};

const DEFAULT_GRID_SIZE = 16;

const directionVectors: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

function pointsEqual(a: Point, b: Point) {
  return a.x === b.x && a.y === b.y;
}

function isOpposite(a: Direction, b: Direction) {
  return (
    (a === "up" && b === "down") ||
    (a === "down" && b === "up") ||
    (a === "left" && b === "right") ||
    (a === "right" && b === "left")
  );
}

export function getInitialSnake(gridSize: number): Point[] {
  const y = Math.floor(gridSize / 2);
  const x = Math.floor(gridSize / 2);
  return [
    { x, y },
    { x: x - 1, y },
    { x: x - 2, y }
  ];
}

export function placeFood(snake: Point[], gridSize: number, rng: () => number = Math.random): Point | null {
  const occupied = new Set(snake.map((segment) => `${segment.x},${segment.y}`));
  const openCells: Point[] = [];

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      if (!occupied.has(`${x},${y}`)) {
        openCells.push({ x, y });
      }
    }
  }

  if (openCells.length === 0) return null;
  const idx = Math.floor(rng() * openCells.length);
  return openCells[Math.min(idx, openCells.length - 1)];
}

export function createInitialGameState(options: CreateGameOptions = {}): SnakeGameState {
  const gridSize = options.gridSize ?? DEFAULT_GRID_SIZE;
  const snake = getInitialSnake(gridSize);
  const food = placeFood(snake, gridSize, options.rng);

  if (!food) {
    throw new Error("Could not place food on initial board.");
  }

  return {
    gridSize,
    snake,
    direction: "right",
    nextDirection: "right",
    food,
    score: 0,
    status: "running"
  };
}

export function setDirection(state: SnakeGameState, direction: Direction): SnakeGameState {
  if (isOpposite(direction, state.direction)) {
    return state;
  }

  return { ...state, nextDirection: direction };
}

export function togglePause(state: SnakeGameState): SnakeGameState {
  if (state.status === "game-over") return state;
  return { ...state, status: state.status === "paused" ? "running" : "paused" };
}

function isOutOfBounds(point: Point, gridSize: number) {
  return point.x < 0 || point.y < 0 || point.x >= gridSize || point.y >= gridSize;
}

export function tickGame(state: SnakeGameState, rng: () => number = Math.random): SnakeGameState {
  if (state.status !== "running") return state;

  const move = directionVectors[state.nextDirection];
  const nextHead = {
    x: state.snake[0].x + move.x,
    y: state.snake[0].y + move.y
  };

  if (isOutOfBounds(nextHead, state.gridSize)) {
    return { ...state, direction: state.nextDirection, status: "game-over" };
  }

  const grows = pointsEqual(nextHead, state.food);
  const bodyToCheck = grows ? state.snake : state.snake.slice(0, -1);
  const hitSelf = bodyToCheck.some((segment) => pointsEqual(segment, nextHead));
  if (hitSelf) {
    return { ...state, direction: state.nextDirection, status: "game-over" };
  }

  const nextSnake = [nextHead, ...state.snake];
  if (!grows) {
    nextSnake.pop();
  }

  let nextFood = state.food;
  let nextStatus: GameStatus = state.status;
  const nextScore = grows ? state.score + 1 : state.score;

  if (grows) {
    const candidate = placeFood(nextSnake, state.gridSize, rng);
    if (candidate) {
      nextFood = candidate;
    } else {
      nextStatus = "game-over";
    }
  }

  return {
    ...state,
    direction: state.nextDirection,
    snake: nextSnake,
    food: nextFood,
    score: nextScore,
    status: nextStatus
  };
}
