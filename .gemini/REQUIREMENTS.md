# NEON RUSH — Requirements

## 1. Product Overview

**NEON RUSH** is a browser-based 3D arcade traffic-dodging racing game.

The web application and the game runtime are separate concerns:

- **Web App:** Next.js application responsible for landing pages, game shell, UI, navigation, settings, account/leaderboard integrations, and platform concerns.
- **Game Engine:** Standalone TypeScript game package responsible for the real-time game loop, rendering, input, vehicles, traffic, world simulation, collision, scoring, difficulty, and gameplay state.

The game should feel fast, responsive, visually polished, and easy to understand within seconds.

---

## 2. Goals

### Primary goals

1. Deliver a playable 3D endless highway racing experience in the browser.
2. Keep game-engine code independent from Next.js and React.
3. Support keyboard controls with deterministic lane-based movement.
4. Make the core gameplay loop immediately understandable.
5. Keep the architecture modular so new game modes, vehicles, environments, and systems can be added without rewriting the engine.
6. Prioritize browser performance and predictable memory usage.
7. Maintain strict TypeScript quality and defensive runtime behavior.

### Non-goals for MVP

- Full racing simulation physics.
- Multiplayer gameplay.
- Vehicle customization economy.
- Large open-world exploration.
- Mobile-first controls.
- User-generated content.

---

## 3. Target Platform

### MVP

- Modern desktop browsers.
- Chromium, Firefox, and Safari should be considered during QA.
- Keyboard input is required.
- WebGL-capable hardware is required for the 3D game runtime.

### Future

- Mobile touch controls.
- Gamepad support.
- Additional browsers/devices based on telemetry and QA results.

---

## 4. Core Gameplay

The player drives forward on a four-lane highway while avoiding incoming traffic.

### Controls

| Input | Action |
|---|---|
| `W` | Accelerate |
| `S` | Brake / decelerate |
| `A` | Switch one lane left |
| `D` | Switch one lane right |
| `Esc` | Pause / resume |
| `Enter` | Confirm selected UI action where applicable |

### Lane behavior

- The road has exactly four logical lanes in the MVP.
- `A` moves the player one lane left.
- `D` moves the player one lane right.
- Lane switching is smooth rather than instantaneous.
- Repeated input must not push the player beyond the leftmost or rightmost lane.
- The player must remain aligned to the target lane after the transition completes.

### Speed behavior

The player continuously moves forward through the world simulation.

The engine must model at least:

- Current speed.
- Target speed.
- Acceleration.
- Brake/deceleration force.
- Minimum speed.
- Maximum speed.

The exact values are configuration, not hard-coded across gameplay systems.

---

## 5. Traffic Requirements

Traffic is spawned ahead of the player and travels relative to the player/world simulation.

Each traffic vehicle should have at least:

- Unique runtime identifier.
- Lane index.
- Position.
- Speed.
- Vehicle archetype.
- Active/inactive state for pooling.

Traffic requirements:

1. Vehicles spawn ahead of the player within configurable distance bands.
2. Vehicles may use different speed profiles.
3. Traffic density increases as progression increases.
4. Vehicles behind the player can be recycled using object pooling.
5. Spawn logic must avoid impossible patterns in the MVP.
6. Traffic must never spawn directly overlapping the player.

---

## 6. Collision Requirements

The engine must detect collisions between the player and traffic vehicles.

MVP collision behavior:

```text
Collision detected
    -> crash state
    -> stop active gameplay progression
    -> show game-over state
```

Collision detection should use lightweight primitive colliders or bounding volumes unless profiling proves a more complex approach is necessary.

### Near-miss behavior

Near-miss detection is a post-MVP requirement but should be designed into the collision system boundary so it can be enabled without redesigning the API.

---

## 7. Progression and Scoring

### MVP score inputs

- Distance traveled.
- Successful traffic avoidance / overtaking.

### Post-MVP score inputs

- Near misses.
- Combo multipliers.
- Sustained high-speed driving.
- Challenge objectives.

### Difficulty scaling

Difficulty must be data/configuration driven.

Progression may adjust:

