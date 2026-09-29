# NEON RUSH — Development Rules

These rules are mandatory unless a rule is explicitly amended in architecture/review documentation.

---

## 1. TypeScript Strictness

### Mandatory

- TypeScript strict mode must be enabled.
- **Do not use `any`.**
- Do not introduce `@ts-ignore` without a documented, reviewed reason.
- Do not introduce `@ts-nocheck`.
- Prefer precise domain types and discriminated unions.
- Avoid unsafe casts.
- Use `unknown` when input is genuinely unknown, then narrow it safely.
- Public functions, classes, and module APIs must have explicit return types.

Example:

```ts
export function calculateTargetSpeed(
  currentSpeed: number,
  acceleration: number,
  deltaSeconds: number,
): number {
  return currentSpeed + acceleration * deltaSeconds;
}
```

Avoid:

```ts
export function calculateTargetSpeed(currentSpeed: number, acceleration: number) {
  // implicit return type
}
```

---

## 2. No `any` Rule

The string `any` should not appear in production TypeScript type positions.

Not allowed:

```ts
const vehicle: any = data;
```

Not allowed as a workaround:

```ts
const value = data as any;
```

Preferred:

```ts
const vehicle: TrafficVehicle = parseTrafficVehicle(data);
```

For external/untrusted data:

```ts
const value: unknown = externalData;
```

Then validate/narrow it.

A lint rule should enforce this automatically.

Recommended ESLint rule:

```text
@typescript-eslint/no-explicit-any
```

Configure it as an error.

---

## 3. Return Types

Every exported function/method should declare its return type.

Examples:

```ts
export function createTrafficVehicle(config: TrafficConfig): TrafficVehicle {
  // ...
}
```

```ts
export class TrafficManager {
  public update(deltaSeconds: number): void {
    // ...
  }
}
```

For internal functions, explicit return types are strongly preferred and may be enforced by linting where practical.

Do not rely on implicit return types for public APIs.

---

## 4. Nullability and Undefined

Strict null checks remain enabled.

Do not hide missing values with non-null assertions unless the invariant is guaranteed and documented.

Avoid:

```ts
const player = players.find(... )!;
```

Prefer:

```ts
const player: Player | undefined = players.find(...);

if (player === undefined) {
  return;
}
```

---

## 5. Constants and Configuration

Do not scatter gameplay values throughout the codebase.

Bad:

```ts
speed += 0.17;
if (distance > 1250) {
  // ...
}
```

Preferred:

```ts
speed += GAME_CONFIG.physics.accelerationPerSecond;
if (distance > DIFFICULTY_CONFIG.mediumDistanceMeters) {
  // ...
}
```

All tunable gameplay values belong in typed configuration modules.

---

## 6. Separation of Concerns

### Next.js/React

Owns:

- HTML UI.
- Pages/routes.
- Web platform integrations.
- Settings forms.
- Authentication/API boundaries.

### Game engine

Owns:

- Input interpretation.
- Game loop.
- Simulation.
- Traffic.
- Player movement.
- Collision.
- Game state.
- Rendering integration.
- Audio integration.

React must not contain gameplay logic.

The engine must not import React or Next.js.

---

## 7. React Performance Rule

Do not use React state as a frame-by-frame game-state store.

Never do this inside `requestAnimationFrame`:

```ts
setSpeed(currentSpeed);
setScore(score);
setDistance(distance);
```

Expose controlled snapshots/events instead.

---

## 8. Game Loop Rules

The main loop must remain predictable.

Do not:

- Perform network requests in the frame loop.
- Allocate large temporary collections each frame.
- Create/destroy repeated traffic meshes unnecessarily.
- Add event listeners every frame.
- Trigger React renders every frame.

Delta time must be validated/clamped.

---

## 9. Input Rules

Input listeners must be owned by the `InputManager` or a clearly defined input layer.

Do not attach independent `keydown` handlers throughout gameplay classes.

Keyboard actions must be normalized into game actions.

A/D lane switching must respect lane boundaries and transition state.

---

## 10. Object Pooling

Objects that are repeatedly spawned and removed should be pooled when practical.

Examples:

- Traffic cars.
- Road segments.
- Buildings.
- Particles.
- Reusable effects.

The pool must expose clear lifecycle operations such as:

```ts
acquire(): PooledObject;
release(object: PooledObject): void;
```

Do not hide object lifetime rules inside unrelated systems.

---

## 11. Three.js Rules

