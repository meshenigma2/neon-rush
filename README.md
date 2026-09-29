# 🏎️ Neon Rush

![Neon Rush Gameplay Banner](https://img.shields.io/badge/Status-In_Development-brightgreen.svg)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Three.js%20%7C%20TypeScript-blue)

**Neon Rush** is a high-speed, endless arcade racer built entirely for the web. Rendered in full 3D directly in the browser, players must weave through increasingly dense traffic, rack up distance scores, and survive as long as possible on an endless, procedurally generated desert highway at sunset.

## ✨ Features

- **Blazing Fast 3D Engine:** Custom-built game engine utilizing Three.js for lightweight, buttery-smooth 60 FPS rendering in the browser.
- **Procedural World Generation:** Endless highway generation featuring massive sunset lighting, procedurally scattered pine trees, and massive glowing neon billboards.
- **Dynamic Difficulty System:** Traffic spawns faster and denser as your score increases, introducing severe hazards at high milestones.
- **Nitro System:** Hold SPACE to push the car to a blistering 400 KM/H and rack up massive score multipliers.
- **Cross-Platform Inputs:** Fully playable via Keyboard (WASD), Gamepads (Xbox/PlayStation controllers), and Mobile Touchscreens (split-screen tap-to-steer/accelerate and swiping).
- **React UI Overlay:** A sleek, fully decoupled HUD built in React/TailwindCSS that tracks speed, score, and distance without blocking the physics loop.

## 🏗️ Architecture

Neon Rush is structured as a modern **pnpm monorepo** to strictly separate the React UI from the core game engine logic:

- pps/web: The Next.js 15 application. Handles routing, hosting the <canvas>, and rendering the React-based HUD (GameOverlay).
- packages/game-engine: A framework-agnostic, pure TypeScript game engine containing the rendering loop, 3D meshes, collision detection, and physics.
- packages/game-contracts: Shared TypeScript types and state interfaces defining the boundary between the engine and the UI.

## 🚀 Quick Start

Ensure you have [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed.

1. **Clone the repository:**
   `ash
   git clone https://github.com/meshenigma2/neon-rush.git
   cd neon-rush
   `

2. **Install dependencies:**
   `ash
   pnpm install
   `

3. **Start the development server:**
   `ash
   pnpm dev
   `

4. **Play the game:**
   Open your browser and navigate to http://localhost:3000.

## 🎮 Controls

| Action | Keyboard | Gamepad | Mobile (Touch) |
|--------|----------|---------|----------------|
| **Accelerate** | W / Up Arrow | RT / A | Tap & Hold Right Half |
| **Brake** | S / Down Arrow | LT / X | Tap & Hold Left Half |
| **Steer** | A / D | Left Stick / D-Pad | Swipe Left / Right |
| **Nitro Boost** | Spacebar | Y / RB | Swipe Up |

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **3D Graphics:** Three.js
- **Styling:** Tailwind CSS
- **Package Manager:** pnpm
