# Simple Spring — User Guide

**Simple Spring** is a Construct 3 behavior that applies spring physics to any numeric value. Attach it to an object, tell the spring where to go, and it handles the physics: the value accelerates toward the target, overshoots a little, bounces back, and settles — all with natural-feeling motion. Use it to drive positions, scales, angles, opacities, or any other numeric property without writing a single line of physics code.

---

## Table of Contents

1. [Core Concepts](#1-core-concepts)
2. [Project Setup](#2-project-setup)
3. [Behavior Properties](#3-behavior-properties)
4. [Springing a Value](#4-springing-a-value)
5. [Angle Springing](#5-angle-springing)
6. [Always Spring Mode](#6-always-spring-mode)
7. [Velocity Control](#7-velocity-control)
8. [Tuning the Spring Feel](#8-tuning-the-spring-feel)
9. [Actions Reference](#9-actions-reference)
10. [Conditions Reference](#10-conditions-reference)
11. [Triggers Reference](#11-triggers-reference)
12. [Expressions Reference](#12-expressions-reference)
13. [Game Use Cases](#13-game-use-cases)
14. [C3 Debugger](#14-c3-debugger)
15. [Tips and Common Mistakes](#15-tips-and-common-mistakes)

---

## 1. Core Concepts

### The problem this addon solves

Smooth, bouncy transitions are a cornerstone of good game feel, but implementing spring physics from scratch means managing velocity, stiffness, damping, deltatime accumulation, and fixed-step physics in every project — then re-tuning it each time. Simple Spring encapsulates all of that into a single behavior so you can go from "I need this sprite to bounce into position" to a working result in three actions.

### How a spring works

A **spring value** is a number that chases a **target** using simulated spring physics. Each frame, the spring applies a force proportional to the distance from the value to the target (controlled by **stiffness**), then bleeds off velocity (controlled by **damping**). The result is a value that overshoots slightly, oscillates, and settles — or snaps crisply to the target depending on your settings.

The physics run at a fixed 60 steps per second internally, then sub-step interpolation smooths the result between frames. This means the motion looks identical regardless of whether the game is running at 30 fps or 120 fps.

### Key concepts at a glance

| Term | What it means |
|---|---|
| **Value** | The current spring output — read this every frame to drive your object |
| **Target** (`To`) | Where the spring is heading |
| **From** | Where the spring started from |
| **Velocity** | The current speed of the spring value — carries over between calls |
| **Stiffness** | How aggressively the spring pulls toward the target. Higher = faster, snappier |
| **Damping** | How quickly oscillation dies out. Higher = less bounce, settles faster |
| **Precision** | Closeness threshold at which the spring declares itself "done" |

### Scenarios where this addon excels

- **UI pop-ins** — menus and panels that bounce into position when shown, and ease out when dismissed
- **Camera follow** — a camera that organically lags behind a fast-moving player and overshoots slightly on direction changes
- **Health bar and score counters** — numeric displays that spring to a new value rather than snapping instantly
- **Object squash and stretch** — scale a sprite's X and Y as springs for a reactive, rubbery feel on jump landings
- **Recoil and kickback** — add impulse velocity to a gun or tank barrel that bounces back after firing
- **Cursor and aim assist** — a crosshair or aim marker that lags behind the mouse with configurable stiffness
- **Always-following targets** — a companion, shadow, or indicator that continuously chases a changing position

---

## 2. Project Setup

### Installation

1. Download the `.c3addon` file from the release page.
2. In Construct 3, open the **Menu → View → Addon Manager**.
3. Click **Install new addon** and select the `.c3addon` file.
4. Restart Construct 3 if prompted.

### Adding to an object

1. Select any object on the layout (Sprite, TilemapLayer, Text, etc.).
2. In the **Behaviors** panel, click **Add behavior**.
3. Find **Simple Spring** and click **Add**.

The behavior is now attached. One behavior instance = one spring value. If you need to spring multiple independent values on the same object (e.g., both X position and scale), add the behavior multiple times — each instance tracks its own value independently.

### First working example — spring an object to a click position

```
Event: On left mouse click
  Action: Spring.SpringTo(Mouse.X, "Value")
  Action: [every tick] Sprite.X = Spring.Value
  Action: [every tick] Sprite.Y = Spring.Y   // add a second spring for Y
```

A more complete setup using `System > Every tick`:

```
Event: On left mouse click
  Action: SpringX -> Spring to  Mouse.X  (mode: Value)
  Action: SpringY -> Spring to  Mouse.Y  (mode: Value)

Event: Every tick
  Action: Sprite -> Set X to  SpringX.Value
  Action: Sprite -> Set Y to  SpringY.Value
```

This is the core loop: fire a spring action when something changes, then read `Value` every tick and apply it to whatever property you want to animate.

---

## 3. Behavior Properties

These appear in the Properties Bar when the behavior is selected. They set the **initial** values — you can override all of them at runtime with the corresponding Set actions.

| Property | Type | Default | Description |
|---|---|---|---|
| **Stiffness** | Float (≥ 0) | `1.25` | How quickly the spring responds. Higher values produce faster, snappier motion. |
| **Damping** | Float (0–1) | `0.9` | How much oscillation is suppressed each step. Values near 1 settle quickly with little bounce; lower values produce more oscillation. |
| **Precision** | Float (0.0001–1) | `0.01` | Distance from the target below which the spring considers itself settled. Smaller values let the spring run longer before stopping. |
| **Enabled** | Checkbox | `true` | Whether the spring ticks each frame. Disabled springs freeze in place. |

> **Stiffness and damping interact.** A high stiffness with a low damping produces very bouncy, fast motion. A low stiffness with a high damping produces a slow, sluggish drag. Most good-feeling springs live in the range of stiffness 0.1–0.3 and damping 0.7–0.95.

---

## 4. Springing a Value

There are three main actions for starting a spring:

### Spring To (from current value)

```
Action: Spring -> Spring to  targetValue  (mode: Value)
```

Springs from the **current spring value** toward `targetValue`. Velocity is preserved — if the spring is already moving, it keeps that momentum and redirects it toward the new target. This is the most common action. Use it whenever you want smooth transitions between states and don't need to control the start point.

### Spring From/To (explicit start)

```
Action: Spring -> Spring from 0 to 100
```

Resets the spring to `from` and begins moving toward `to`. Discards any existing velocity. Use this when you want a clean, predictable animation with a known start point — for example, showing a value from zero.

### Reading the value every tick

The spring output is always available via the `Value` expression. Apply it to whatever you want to animate:

```
Event: Every tick
  Action: Sprite -> Set X to  Spring.Value
```

Or drive opacity:

```
Event: Every tick
  Action: Sprite -> Set opacity to  Spring.Value
```

Or a Text object:

```
Event: Every tick
  Action: TextScore -> Set text to  int(Spring.Value)
```

### Monitoring progress

`Progress` returns a number from `0` (at the start value) to `1` (at the target). Use it to gate other events or blend effects:

```
Event: Spring.Progress > 0.5
  Action: Particles -> Set active
```

---

## 5. Angle Springing

Angles wrap at 360°, which means a naive spring from 350° to 10° would travel the long way around (340°) instead of the short way (20°). Simple Spring solves this automatically with two angle-aware modes.

### Spring To — Angle mode

```
Action: Spring -> Spring to  targetAngle  (mode: Angle)
```

Finds the shortest rotational path from the current value to the target. If the current value is 350 and the target is 10, the spring travels +20° rather than −340°.

### Spring From/To Angle

```
Action: Spring -> Spring angle from 350 to 10
```

Same shortest-path logic, but with an explicit start angle. Both `from` and `to` are normalized to 0–360 before the path is computed.

### Applying to object angle

```
Event: On pressed [rotate key]
  Action: Spring -> Spring to  targetAngle  (mode: Angle)

Event: Every tick
  Action: Sprite -> Set angle to  Spring.Value
```

---

## 6. Always Spring Mode

In **Always Spring** mode the spring never stops — it continuously chases a target that you update every tick. This is ideal for any situation where the goal is a moving or live-computed value: a camera following a character, a crosshair tracking the mouse, or a health indicator following the current HP.

### Enabling always spring

```
Action: Spring -> Set always spring to target  Enabled, target: Player.X, mode: Value
```

While always spring is active, the spring never fires `OnReachedTarget` and never stops ticking, regardless of how close the value is to the target.

### Updating the target without re-enabling

Once always spring is on, call `Set always spring target` each tick to move the goal:

```
Event: Every tick
  Action: Spring -> Set always spring target to  Player.X
  Action: CameraProxy -> Set X to  Spring.Value
```

### Disabling always spring

```
Action: Spring -> Set always spring to target  Disabled, target: 0, mode: Value
```

After disabling, the spring resumes normal behavior: it will animate toward the last target and fire `OnReachedTarget` when it settles.

### Always spring angle mode

```
Action: Spring -> Set always spring to target  Enabled, target: angleToPlayer, mode: Angle
```

The shortest-path logic applies continuously — perfect for a turret or character that smoothly rotates toward a moving enemy without spinning the wrong way.

---

## 7. Velocity Control

The velocity is the engine of the spring. Most of the time you let it manage itself, but direct velocity control lets you create impulses and physical reactions.

### Adding an impulse

`Add to velocity` injects energy into the spring immediately. The spring then decays it naturally via damping. Use this for recoil, knockback, or bouncing reactions:

```
Event: On bullet hit
  Action: RecoilSpring -> Add to velocity  -200
  // Negative velocity pushes the value downward
```

### Setting velocity directly

`Set velocity` overrides the current velocity. Use with caution — it discards all existing momentum:

```
Action: Spring -> Set velocity to  500
```

### Stopping cleanly

`Stop at current value` halts the spring immediately and keeps the current value. No settling animation, no `OnReachedTarget`:

```
Event: Player paused game
  Action: Spring -> Stop spring at current value
```

### Snapping to target

`Snap to target` instantly teleports the value to the target and stops:

```
Event: On layout start
  Action: Spring -> Snap to target
  // Avoids a boot-up animation the player never asked for
```

---

## 8. Tuning the Spring Feel

The character of the spring comes from three numbers. Here are named presets as a starting point:

| Feel | Stiffness | Damping | Notes |
|---|---|---|---|
| **Snappy UI** | 0.25 | 0.95 | Fast settle, very slight bounce — good for buttons and panels |
| **Bouncy** | 0.2 | 0.6 | Noticeable overshoot, several oscillations — good for cartoon objects |
| **Elastic** | 0.1 | 0.5 | Slow but very springy — use for hanging or stretchy objects |
| **Smooth drag** | 0.08 | 0.85 | Soft lag, minimal bounce — good for camera follow |
| **Instant** | 0.5 | 0.99 | Almost no animation — good for numbers and indicators |
| **Heavy** | 0.05 | 0.9 | Slow response, settles smoothly — good for large or heavy-feeling objects |

### How stiffness and damping interact

- Think of **stiffness** as how strong the spring is — a high-stiffness spring accelerates fast.
- Think of **damping** as how much friction the spring has — a high-damping spring bleeds velocity quickly and doesn't oscillate much.
- Low damping (< 0.6) with high stiffness produces very fast, very bouncy motion that can feel chaotic.
- Low stiffness with high damping produces a slow, overdamped drag that never really bounces.

### Changing settings at runtime

```
Event: Player enters "precise aiming" mode
  Action: AimSpring -> Set stiffness to  0.05
  Action: AimSpring -> Set damping to  0.95
  // Slower, tighter spring while aiming
```

---

## 9. Actions Reference

### Spring

| Action | Description |
|---|---|
| **Spring to** `value` (mode: Value/Angle) | Spring from the current value toward a new target. Preserves velocity. Angle mode takes the shortest rotational path. |
| **Spring from** `from` **to** `to` | Reset to `from` and spring toward `to`. Discards current velocity. Use for explicit from-to animations. |
| **Spring angle from** `from` **to** `to` | Same as Spring from/to but normalizes both angles to 0–360 and takes the shortest rotational path. |
| **Set always spring to target** `enabled/disabled`, `target`, mode: Value/Angle | Enable or disable always-spring mode and set its target and mode. When enabled the spring never stops. |
| **Set always spring target to** `value` | Update the target for an active always-spring without changing enabled state or mode. |
| **Set enabled** `enabled/disabled` | Enable or disable the behavior. Disabled springs freeze entirely — no ticking, no updates. |
| **Set stiffness to** `value` | Override stiffness at runtime (0–1). |
| **Set damping to** `value` | Override damping at runtime (0–1). |
| **Set precision to** `value` | Override precision threshold at runtime. |
| **Stop spring at current value** | Immediately halt the spring and hold at the current value. Does not fire `OnReachedTarget`. |
| **Snap to target** | Instantly move the value to the target and stop. |
| **Set velocity to** `value` | Directly set the spring velocity, overwriting current momentum. Starts animating if stopped. |
| **Add** `value` **to velocity** | Add an impulse to the current velocity. Use for recoil, hits, or physical reactions. |

---

## 10. Conditions Reference

| Condition | Description |
|---|---|
| **Is animating** | True while the spring is moving. False once it has settled or been stopped. Can be inverted. |
| **Is enabled** | True if the behavior is currently enabled. Can be inverted. |
| **Has reached target** | True after the spring has settled at its target (not animating, within precision). Can be inverted. |

---

## 11. Triggers Reference

| Trigger | Description |
|---|---|
| **On started** | Fires once when a spring begins a new animation — when `Spring to`, `Spring from/to`, or `Spring angle from/to` starts a previously idle spring. |
| **On reached target** | Fires once when the spring settles at its target (distance and velocity both within precision). Does not fire in always-spring mode. |

---

## 12. Expressions Reference

All expressions return a **number**.

| Expression | Returns | Description |
|---|---|---|
| `Value` | number | The current spring output. Read this every tick to drive your object's property. |
| `Progress` | 0.0 – 1.0 | How far along the animation is. 0 = at the start, 1 = at the target. |
| `From` | number | The value the spring started from for the current animation. |
| `To` | number | The current target the spring is heading toward. |
| `Velocity` | number | The spring's current velocity. Positive = moving toward higher values. |
| `Stiffness` | number | The active stiffness setting. |
| `Damping` | number | The active damping setting. |
| `Precision` | number | The active precision threshold. |

---

## 13. Game Use Cases

---

### 1. Button pop-in on menu open

**Scenario:** A menu panel slides in from off-screen and settles into position with a bounce.

```
Event: On "MenuOpen" signal received
  Action: PanelSpring -> Spring from  -800  to  0
  // Panel starts 800px above and springs into position

Event: Every tick
  Action: MenuPanel -> Set Y to  PanelSpring.Value
```

---

### 2. Camera follow with lag

**Scenario:** A top-down camera smoothly follows the player but lags slightly for feel.

```
Event: On start of layout
  Action: CamX -> Set always spring to target  Enabled, target: Player.X, mode: Value
  Action: CamY -> Set always spring to target  Enabled, target: Player.Y, mode: Value
  // Stiffness: 0.08, Damping: 0.85 set in Properties Bar

Event: Every tick
  Action: CamX -> Set always spring target to  Player.X
  Action: CamY -> Set always spring target to  Player.Y
  Action: System -> Set scroll to position  CamX.Value, CamY.Value
```

---

### 3. Score counter that springs to a new value

**Scenario:** The player's displayed score animates to the real score whenever it changes.

```
Event: Variable "Score" changed
  Action: ScoreSpring -> Spring to  Score  (mode: Value)
  // Stiffness: 0.15, Damping: 0.9

Event: Every tick
  Action: TextScore -> Set text to  int(ScoreSpring.Value)
```

---

### 4. Recoil spring on gun firing

**Scenario:** A gun sprite kicks back when fired and springs back naturally.

```
Event: On "Fire" pressed
  Action: RecoilSpring -> Add to velocity  -300
  // Negative kicks the value downward

Event: Every tick
  Action: RecoilSpring -> Spring to  0  (mode: Value)
  // Target stays at 0 so the gun always tries to return
  Action: Gun -> Set Y to  BaseY + RecoilSpring.Value
```

> Add impulse before the Spring To action each frame so the target is always 0 and the impulse drives the spring away from it.

---

### 5. Squash and stretch on landing

**Scenario:** A character sprite squashes when landing and stretches back on jump.

```
Event: Player just landed
  Action: ScaleXSpring -> Set velocity to  -0.4
  Action: ScaleYSpring -> Set velocity to  0.4
  // Squash: narrow + tall

Event: Every tick
  Action: ScaleXSpring -> Spring to  1
  Action: ScaleYSpring -> Spring to  1
  Action: Character -> Set width to   BaseWidth  *  ScaleXSpring.Value
  Action: Character -> Set height to  BaseHeight *  ScaleYSpring.Value
```

---

### 6. Health bar drain animation

**Scenario:** A health bar fills and drains smoothly rather than snapping.

```
Event: Player takes damage
  Action: HPSpring -> Spring to  Player.HP  (mode: Value)

Event: Every tick
  Action: HealthBar -> Set width to  HPSpring.Value * BarMaxWidth / MaxHP
```

---

### 7. Turret that smoothly rotates toward a target

**Scenario:** A turret rotates toward the nearest enemy using always-spring angle mode.

```
Event: On start of layout
  Action: TurretSpring -> Set always spring to target  Enabled, target: 0, mode: Angle

Event: Every tick
  Local variable: angleToEnemy = angle(Turret.X, Turret.Y, Enemy.X, Enemy.Y)
  Action: TurretSpring -> Set always spring target to  angleToEnemy
  Action: Turret -> Set angle to  TurretSpring.Value
```

---

### 8. Notification badge pop

**Scenario:** A notification badge pops from scale 0 when it appears, with a bounce.

```
Event: On notification received
  Action: BadgeSpring -> Spring from  0  to  1
  // Stiffness: 0.3, Damping: 0.6 — bouncy

Event: Every tick
  Action: Badge -> Set width to   32 * BadgeSpring.Value
  Action: Badge -> Set height to  32 * BadgeSpring.Value
```

---

### 9. Pause the spring during cutscenes

**Scenario:** Springs need to freeze during a cutscene and resume after.

```
Event: On cutscene start
  Action: Spring -> Set enabled  Disabled

Event: On cutscene end
  Action: Spring -> Set enabled  Enabled
```

> Disabling pauses the spring in place without discarding state. Re-enabling resumes from where it was.

---

### 10. Skip animation on first boot

**Scenario:** When a layout loads, snap positioned elements to their targets immediately so there's no intro animation.

```
Event: On start of layout
  Action: UISpring -> Snap to target
  // Prevents UI flying in from default position on first frame
```

---

### 11. On screen entry — spring-open a dialog

**Scenario:** A dialog box opens and fires an event when fully settled.

```
Event: Function "ShowDialog" called
  Action: DialogSpring -> Spring from  0  to  1
  // Drive dialog scale or opacity from Value

Event: DialogSpring -> On reached target
  Action: DialogCloseButton -> Set visible  Visible
  // Only show the close button once the animation is complete
```

---

### 12. Savegame restore — resume mid-animation

**Scenario:** A game is saved mid-animation and the spring state must be preserved across sessions.

Simple Spring automatically saves and restores its full state (value, velocity, from, to, stiffness, damping, precision, always-spring mode) when Construct 3's built-in savegame system is used. No extra actions are needed.

---

### 13. Multiple springs on one object — independent axes

**Scenario:** A sprite needs independent springs on X position and Y position (they should not interfere).

Add the Simple Spring behavior **twice** to the same object. Give each a distinct name in C3's object properties (e.g., `SpringX` and `SpringY`). Each instance is fully independent.

```
Event: On click
  Action: SpringX -> Spring to  Mouse.X  (mode: Value)
  Action: SpringY -> Spring to  Mouse.Y  (mode: Value)

Event: Every tick
  Action: Sprite -> Set X to  SpringX.Value
  Action: Sprite -> Set Y to  SpringY.Value
```

---

### 14. Drag-and-release with velocity inheritance

**Scenario:** The player drags an object and releases it; the spring should inherit the drag velocity.

```
Event: On mouse button released  (while dragging)
  // Don't reset — just call SpringTo so velocity is inherited
  Action: Spring -> Spring to  RestPosition.X  (mode: Value)
  // The spring will shoot past, bounce, and settle
```

> `Spring to` (not `Spring from/to`) is the key here. It never discards velocity, so the object flings toward the resting position with the momentum it had at release.

---

## 14. C3 Debugger

When previewing your project with the **C3 Debugger** open, every Simple Spring instance shows a live panel with its current state. You can read and edit values without stopping the preview.


### Debugger panel fields

| Field | Description |
|---|---|
| `isEnabled` | Whether the spring is currently active |
| `isAnimating` | Whether the spring is currently moving |
| `value` | The current spring output (editable live) |
| `from` | The start value for the current animation |
| `to` | The current target (editable live) |
| `velocity` | The current velocity (editable live) |
| `stiffness` | Active stiffness (editable live) |
| `damping` | Active damping (editable live) |
| `precision` | Active precision threshold (editable live) |
| `alwaysSpring` | Whether always-spring mode is enabled |

Editing `value`, `to`, `velocity`, `stiffness`, `damping`, or `precision` live is the fastest way to tune the feel without stopping the preview.

---

## 15. Tips and Common Mistakes

- **Don't set X directly in `On started`** — always read `Value` in `Every tick`. The trigger fires once; the driven property needs to be updated every frame.

- **Two springs for two axes** — a single spring tracks one number. If you need to smoothly move an object in 2D space, add the behavior twice: once for X and once for Y.

- **`Spring to` preserves velocity; `Spring from/to` does not** — use `Spring to` when you want smooth redirects (e.g., clicking a new destination while still moving). Use `Spring from/to` when you need a clean, predictable animation from a known start.

- **`Always Spring` never fires `OnReachedTarget`** — if you need a "done" callback, disable always-spring first, then let the spring settle normally.

- **Snapping on layout start** — call `Snap to target` in `On start of layout` to prevent objects from animating in from wherever the spring starts. This is almost always the right thing to do for UI elements placed at their final positions.

- **High stiffness + low damping = chaos** — values like stiffness 0.5 / damping 0.3 are technically valid but produce wildly oscillating values that may not look intentional. If your spring looks broken, lower stiffness or raise damping first.

- **Precision too small on slow springs** — if `Precision` is 0.0001 and stiffness is 0.02, the spring may take many seconds to settle. Raise precision if springs seem to animate forever.

- **`Add to velocity` fires even if disabled** — calling `Add to velocity` or `Set velocity` on a disabled spring re-enables animation. If you intentionally froze a spring with `Set enabled: Disabled`, avoid velocity actions during the frozen period.

- **Velocity direction is unsigned** — positive velocity moves the value toward higher numbers; negative velocity moves it toward lower numbers. Know which direction `to` is before injecting an impulse.

- **Save/load is automatic** — the full spring state (value, velocity, stiffness, from, to, etc.) is included in Construct 3 savegames with no extra setup.
