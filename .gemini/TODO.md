# NEON RUSH â€” Development TODO

This document is the execution roadmap. Complete phases in order unless a dependency requires a deliberate deviation.

---

# Phase 0 â€” Project Foundation

## Goal

Create the monorepo/workspace and enforce engineering standards before gameplay implementation.

### Tasks

- [x] Initialize repository/workspace.
- [x] Create `apps/web` Next.js application.
- [x] Create `packages/game-engine` package.
- [x] Create `packages/game-contracts` package if shared contracts are needed.
- [x] Configure TypeScript strict mode.
- [x] Configure ESLint.
- [x] Enable `@typescript-eslint/no-explicit-any` as an error.
- [x] Add explicit-return-type linting for public APIs where appropriate.
- [x] Configure formatting.
- [x] Configure unit-test framework.
- [x] Configure browser/E2E test framework.
- [x] Add typecheck/lint/test scripts.
- [x] Add dependency audit/security scripts.
- [x] Add the four project specification files.
- [x] Confirm game engine has no dependency on Next.js or React.

### Exit criteria

```text
Web builds.
Engine builds.
Typecheck passes.
Lint passes.
No `any` usage.
Workspace dependencies are correct.
```

---

# Phase 1 â€” Game Engine Bootstrap

## Goal

Create a standalone game runtime that can initialize against a browser canvas.

### Tasks

- [x] Create `GameEngine` public API.
- [x] Create game runtime lifecycle.
- [x] Add renderer abstraction.
- [x] Initialize Three.js renderer.
- [x] Initialize scene.
- [x] Initialize camera.
- [x] Add resize handling.
- [x] Add controlled animation loop.
- [x] Add delta-time clamping.
- [x] Add explicit game states.
- [x] Add initialization and destruction lifecycle.

### Exit criteria

A blank 3D scene launches and shuts down cleanly through the engine API.

---

# Phase 2 â€” Next.js Game Host

## Goal

Embed the standalone engine into the Next.js application without coupling the engine to React.

### Tasks

- [x] Create game route/page.
- [x] Create client-only `GameCanvas` host.
- [x] Create game loading state.
- [x] Create game initialization boundary.
- [x] Handle initialization failure.
- [x] Handle cleanup on route unmount.
- [x] Ensure React does not own frame-by-frame game state.
- [x] Add basic game-shell UI.

### Exit criteria

The Next.js game page starts and destroys the standalone engine correctly.

---

# Phase 3 â€” Road and Lane System

## Goal

Create a reusable four-lane endless highway.

### Tasks

- [x] Define typed lane configuration.
- [x] Create four lane positions.
- [x] Create road segment abstraction.
- [x] Create recyclable road segments.
- [x] Add lane markings.
- [x] Add road boundaries/barriers.
- [x] Add forward movement illusion.
- [x] Recycle segments behind the player.
- [x] Prevent visible seams/gaps.

### Exit criteria

The player can visually move through an apparently endless four-lane road.

---

# Phase 4 â€” Player Vehicle and Controls

## Goal

Implement the primary player interaction model.

### Tasks

- [x] Add player vehicle model/prototype.
- [x] Add player controller.
- [x] Implement W acceleration.
- [x] Implement S brake/deceleration.
- [x] Implement A lane-left request.
- [x] Implement D lane-right request.
- [x] Add smooth lane transitions.
- [x] Clamp lane index.
- [x] Prevent lane skipping during an active transition.
- [x] Handle focus loss safely.
- [x] Add basic camera follow behavior.

### Exit criteria

A player can drive and move cleanly between all four lanes with W/S/A/D.

---

# Phase 5 â€” Traffic System

## Goal

Create incoming traffic with scalable spawning.

### Tasks

- [x] Create traffic vehicle abstraction.
- [x] Create traffic pool.
- [x] Create traffic spawner.
- [x] Spawn vehicles ahead of the player.
- [x] Assign lanes.
- [x] Assign traffic speed profiles.
- [x] Recycle vehicles after passing the player.
- [x] Add spawn safety rules.
- [x] Add development/debug seed support where useful.

### Exit criteria

Traffic appears reliably, looks varied enough for gameplay, and does not cause uncontrolled object growth.

---

# Phase 6 â€” Collision and Game State

## Goal

Create a reliable crash/game-over loop.

### Tasks

- [x] Create player collider.
- [x] Create traffic colliders.
- [x] Implement collision system.
- [x] Trigger crash state.
- [x] Stop gameplay progression on crash.
- [x] Create game-over state.
- [x] Add restart flow.
- [x] Reset traffic/player/world state correctly.
- [x] Add collision tests.

### Exit criteria

Player collision consistently results in a clean game-over and restart cycle.

---

# Phase 7 â€” Score and Difficulty

## Goal

Turn the prototype into a complete endless-game loop.

### Tasks

- [x] Add distance tracking.
- [x] Add score system.
- [x] Add overtaking/successful avoidance scoring where defined.
- [x] Add difficulty configuration.
- [x] Increase traffic density over progression.
- [x] Increase traffic speed range over progression.
- [x] Tune max player speed.
- [x] Add difficulty progression tests.

### Exit criteria

The game gets meaningfully harder as the run continues and score is consistent.

---

# Phase 8 â€” Core HUD and Menus

## Goal

Create the first polished user experience around the game.

### Tasks

