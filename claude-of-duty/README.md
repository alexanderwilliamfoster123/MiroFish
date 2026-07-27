# Claude of Duty 🎯

A browser first-person shooter built entirely with **Three.js** and **WebGL2** —
a playable homage to [mshumer/Claude-of-Duty](https://github.com/mshumer/Claude-of-Duty).

Like the original, it uses **no art assets**. Every texture, mesh, weapon,
sound effect, and animation is **generated procedurally at runtime**. Three.js
(vendored under `vendor/`) is the only dependency.

![gameplay](https://img.shields.io/badge/engine-three.js%20r180-black) ![no assets](https://img.shields.io/badge/art%20assets-0-brightgreen)

## Play it — the easy way (no install, no server)

Open **[`claude-of-duty.html`](./claude-of-duty.html)** — it's the entire game
bundled into a single self-contained file (Three.js embedded and all). Just
**download it and double-click it** to open in your browser. No internet, no
Node, no server needed.

> Rebuild it after changing the source with: `node build-single-file.mjs`

Click **DEPLOY**, then click the game area to lock your mouse (`Esc` releases it).

## Play it — from source (developers)

The `src/` files use ES modules, which browsers refuse to load from `file://`,
so serve the folder over http:

```bash
npx serve claude-of-duty            # then open the printed URL
# or:  cd claude-of-duty && python3 -m http.server 8000
```

## Controls

| Input | Action |
|-------|--------|
| `W A S D` | Move |
| Mouse | Look / aim |
| Left click | Fire |
| Right click | Aim down sights |
| `R` | Reload |
| `Shift` | Sprint |
| `Ctrl` / `C` | Crouch |
| `Space` | Jump |
| `1` `2` `3` | Rifle / SMG / Pistol |
| Scroll | Cycle weapons |
| `Esc` | Pause |

## The game

Hold the procedural market district against **8 waves** of hostiles. Each wave
adds more — and tougher — enemies. Headshots deal 2.4× damage and score extra.
Clear a wave to get resupplied. Survive to the final assault.

## Subsystems

The original coordinates 11 AI-built subsystems. This version is organized the
same way, at a scale one context can hold:

| Module | Responsibility |
|--------|----------------|
| `src/world.js` | Procedural materials (canvas textures), buildings, cover, sky dome, lighting, AABB collision + ray tests |
| `src/player.js` | Pointer-lock FPS controller: movement, sprint/crouch/jump, headbob, capsule collision, health & regen |
| `src/weapons.js` | Procedural weapon viewmodels, ballistics, recoil, ADS, reload, 3 weapons |
| `src/enemies.js` | Procedural soldiers, steering + LOS, combat FSM, per-part hitboxes (headshots), topple death |
| `src/fx.js` | Pooled GPU particles: muzzle flash, tracers, impacts, blood, bullet-hole decals |
| `src/audio.js` | Fully synthesized audio via Web Audio API — gunfire, impacts, footsteps, UI, ambient bed |
| `src/hud.js` | DOM HUD: crosshair, health, ammo, killfeed, compass, wave banner, overlays |
| `src/game.js` | Orchestrator: renderer/scene/camera, game loop, hit resolution, wave & score state machine |
| `src/main.js` | Bootstrap, WebGL detection, menu wiring, error surface |

## Tech notes

- **Rendering:** Three.js r180, ACES filmic tonemapping, PCF soft shadows, exp²
  fog, a shader sky dome.
- **Textures:** every surface is a `CanvasTexture` drawn with the 2D canvas API
  (asphalt, brick, concrete, crate, metal) — no image files.
- **Physics:** custom cylinder-vs-AABB resolution for the player and enemies;
  slab ray/AABB tests for bullets and line-of-sight.
- **Audio:** oscillator + filtered-noise synthesis, a compressor on the master
  bus, and distance attenuation. Starts on first user gesture.

## Honest assessment

In the spirit of the original's honesty section: the hands are blocky, the
soldiers are boxy, and lighting is direct + hemisphere rather than true global
illumination. It's a compact, self-contained take — but it runs, it's
procedural, and it's genuinely fun to play.