- Traffic spawn frequency.
- Traffic speed range.
- Traffic pattern complexity.
- Maximum player speed.
- Safe-gap distribution.

The engine must not make difficulty changes by scattering magic numbers through gameplay code.

---

## 8. Game States

The runtime must support an explicit state model.

Required MVP states:

```text
MENU
COUNTDOWN
PLAYING
PAUSED
CRASHED
GAME_OVER
```

The state model must prevent systems from performing invalid actions in incompatible states.

Example: traffic spawning must not continue while the game is paused or after game over.

---

## 9. World and Rendering Requirements

### Environment

MVP environment:

- Four-lane highway.
- Dark futuristic city.
- Neon accents.
- Roadside structures.
- Repeating/recyclable environment segments.
- Fog/atmospheric depth.

### Visual direction

The visual goal is a premium neon arcade look, not a photorealistic racing simulator.

The scene should use a deliberate lighting/material pipeline including, where appropriate:

- Physically based materials.
- Emissive surfaces for neon elements.
- Controlled light sources.
- Bloom/post-processing.
- Atmospheric fog.
- Wet-road or reflective cues where performance permits.

Black materials must not be used as a substitute for lighting design. Buildings should remain readable in the environment.

---

## 10. Web App Requirements

The Next.js application is the host/platform layer, not the game engine.

### Web responsibilities

- Application routing.
- Landing/home page.
- Game page and game-shell layout.
- Game loading screen.
- Game UI overlays.
- Settings/preferences UI.
- Error boundaries and recoverable failure states.
- Static content.
- Future authentication integration.
- Future leaderboard/API integration.

### Engine integration

The Next.js layer must communicate with the game engine through an explicit public API.

React components must not directly mutate engine internals.

Recommended integration boundary:

```text
Next.js / React UI
        |
        v
Game Host / Adapter
        |
        v
Game Engine Public API
        |
        v
Game Systems / Renderer / World
```

---

## 11. Performance Requirements

The game must prioritize stable frame pacing over visual excess.

Required practices:

- Reuse objects where practical.
- Pool frequently spawned entities.
- Avoid unnecessary allocations in the game loop.
- Avoid React state updates every frame.
- Keep real-time engine state outside React render cycles.
- Dispose of GPU resources when scenes/assets are no longer needed.
- Profile before introducing expensive effects.

The target should be a smooth experience on typical modern desktop hardware rather than a maximum-detail showcase.

---

## 12. Accessibility and UX

The surrounding web app should provide:

- Visible keyboard-control instructions.
- Clear start/pause/restart actions.
- Sufficient text contrast.
- A non-color-only indication for important states.
- Focus-visible behavior for interactive HTML controls.

The WebGL canvas should not be the only way to understand the application state.

---

## 13. Future Features

These should remain outside MVP unless explicitly promoted into scope:

- Near-miss bonuses.
- Combo system.
- Nitro/boost.
- Multiple cars.
- Car upgrades.
- Skins.
- Multiple environments/cities.
- Time Attack mode.
- Traffic Rush mode.
- Daily challenges.
- Achievements.
- Leaderboards.
- Accounts.
- Cloud save.
- Mobile controls.
- Gamepad support.
- Analytics/telemetry.

---

## 14. Acceptance Criteria for MVP

A build is considered MVP-complete when:

1. The Next.js app can open the game page.
2. The game engine initializes independently from React.
3. A player car renders on a four-lane highway.
4. `W` accelerates.
5. `S` brakes/decelerates.
6. `A` switches one lane left.
7. `D` switches one lane right.
8. Traffic vehicles spawn ahead of the player.
9. Traffic is recyclable/poolable where appropriate.
10. Player/traffic collision triggers crash/game over.
11. Distance and score are displayed.
12. Restart creates a clean new run.
13. Pause prevents gameplay progression.
14. Resize/orientation of the browser does not corrupt rendering.
15. No TypeScript `any` is used.
16. Engine code is not coupled directly to React components.
17. Basic security and dependency checks pass.
18. The game runs without obvious console errors during the primary gameplay loop.
