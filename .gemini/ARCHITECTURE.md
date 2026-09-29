# NEON RUSH — Architecture

## 1. Architectural Principle

NEON RUSH is a **web platform application containing a separately engineered game runtime**.

The architecture intentionally separates:

- **Presentation/platform:** Next.js + React.
- **Game runtime:** standalone TypeScript package.
- **Rendering:** Three.js (or another rendering layer behind the engine renderer interface if changed later).
- **Shared contracts:** explicit types/interfaces shared at compile time, without allowing the web app to reach into engine internals.

The web application should be able to host the engine without the engine knowing that React or Next.js exists.

---

## 2. Recommended Repository Structure

Use a monorepo/workspace layout.

```text
neon-rush/
├── apps/
│   └── web/                         # Next.js application
│       ├── app/
│       ├── components/
│       ├── features/
│       ├── public/
│       └── src/
│
├── packages/
│   ├── game-engine/                 # Standalone browser game runtime
│   │   ├── src/
│   │   │   ├── core/
│   │   │   ├── input/
│   │   │   ├── player/
│   │   │   ├── traffic/
│   │   │   ├── world/
│   │   │   ├── collision/
│   │   │   ├── scoring/
│   │   │   ├── difficulty/
│   │   │   ├── renderer/
│   │   │   ├── audio/
│   │   │   ├── assets/
│   │   │   ├── config/
│   │   │   └── index.ts             # Public package API
│   │   └── tests/
│   │
│   ├── game-contracts/              # Optional shared public types/events
│   │   └── src/
│   │
│   ├── ui/                          # Optional shared React UI primitives
│   └── config/                      # Shared lint/tsconfig/build config
│
├── docs/
│   ├── REQUIREMENTS.md
│   ├── ARCHITECTURE.md
│   ├── RULES.md
│   └── TODO.md
│
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

The exact workspace tool can change, but the dependency direction must remain stable.

---

## 3. Dependency Direction

The dependency graph should look like this:

```text
apps/web
   |
   v
packages/game-engine
   |
   +----> packages/game-contracts
```

Not allowed:

```text
packages/game-engine ---> apps/web
packages/game-engine ---> React
packages/game-engine ---> Next.js
```

The engine must remain framework-agnostic.

---

## 4. Next.js Application Architecture

### Responsibilities

The web app owns:

- Routes.
- Layouts.
- SEO metadata where applicable.
- HTML UI.
- Menus.
- Settings forms.
- Game shell.
- Loading/error states.
- Platform integrations.
- Authentication and API clients when introduced.

### Recommended structure

```text
apps/web/
├── app/
│   ├── page.tsx
│   ├── game/
│   │   └── page.tsx
│   └── layout.tsx
│
├── components/
├── features/
│   ├── game/
│   │   ├── GameCanvas.tsx
│   │   ├── GameOverlay.tsx
│   │   └── useGameSession.ts
│   └── settings/
├── lib/
└── styles/
```

The `GameCanvas` component should be a thin host around the engine.

---

## 5. Game Host Boundary

The web app should instantiate the engine through one explicit host/adapter.

Example conceptual API:

```ts
export interface GameEngineConfig {
  canvas: HTMLCanvasElement;
  settings: GameSettings;
}

export interface GameSnapshot {
  state: GameState;
  score: number;
  distanceMeters: number;
  speedKph: number;
}

export interface GameEngine {
  start(): void;
  pause(): void;
  resume(): void;
  restart(): void;
  destroy(): void;
  getSnapshot(): GameSnapshot;
}
```

The exact API can evolve, but the principle is mandatory:

> **React talks to the engine through a public contract, never through engine internals.**

---

## 6. Engine Layering

The engine should be divided into clear layers.

```text
GameRuntime
   |
   +-- GameStateMachine
   +-- InputManager
   +-- Simulation
   |     +-- PlayerController
   |     +-- TrafficManager
   |     +-- CollisionSystem
   |     +-- ScoreSystem
   |     +-- DifficultySystem
   |
   +-- WorldManager
   |     +-- RoadManager
   |     +-- EnvironmentManager
   |
   +-- Renderer
   |     +-- SceneManager
   |     +-- CameraController
   |     +-- Lighting
   |     +-- PostProcessing
   |
   +-- AudioManager
   |
   +-- AssetManager
```

---

## 7. Game Loop

The game loop must have an explicit lifecycle.

Conceptual flow:

```text
requestAnimationFrame
        |
        v
calculate delta time
        |
        v
process input
        |
        v
update simulation
        |
        v
update world / traffic
        |
        v
resolve collisions
        |
        v
update score / progression
        |
        v
render
```

Simulation should not depend on React render timing.

Avoid performing network requests or heavy synchronous work inside the frame loop.

---

## 8. Fixed vs Variable Time Step

For MVP, a variable render loop with a controlled simulation step is acceptable.

The engine should clamp unusually large delta values so tab switching or temporary frame stalls do not create explosive movement.

Conceptual rule:

```ts
const safeDeltaSeconds = Math.min(deltaSeconds, MAX_DELTA_SECONDS);
```

The constant must live in configuration rather than being repeated.

A fixed-step simulation may be adopted later if the gameplay systems require stronger determinism.

---

## 9. Input Architecture

Input must be centralized.

```text
Keyboard Events
      |
      v