- [x] Main menu.
- [x] Start game action.
- [x] Countdown.
- [x] HUD.
- [x] Speed display.
- [x] Distance display.
- [x] Score display.
- [x] Pause menu.
- [x] Game-over panel.
- [x] Restart button.
- [x] Keyboard instructions.
- [x] Accessible focus states.

### Exit criteria

A new user can start, understand controls, play, pause, crash, see results, and restart without developer knowledge.

---

# Phase 9 â€” Neon Rush Visual Identity

## Goal

Upgrade the environment from prototype geometry to a distinctive visual style.

### Tasks

- [x] Replace placeholder road materials.
- [x] Build neon lighting system.
- [x] Build emissive signage.
- [x] Add city buildings.
- [x] Add environment segment recycling.
- [x] Add fog/atmosphere.
- [x] Add bloom/post-processing.
- [x] Add road reflections/wet-road cues if performance permits.
- [x] Add street lights.
- [x] Add distant city lights.
- [x] Tune exposure/lighting so buildings remain readable.
- [x] Establish reusable material conventions.

### Exit criteria

The game visually reads as NEON RUSH rather than a generic 3D prototype.

---

# Phase 10 â€” Audio and Feedback

## Goal

Improve game feel and reinforce player actions.

### Tasks

- [ ] Engine audio.
- [ ] Speed-dependent engine pitch.
- [ ] Brake feedback.
- [ ] Lane-change feedback.
- [ ] Collision sound.
- [ ] UI sound.
- [x] Countdown.sound.
- [ ] Background music.
- [ ] Audio mute/volume settings.

### Exit criteria

Core gameplay actions have clear audio feedback and audio can be disabled/adjusted.

---

# Phase 11 â€” Game Feel and Advanced Mechanics

## Goal

Increase replayability without changing the core control model.

### Tasks

- [ ] Near-miss detection.
- [ ] Near-miss scoring.
- [ ] Combo system.
- [ ] High-speed bonus.
- [ ] Better traffic patterns.
- [ ] Controlled challenge encounters.
- [ ] Camera shake on major impacts.
- [ ] Speed-line/visual speed effects.

### Exit criteria

Experienced players are rewarded for riskier, more precise driving.

---

# Phase 12 â€” Content Expansion

## Goal

Expand the game beyond the first endless highway implementation.

### Tasks

- [ ] Additional vehicle archetypes.
- [ ] Additional player cars.
- [ ] Car selection.
- [ ] Multiple environments/cities.
- [ ] Time Attack mode.
- [ ] Traffic Rush mode.
- [ ] Challenge missions.
- [ ] Achievement framework.

### Exit criteria

The engine supports multiple content types without duplicating core systems.

---

# Phase 13 â€” Platform Features

## Goal

Introduce online/player platform functionality safely.

### Tasks

- [ ] Authentication architecture.
- [ ] Server-side score validation.
- [ ] Leaderboard API.
- [ ] Rate limiting.
- [ ] Abuse/cheat detection strategy.
- [ ] Secure account/session handling.
- [ ] User profile.
- [ ] Cloud save where needed.

### Security gate

Do not launch competitive ranking or valuable rewards until server-side trust boundaries are implemented.

---

# Phase 14 â€” Mobile and Input Expansion

## Goal

Extend the control layer without altering desktop behavior.

### Tasks

- [x] Touch controls.
- [x] Swipe lane switching.
- [x] Mobile brake control.
- [x] Optional virtual controls.
- [x] Gamepad support.
- [x] Responsive HUD.
- [x] Device capability detection.

---

# Phase 15 â€” Optimization and Hardening

## Goal

Prepare the game for public use.

### Tasks

- [ ] Profile frame time.
- [ ] Profile memory allocations.
- [ ] Profile GPU usage.
- [ ] Verify object pooling.
- [ ] Optimize environment rendering.
- [ ] Optimize materials/textures.
- [ ] Verify asset disposal.
- [ ] Verify no frame-loop leaks.
- [ ] Reduce initial bundle cost where practical.
- [ ] Add performance diagnostics for development.
- [ ] Run dependency/security audit.
- [ ] Run browser compatibility matrix.

### Exit criteria

No known high-severity performance, security, type-safety, or lifecycle defects remain for the target release.

---

# Phase 16 â€” Release

## Goal

Ship the first public version of NEON RUSH.

### Tasks

- [ ] Production build.
- [ ] Production environment configuration.
- [ ] Error monitoring.
- [ ] Analytics only where justified and privacy-compliant.
- [ ] Final smoke tests.
- [ ] Final security review.
- [ ] Final performance review.
- [ ] Landing page polish.
- [ ] Release notes.
- [ ] Deployment.
- [ ] Post-release issue triage.

### Release checklist

```text
[ ] Build passes
[ ] Typecheck passes
[ ] Lint passes
[ ] Unit tests pass
[ ] E2E/smoke tests pass
[ ] Security audit reviewed
[ ] No `any`
[ ] Public APIs have explicit return types
[ ] Game engine remains framework-independent
[ ] Browser gameplay verified
[ ] Production error monitoring configured
```

---

# Backlog â€” Ideas Not Yet Committed

Keep these out of the active phase plan until explicitly prioritized:

- [ ] Nitro/boost system.
- [ ] Police chase.
- [ ] Boss traffic encounters.
- [ ] Weather variations.
- [ ] Dynamic day/night progression.
- [ ] Replay/highlight system.
- [ ] Ghost runs.
- [ ] Seasonal events.
- [ ] Social sharing.
- [ ] Advanced telemetry.