- Dispose of geometries, materials, textures, render targets, and other GPU resources when their ownership ends.
- Reuse materials where possible.
- Avoid recreating materials or geometries every frame.
- Keep renderer configuration centralized.
- Keep scene traversal costs intentional.
- Prefer instancing/reuse for repeated static environment assets where it materially improves performance.

---

## 12. Security Rules

Security is required even though the game is client-side.

### Never trust client state

A future leaderboard, rewards, XP, currency, or achievement backend must treat client-submitted values as untrusted.

The client must never be the sole authority for:

- Scores.
- Currency.
- Rewards.
- Unlocks.
- Rankings.
- Account permissions.

Server-side validation must exist before competitive or valuable systems are enabled.

### Input validation

All API inputs must be validated server-side.

Do not assume TypeScript types are runtime validation.

Use runtime schemas at API boundaries where appropriate.

### Secrets

Never put secrets in the browser bundle.

Do not store API keys, private credentials, signing secrets, or database credentials in `NEXT_PUBLIC_*` variables.

### XSS

- Avoid `dangerouslySetInnerHTML` unless there is a compelling and reviewed reason.
- Sanitize untrusted HTML when HTML rendering is unavoidable.
- Treat usernames, chat, leaderboard metadata, and external content as untrusted.

### URLs and external assets

Validate external URLs before using them in security-sensitive or server-side contexts.

Do not allow user-controlled values to become unrestricted script/resource URLs.

---

## 13. API Rules

When APIs are introduced:

- Validate request bodies.
- Validate query/path parameters.
- Authenticate protected routes.
- Authorize resources server-side.
- Rate-limit abuse-prone endpoints.
- Return safe error responses.
- Do not expose stack traces or secrets to clients.
- Use structured error types/responses.

The browser must not be trusted to enforce authorization.

---

## 14. Dependency Security

Before merging meaningful changes:

```text
Install/update dependencies
        |
        v
Typecheck
        |
        v
Lint
        |
        v
Unit tests
        |
        v
Security audit
        |
        v
Browser smoke test
```

Use the package manager's audit capabilities and dependency update tooling.

Do not blindly suppress vulnerability warnings. Document accepted risk where a known exception is unavoidable.

---

## 15. Error Handling Rules

Do not use empty catches.

Bad:

```ts
try {
  // ...
} catch {
}
```

Errors should be:

- Handled.
- Propagated.
- Logged appropriately.
- Converted into a controlled user-facing state when needed.

Do not expose sensitive internal details to end users.

---

## 16. Logging Rules

Development diagnostics may be verbose.

Production logging must:

- Avoid secrets.
- Avoid tokens/cookies.
- Avoid sensitive personal data.
- Avoid excessive per-frame logs.

Never log every frame.

Never use logging as a substitute for proper error handling.

---

## 17. Code Quality Rules

- Small, cohesive modules.
- Prefer one responsibility per class/module.
- Avoid giant files.
- Avoid circular dependencies.
- Prefer composition over deep inheritance.
- Use interfaces at architectural boundaries.
- Keep naming explicit.
- Avoid generic names such as `data`, `thing`, `temp`, `stuff` when a domain term exists.

---

## 18. Comments

Comments should explain **why**, not restate obvious code.

Bad:

```ts
// Increment lane
lane += 1;
```

Good:

```ts
// A/D input is rate-limited so browser key-repeat cannot skip multiple lanes.
```

---

## 19. Git Rules

Commits should be small and logically scoped.

Recommended prefixes:

```text
feat:
fix:
refactor:
perf:
test:
docs:
chore:
security:
```

Do not mix unrelated refactors with gameplay changes unless required.

---

## 20. Pull Request / Agent Review Checklist

Every significant implementation should answer:

```text
[ ] Does it pass typecheck?
[ ] Does it pass lint?
[ ] Does it introduce `any`?
[ ] Are exported return types explicit?
[ ] Are new runtime inputs validated?
[ ] Does it preserve engine/web separation?
[ ] Does it allocate unnecessarily per frame?
[ ] Does it leak Three.js resources?
[ ] Does it introduce a security issue?
[ ] Are tests updated?
[ ] Was browser behavior verified?
```

---

## 21. Antigravity Agent Rule

When an agent makes changes:

1. Read the relevant architecture and rules before editing.
2. Inspect existing code before creating new abstractions.
3. Make the smallest coherent change.
4. Run typecheck/lint/tests relevant to the change.
5. Fix failures rather than ignoring them.
6. Do not weaken TypeScript or linting rules to make a task pass.
7. Do not replace proper typing with `any` or broad casts.
8. Do not silently change product requirements.
9. Document architectural deviations.
10. Verify critical gameplay changes in a browser when possible.