InputManager
      |
      +--> accelerate
      +--> brake
      +--> laneLeft
      +--> laneRight
      +--> pause
```

Gameplay systems should consume normalized actions, not directly attach their own `keydown` handlers.

The input system must correctly handle:

- Key down.
- Key up.
- Repeated browser key events.
- Focus loss.
- Window visibility changes.

A/D should be treated as discrete lane-change intents with rate limiting or state checks to prevent accidental repeated lane jumps.

---

## 10. Lane Model

Lane positions must be centralized.

```ts
export interface LaneConfig {
  index: number;
  worldX: number;
}
```

A lane manager or configuration module should expose lane boundaries and positions.

Player movement should use a target lane rather than calculating arbitrary steering angles.

```text
current lane -> target lane -> smooth interpolation -> locked target
```

---

## 11. Traffic Architecture

Traffic must be managed by a dedicated manager.

```text
TrafficSpawner
      |
      v
TrafficPool
      |
      v
TrafficVehicle[]
      |
      +--> update
      +--> collision bounds
      +--> recycle
```

Use object pooling for repeated car creation/destruction.

Traffic spawning should be deterministic enough for debugging when a fixed/random seed is supplied in development/test contexts.

---

## 12. Collision Architecture

Collision checks should be centralized.

```text
CollisionSystem
   |
   +--> player collider
   +--> traffic colliders
   +--> road/world hazards later
   +--> near-miss detector later
```

Gameplay objects should expose collision bounds through a small interface rather than leaking Three.js geometry details everywhere.

Example:

```ts
export interface Collider {
  getBounds(): BoundingVolume;
}
```

---

## 13. Rendering Architecture

Three.js should be treated as an engine implementation dependency, not a cross-project data model.

Keep these responsibilities separate:

- Scene creation.
- Mesh lifecycle.
- Materials.
- Lights.
- Camera.
- Post-processing.
- Render loop.

Gameplay systems should not be responsible for global renderer configuration.

Example:

```text
PlayerController
     |
     v
Player state
     |
     v
PlayerView / renderer binding
     |
     v
Three.js mesh
```

This separation makes later renderer changes easier.

---

## 14. Asset Architecture

Assets should be loaded through an `AssetManager` or equivalent boundary.

Required principles:

- Centralized asset paths.
- Reusable caches.
- Explicit loading/error states.
- Disposal for assets that are no longer needed.
- No scattered hard-coded URLs inside gameplay systems.

Prefer a small number of reusable assets in MVP.

---

## 15. State Synchronization with React

React should not re-render at frame rate.

Bad pattern:

```text
requestAnimationFrame -> setState(...) -> React render -> repeat
```

Preferred pattern:

```text
Game Engine
   |
   +--> internal high-frequency state
   |
   +--> periodic/public snapshots/events
                         |
                         v
                       React
```

HUD values can be synchronized at a controlled frequency when visually sufficient.

---

## 16. Events

Cross-boundary events should be typed.

Examples:

```ts
export type GameEvent =
  | { type: 'game.started' }
  | { type: 'game.paused' }
  | { type: 'game.over'; score: number }
  | { type: 'player.crashed' }
  | { type: 'score.changed'; score: number };
```

Use discriminated unions instead of loosely typed event payloads.

---

## 17. Error Handling

The engine must fail predictably.

Examples:

- Asset load failure -> show controlled loading/error state.
- Invalid configuration -> reject during initialization with a typed/explicit error.
- Missing canvas/context -> initialization failure rather than undefined behavior.
- Runtime subsystem failure -> stop affected behavior and expose a diagnostic path where feasible.

Do not silently swallow errors.

---

## 18. Testing Architecture

### Unit tests

Target:

- Lane calculations.
- Speed calculations.
- Difficulty scaling.
- Spawn rules.
- Collision calculations.
- Score calculations.
- State transitions.

### Integration tests

Target:

- Engine initialization.
- Start/pause/resume/restart lifecycle.
- Input-to-player behavior.
- Traffic lifecycle.
- Crash/game-over flow.

### Browser/E2E tests

Target:

- Page loads.
- Game initializes.
- Controls work.
- Restart works.
- No major console errors.

---

## 19. Performance Boundaries

The following must not happen per frame unless profiling demonstrates that the cost is acceptable:

- Large array allocations.
- Large object creation/destruction batches.
- DOM queries.
- React state updates.
- Network requests.
- Full-scene traversal for avoidable work.
- Recompiling/recreating materials.

Object pooling and cached references should be preferred.

---

## 20. Deployment Model

The deployed product is the Next.js web application, while the game engine is bundled as part of the client application.

The engine remains independently testable and buildable as a package.

This allows:

```text
Standalone engine tests
        +
Next.js integration
        +
Browser QA
```

without coupling gameplay code to server-side execution.

---

## 21. Server/Client Boundary

The game engine is browser-only.

Do not execute Three.js rendering or DOM/canvas-dependent engine initialization in Next.js server components.

Use a client-side boundary for game initialization.

Conceptually:

```tsx
'use client';
```

The game route itself may be a server-rendered shell, but engine initialization must happen only after a browser canvas exists.
