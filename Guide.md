# Simple Spring - Behavior Guide

Simple Spring is a Construct 3 behavior that animates any numeric value with spring physics. Instead of writing lerp loops, timer logic, or animation curves by hand, you attach this behavior to an object, call one action, and get a physically-motivated bounce that settles naturally at its target. A second system - **Mesh Spring** - extends that same physics to every control point of a C3 mesh, letting sprites squash, stretch, punch, wobble, and ripple with a single action call.

---

## Table of Contents

1. [Core Concepts](#1-core-concepts)
2. [Project Setup](#2-project-setup)
3. [Behavior Properties](#3-behavior-properties)
4. [Core Spring](#4-core-spring)
5. [Always-Spring Mode](#5-always-spring-mode)
6. [Mesh Spring](#6-mesh-spring)
7. [Mesh Effects Reference](#7-mesh-effects-reference)
8. [Actions Reference](#8-actions-reference)
9. [Conditions Reference](#9-conditions-reference)
10. [Expressions Reference](#10-expressions-reference)
11. [Triggers Reference](#11-triggers-reference)
12. [System Use Cases](#12-system-use-cases)
13. [Game Use Cases](#13-game-use-cases)
14. [C3 Debugger](#14-c3-debugger)
15. [Scripting](#15-scripting)
16. [Feature Deep-Dives](#16-feature-deep-dives)
17. [Tips and Common Mistakes](#17-tips-and-common-mistakes)

---

## 1. Core Concepts

### The problem this addon solves

Animating a number in Construct 3 normally means either keyframing a tween (which requires knowing the duration up front) or writing custom lerp logic every tick (which requires managing delta time, settling thresholds, and state flags yourself). Spring physics solves all of this in one idea: the value accelerates toward the target and decelerates as it gets close, naturally overshooting and oscillating before settling. The motion feels alive because it is physically motivated, not hand-timed.

### Key design decisions

- **One behavior, one number.** Each instance of the behavior owns exactly one animated value. To animate multiple properties simultaneously (X position and rotation, for example), add the behavior twice and give each a descriptive name in the C3 properties panel.
- **Fixed 60 fps physics, frame-rate independent display.** The spring simulation runs at a constant 60 physics steps per second regardless of actual frame rate. Between physics steps the displayed value is smoothly interpolated, so the output looks fluid even at 30 fps or under load.
- **Velocity inheritance.** If you redirect a spring mid-flight (e.g., the player changes direction), the existing velocity carries over. You never get a jarring snap on target change.
- **Mesh spring is opt-in.** Mesh deformation requires calling `Create Grid` first. Objects without mesh support (non-world objects, Tilemaps, certain effects) fire `On Mesh Unsupported` and leave the sprite untouched.

### Key concepts at a glance

| Term | Meaning |
|---|---|
| **Value** | The number the spring is currently animating. Drive any property (X, angle, scale, opacity, etc.) from this each tick. |
| **Stiffness** | How hard the spring pulls toward the target. Higher = snappier, lower = floatier. |
| **Damping** | How quickly oscillation dies out. Near 1.0 = almost no overshoot; near 0 = bounces forever. |
| **Precision** | How close value and velocity must both be before the spring declares itself settled. |
| **Always Spring** | A mode where the spring permanently tracks a moving target every tick instead of firing once. |
| **Mesh Spring** | A per-vertex spring system that deforms a C3 mesh grid and springs it back to rest. |

### Scenarios where this addon excels

- **UI feedback** - Button presses, panel slides, health bar fills, and notification pops all look polished when animated with spring physics.
- **Camera follow** - A camera that springs toward the player always feels smooth, and stiffness/damping can be tuned to match genre (snappy for action, floaty for puzzle).
- **Hit reactions** - Squash on landing, punch on impact, wobble on damage: each is one action call and then the physics settles itself.
- **Inventory and shop animations** - Items sliding into place, coins flying to a total counter, slots expanding on hover.
- **Procedural character animation** - Body parts that trail behind movement, eyes that lag behind head rotation, tails that follow with momentum.
- **Physics-feel without physics** - Doors that spring open and overshoot slightly, levers that snap back, drawbridges that tremble.
- **Data visualization** - Animated stat bars, score counters, and meters that smoothly spring to new values instead of jumping.

---

## 2. Project Setup

### Step 1 - Add the behavior

Open any object's property panel → **Behaviors** → **+** → search "Simple Spring" → click Add. You can add it multiple times; each instance is independent. Rename each one in the properties panel to keep your event sheet readable (e.g., "SpringX", "SpringAngle", "SpringScale").

### Step 2 - Set initial properties

In the properties panel configure **Stiffness**, **Damping**, and **Precision** for the feel you want. The defaults (stiffness `0.15`, damping `0.8`, precision `0.01`) give a medium-speed snap with slight overshoot - a good starting point for UI.

### Step 3 - Drive a property every tick

The behavior does not automatically set any property. You apply the `Value` expression yourself each tick:

```
Event: Every tick
  Action: Player -> Set X to Player.behaviors.SpringX.Value
  Action: Player -> Set Y to Player.behaviors.SpringY.Value
```

### Step 4 - Trigger a spring on an event

```
Event: Player -> On collision with Wall
  Action: Player.behaviors.SpringX -> Spring to  [target: 0]  [mode: Value]
  Action: Player.behaviors.SpringY -> Spring to  [target: 0]  [mode: Value]
```

That is a working spring setup. The value moves toward `0`, overshoots, and settles.

---

## 3. Behavior Properties

These are set per-instance in the Construct 3 properties panel and become the runtime defaults.

| Property | Type | Default | Description |
|---|---|---|---|
| **Stiffness** | Number | `0.15` | Pull force toward target per physics step. Typical range: `0.05` (very floaty) to `0.5` (very snappy). Values above `1.0` are allowed and cause rapid oscillation. |
| **Damping** | Number | `0.8` | Velocity multiplier per physics step. `1.0` = no energy loss (infinite bounce); `0.0` = all energy removed instantly (no overshoot). Valid range `0–1`. |
| **Precision** | Number | `0.01` | Settling threshold. When both `|value − target|` and `|velocity|` are smaller than this, the animation stops. Decrease for smoother settling on large ranges. |
| **Enabled** | Boolean | `true` | Whether the behavior runs at all. Can be toggled at runtime with the **Set Enabled** action. |

---

## 4. Core Spring

The core spring animates a single number from a start value to a target. Call one action, then read `Value` every tick to apply it.

### Spring To

The most common action. Starts from wherever the spring currently sits (inheriting any velocity it already has) and springs to the new target.

```
Event: Button -> On clicked
  Action: UIPanel.behaviors.SpringY -> Spring to  [target: 0]  [mode: Value]

Event: Every tick
  Action: UIPanel -> Set Y to UIPanel.behaviors.SpringY.Value
```

**Angle mode** handles 360° wrapping automatically - the spring takes the shortest rotational path, so springing from 350° to 10° goes forward 20° instead of backward 340°.

```
Event: Player -> On direction changed
  Action: Player.behaviors.SpringAngle -> Spring to  [target: Player.Angle]  [mode: Angle]

Event: Every tick
  Action: Player -> Set Angle to Player.behaviors.SpringAngle.Value
```

### Spring From/To

Use this when you need to specify the starting value explicitly - for example when creating an object and wanting it to animate in from a defined position regardless of where it spawned.

```
Event: On object created
  Action: Coin.behaviors.SpringScale -> Spring from/to  [from: 0]  [to: 1]

Event: Every tick
  Action: Coin -> Set Scale to Coin.behaviors.SpringScale.Value
```

### Velocity manipulation

`Set Velocity` and `Add to Velocity` let you inject motion directly. This is useful for knock-back, recoil, or any effect where the direction of the initial impulse matters more than the destination.

```
Event: Enemy -> On hit by Bullet
  Action: Enemy.behaviors.SpringX -> Add to velocity  [value: -15]
  // Enemy lurches left; spring pulls it back to target
```

### Stop and Snap

- **Stop at current value** - freezes the spring exactly where it is. Fires `On Stopped`.
- **Snap to target** - teleports instantly to the target and clears velocity. Fires `On Stopped`.

```
Event: DialogPanel -> On "Skip" button clicked
  Action: DialogPanel.behaviors.SpringY -> Snap to target
```

### Reset

Clears all state (value, velocity, animation flag) and places the value at the given number. Does not fire any trigger. Use this to put a spring in a clean known state before starting a new animation.

```
Event: On layout start
  Action: HUD.behaviors.SpringAlpha -> Reset spring to  [value: 0]
  Action: HUD.behaviors.SpringAlpha -> Spring to  [target: 1]  [mode: Value]
```

---

## 5. Always-Spring Mode

**Always Spring** keeps the spring awake permanently, continuously chasing a target that you update whenever it changes. This is ideal for smooth camera follow, cursor tracking, and any case where the destination is a live value rather than a fixed number.

### Enable it

```
Event: On start of layout
  Action: Camera.behaviors.SpringX -> Set always spring  [enabled: Enabled]  [target: Player.X]  [mode: Value]
  Action: Camera.behaviors.SpringY -> Set always spring  [enabled: Enabled]  [target: Player.Y]  [mode: Value]
```

### Update the target each tick

In always-spring mode the spring only re-wakes when the target changes. Use `Set always spring target` to push a new destination without altering stiffness, damping, or mode.

```
Event: Every tick
  Action: Camera.behaviors.SpringX -> Set always spring target  [target: Player.X]
  Action: Camera.behaviors.SpringY -> Set always spring target  [target: Player.Y]
  Action: ScrollTo -> Scroll to  Camera.behaviors.SpringX.Value,  Camera.behaviors.SpringY.Value
```

### Angle always-spring

Set mode to `Angle` to have the spring track a rotating target by taking the shortest path on every update.

```
Event: Every tick
  Action: Turret.behaviors.SpringAngle -> Set always spring target  [target: angle(Turret.X, Turret.Y, Player.X, Player.Y)]
  Action: Turret -> Set Angle to Turret.behaviors.SpringAngle.Value
```

### Enable/disable at runtime

```
Event: Player -> On death
  Action: Camera.behaviors.SpringX -> Set always spring  [enabled: Disabled]  [target: 0]  [mode: Value]
```

---

## 6. Mesh Spring

Mesh Spring deforms a C3 mesh grid using the same spring physics as the core system. Every vertex in the grid can hold offset and velocity independently. When you fire an effect action (Punch, Wobble, Squash/Stretch, Ripple), it injects velocity into the affected vertices. Those vertices spring back to zero over time.

### Requirements

The object must support C3's mesh API: Sprite, TiledBackground, and most world object plugins. Non-world plugins, Tilemaps, and some objects with active effects may not support it. Always check `Mesh is supported` before calling mesh actions in a cross-object context, or subscribe to `On Mesh Unsupported` and fall back gracefully.

### Workflow

The simplest approach - no setup needed. All mesh effects default to **Auto Mesh: Yes**, so they automatically create a mesh on first use (default 5×5 resolution):

```
Event: Hero -> On landed
  Action: Hero.behaviors.Spring -> Squash/stretch  [axis: Vertical]  [amount: 0.25]
                                                    [centerX: 0.5]  [centerY: 1.0]  [radius: 1.0]
                                                    [auto mesh: Yes]

Event: Every tick
  // No per-tick work needed - mesh updates automatically
```

For finer control, set the resolution upfront with **Set auto mesh resolution** then let effects auto-create the mesh, or create it manually and set **Auto Mesh: No** on effects:

```
Event: On start of layout
  Action: Hero.behaviors.Spring -> Set auto mesh resolution  [cols: 8]  [rows: 8]
  // or: Action: Hero.behaviors.Spring -> Create mesh grid  [cols: 8]  [rows: 8]

Event: Hero -> On landed
  Action: Hero.behaviors.Spring -> Squash/stretch  [axis: Vertical]  [amount: 0.25]
                                                    [centerX: 0.5]  [centerY: 1.0]  [radius: 1.0]
                                                    [auto mesh: Yes]
```

### Normalized coordinates

All mesh effect parameters use **normalized coordinates** (0–1). `(0, 0)` is the top-left corner of the sprite; `(1, 1)` is the bottom-right. The center is `(0.5, 0.5)`. This makes effects independent of sprite size.

```
// Convert world hit position to normalized sprite space
Set "nx" to (HitX - Hero.BBoxLeft) / Hero.Width
Set "ny" to (HitY - Hero.BBoxTop) / Hero.Height
Action: Hero.behaviors.Spring -> Punch  [centerX: nx]  [centerY: ny]  [strength: 0.3]  [radius: 0.6]  [falloff: Smooth]
```

### Mesh stiffness and damping

Mesh spring has its own independent stiffness and damping. Adjust them for different feel:

```
// Slow, heavy jello-like deformation:
Action: Slime.behaviors.Spring -> Set mesh stiffness  [value: 0.04]
Action: Slime.behaviors.Spring -> Set mesh damping    [value: 0.92]
```

### Cleaning up

```
Event: Hero -> On destroyed
  Action: Hero.behaviors.Spring -> Destroy grid
```

---

## 7. Mesh Effects Reference

All mesh effects inject velocity - they do not directly set positions. The spring simulation then resolves the motion over subsequent ticks.

### Squash and Stretch

Simulates the classic animation principle. On a vertical squash, the top and bottom are pushed inward while the sides bow outward.

| Parameter | Description |
|---|---|
| Axis | `Horizontal` pushes left/right; `Vertical` pushes top/bottom. |
| Amount | Impulse magnitude. `0.15–0.3` is typical for a landing bounce. Negative values reverse the squeeze. |
| Center X/Y | Normalized pivot point. Use `(0.5, 1.0)` for a ground landing (base of sprite). |
| Radius | How wide the effect spreads (normalized). `1.0` = full sprite. |
| Auto Mesh | `Yes` (default): auto-create a mesh if none exists. `No`: skip if no mesh has been created. |

```
Event: Hero -> On landed on ground
  Action: Hero.behaviors.Spring -> Squash/stretch  [axis: Vertical]  [amount: 0.2]
                                                    [centerX: 0.5]  [centerY: 1.0]  [radius: 1.0]
                                                    [auto mesh: Yes]
```

### Punch

Shoots all affected vertices outward from the center point.

| Parameter | Description |
|---|---|
| Center X/Y | Origin of the punch (normalized). |
| Strength | Outward velocity added per vertex. |
| Radius | Normalized radius of effect. |
| Falloff | `Linear` (default), `Smooth` (soft edge), or `Exponential` (sharp center, fast falloff). |
| Auto Mesh | `Yes` (default): auto-create a mesh if none exists. `No`: skip if no mesh has been created. |

```
Event: Bullet -> On collision with Enemy
  Action: Enemy.behaviors.Spring -> Punch  [centerX: 0.5]  [centerY: 0.5]
                                           [strength: 0.35]  [radius: 0.8]  [falloff: Smooth]  [auto mesh: Yes]
```

### Wobble

Applies a directional gradient impulse across the entire mesh - one side pushes one way, the other side pushes the opposite. Works well for impact direction, wind gusts, or attack windup.

| Parameter | Description |
|---|---|
| Angle | Direction of the wobble in degrees. `0` = horizontal shear; `90` = vertical shear. |
| Strength | Impulse magnitude. `0.1–0.2` is subtle; `0.3+` is dramatic. |
| Auto Mesh | `Yes` (default): auto-create a mesh if none exists. `No`: skip if no mesh has been created. |

```
Event: Player -> On sword swipe right
  Action: Slash.behaviors.Spring -> Wobble  [angle: 0]  [strength: 0.2]  [auto mesh: Yes]
```

### Ripple

Creates a radial wave pattern emanating from the center point. Vertices at the crest of each wave ring receive outward velocity; vertices in the trough receive inward velocity.

| Parameter | Description |
|---|---|
| Center X/Y | Wave origin (normalized). |
| Strength | Amplitude of each wave crest/trough. |
| Wavelength | Spacing between wave rings in normalized units. `0.25` gives ~4 rings across the sprite. |
| Decay | How quickly amplitude decreases with distance. `0` = no decay; `3+` = very local. |
| Auto Mesh | `Yes` (default): auto-create a mesh if none exists. `No`: skip if no mesh has been created. |

```
Event: Pond -> On stone dropped
  Action: Pond.behaviors.Spring -> Ripple  [centerX: 0.5]  [centerY: 0.5]
                                           [strength: 0.25]  [wavelength: 0.2]  [decay: 1.5]  [auto mesh: Yes]
```

### Shockwave

Emits a ring-shaped outward blast that peaks at a set distance from the origin. Unlike Punch, the center is unaffected - only the ring band is displaced. Good for bomb blasts, sonic booms, and EMP bursts.

| Parameter | Description |
|---|---|
| Epicenter X/Y | Center of the blast (normalized). |
| Strength | Outward impulse at the ring peak. `0.3` is a solid blast; `0.6+` is explosive. |
| Ring Radius | Distance from the epicenter where the ring peaks (normalized). `0.0` ≈ Punch; `0.5` = halfway to edge. |
| Ring Width | Thickness of the ring on each side of the peak (normalized). `0.1` = tight; `0.4` = wide soft zone. |
| Auto Mesh | `Yes` (default): auto-create a mesh if none exists. `No`: skip if no mesh has been created. |

```
Event: Bomb -> On explode
  Action: Bomb.behaviors.Spring -> Shockwave  [centerX: 0.5]  [centerY: 0.5]
                                              [strength: 0.5]  [ringRadius: 0.4]  [ringWidth: 0.2]  [auto mesh: Yes]
```

### Twist

Swirls the mesh around a pivot in a rotational motion, then springs back. Good for portal effects, magic circles, spin attacks, and tornado impacts.

| Parameter | Description |
|---|---|
| Pivot X/Y | Center of the swirl (normalized). |
| Strength | Rotational impulse. Positive = clockwise; negative = counter-clockwise. `0.2` is gentle; `0.5` is dramatic. |
| Radius | How far from the pivot the twist reaches (normalized). `1.0` = whole sprite. |
| Falloff | `Linear` (default), `Smooth`, or `Exponential`. |
| Auto Mesh | `Yes` (default): auto-create a mesh if none exists. `No`: skip if no mesh has been created. |

```
Event: Portal -> On activate
  Action: Portal.behaviors.Spring -> Twist  [centerX: 0.5]  [centerY: 0.5]
                                            [strength: 0.3]  [radius: 1.0]  [falloff: Smooth]  [auto mesh: Yes]
```

### Wave

Pushes parallel bands of vertices in alternating directions, like a flag rippling in wind. Vertices move perpendicular to the wave travel direction.

| Parameter | Description |
|---|---|
| Angle | Direction the wave travels in degrees. `0` = rightward (vertical bands, side-wind on a flag). `90` = downward (horizontal bands). |
| Strength | Peak displacement per wave crest. `0.1` is subtle flutter; `0.35+` is violent turbulence. |
| Wavelength | Spacing between wave crests (normalized). `0.5` = two crests; `0.25` = four crests; `1.0` = one S-curve. |
| Auto Mesh | `Yes` (default): auto-create a mesh if none exists. `No`: skip if no mesh has been created. |

```
Event: Flag -> Every tick
  Action: Flag.behaviors.Spring -> Wave  [angle: 0]  [strength: 0.12]  [wavelength: 0.5]  [auto mesh: Yes]
```

### Directional Bend

Bends the mesh toward a chosen direction with stronger displacement on the leading side, creating a forward lean or push arc.

| Parameter | Description |
|---|---|
| Angle | Bend direction in degrees. `0` = right, `90` = down, `180` = left, `-90` = up. |
| Strength | Bend intensity. `0.08` is subtle, `0.2` is strong, `0.35+` is exaggerated. |
| Radius | Influence size from center. `1.0` bends most of the sprite, lower values keep the bend central. |
| Falloff | `Linear`, `Smooth`, or `Exponential` edge fade behavior. |
| Auto Mesh | `Yes` (default): auto-create a mesh if none exists. `No`: skip if no mesh has been created. |

```
Event: Hero -> On recoil
  Action: Hero.behaviors.Spring -> Directional bend  [angle: 180]  [strength: 0.18]
                                                     [radius: 1.0]  [falloff: Smooth]  [auto mesh: Yes]
```

### Noise Jitter Burst

Applies randomized per-vertex impulse in a radius for shock, glitch, electric hit, and tremor effects.

| Parameter | Description |
|---|---|
| Center X/Y | Burst origin in normalized sprite space. |
| Strength | Jitter intensity. `0.05` subtle, `0.15` strong, `0.3+` violent burst. |
| Radius | Area of effect from center. `1.0` affects full sprite, lower values localize impact. |
| Falloff | `Linear`, `Smooth`, or `Exponential` decay from center. |
| Auto Mesh | `Yes` (default): auto-create a mesh if none exists. `No`: skip if no mesh has been created. |

```
Event: Enemy -> On electrified hit
  Action: Enemy.behaviors.Spring -> Noise jitter burst  [centerX: 0.5]  [centerY: 0.5]
                                                        [strength: 0.14]  [radius: 0.8]
                                                        [falloff: Smooth]  [auto mesh: Yes]
```

### Impact Trail Wave

Creates a directional banded wave around an impact travel axis. Useful for slash trails, dash wakes, and projectile fly-by pressure waves.

| Parameter | Description |
|---|---|
| Origin X/Y | Normalized origin of the trail wave. |
| Angle | Travel direction in degrees (match to attack/dash direction). |
| Strength | Wave intensity. `0.08` subtle, `0.2` dramatic. |
| Wavelength | Spacing between alternating bands. Lower values create tighter stripes. |
| Trail Width | Width of the affected corridor around the travel axis. |
| Auto Mesh | `Yes` (default): auto-create a mesh if none exists. `No`: skip if no mesh has been created. |

```
Event: SwordSlash -> On hit
  Action: Target.behaviors.Spring -> Impact trail wave  [centerX: 0.5]  [centerY: 0.5]
                                                        [angle: SwordSlash.Angle]
                                                        [strength: 0.18]  [wavelength: 0.3]
                                                        [trailWidth: 0.25]  [auto mesh: Yes]
```

### Constant Sway

A persistent sine-wave oscillation that runs automatically every tick - no per-tick action call needed. The deformation is computed directly from a sine function each frame, producing a clean wave shape regardless of stiffness or damping settings. Use for ambient motion: grass, plants, cloth, banners, underwater kelp, and idle character breathing.

Sway is controlled with two separate actions: **Start constant sway** to begin (or update parameters while running) and **Stop constant sway** to end it and let vertices spring back to rest naturally.

**Start constant sway** parameters:

| Parameter | Description |
|---|---|
| Angle | Direction the wave travels in degrees. `0` = rightward (vertical swaying bands - good for grass). `90` = downward (horizontal bands - good for hanging cloth). |
| Strength | Peak displacement per sway crest. `0.05` = very subtle rustle. `0.1` = natural grass in a gentle breeze. `0.2+` = dramatic wind or underwater kelp. |
| Wavelength | Spacing between sway peaks (normalized). `0.5` = two peaks across the sprite (good for grass blades). `1.0` = one smooth S-curve (good for a single plant stalk). `2.0` = very gentle arc. |
| Speed | Oscillation speed in cycles per second. `0.5` = slow, lazy sway. `1.0` = natural breeze. `2.0+` = fast flutter or storm. |
| Auto Mesh | `Yes` (default): auto-create a mesh if none exists. `No`: skip if no mesh has been created. |

```
Event: On start of layout
  Action: GrassTile.behaviors.Spring -> Start constant sway  [angle: 0]  [strength: 0.1]
                                                              [wavelength: 0.5]  [speed: 1.0]  [auto mesh: Yes]

Event: Wind -> On wind stops
  Action: GrassTile.behaviors.Spring -> Stop constant sway
```

Use the **Is mesh sway enabled** condition to check whether sway is currently running before starting it again or branching on it.

### Mesh Preset Combo

A convenience action that applies a pre-configured combination of 2–4 mesh effects in a single call. Each preset is tuned for a specific game-feel scenario: combat impacts, magical effects, environmental forces, and UI interaction. All effect strengths are scaled by the **Intensity** parameter, letting you easily adjust the preset's overall "punch" without changing individual effects.

| Parameter | Description |
|---|---|
| Preset | Select which combination to apply. Options: `Hit Impact` (punch + jitter + bend for melee hits), `Heavy Slam` (shockwave + squash + ripple for large collisions), `Sword Trail` (trail wave + twist for slash arcs), `Wind Gust` (directional bend + wave for environmental wind), `Electric Stun` (jitter + wobble + ripple for shock effects), `Portal Spawn` (twist + ripple + shockwave for magical warps), `UI Pop` (punch + squash for button/collect feedback). |
| Intensity | Multiplier for all effect strengths in the preset (typical range 0.5–2.0). `1.0` is balanced. Lower values create subtle effects; higher values create exaggerated impacts. |
| Impact X/Y | Center point for radial presets (ignore for directional presets). Use `0.5, 0.5` for sprite center, `0.5, 1.0` for base impact (landing), `0.5, 0.0` for top impact (ceiling hit). |
| Angle (degrees) | Direction for presets that use angle (Wind Gust, Sword Trail). Ignored by radial presets. `0` = right, `90` = down, `180` = left, `-90` = up. |
| Auto Mesh | `Yes` (default): auto-create a mesh if none exists. `No`: skip if no mesh has been created. |

**The 7 Built-In Presets:**

1. **Hit Impact** - Combines Punch (0.22 intensity), Noise Jitter Burst (0.08), and Directional Bend (0.10). Best for melee hits, punches, and blunt collisions. The punch creates initial outward thrust, jitter adds shock texture, and bend adds forward momentum direction.

2. **Heavy Slam** - Combines Shockwave (0.18), Squash Stretch vertical (0.25), and Ripple (0.12). Best for heavy impacts, ground slams, and explosions. Squash compresses the sprite vertically, shockwave creates a ring effect, and ripple adds secondary impact waves.

3. **Sword Trail** - Combines Impact Trail Wave (0.20) and Twist (0.15). Best for slashing attacks and directional impact arcs. Trail wave creates directional banded deformation along the slash path, and twist adds rotational spin-down.

4. **Wind Gust** - Combines Directional Bend (0.16) and Wave (0.12). Best for environmental wind forces, debris flying, and foliage reactions. Bend leans the sprite into the wind direction, and wave creates fluttering bands.

5. **Electric Stun** - Combines Noise Jitter Burst (0.14), Wobble (0.18), and Ripple (0.10). Best for shock, stun, and electrical effects. Jitter creates chaotic tremor, wobble adds directional instability, and ripple adds secondary electrical arcs.

6. **Portal Spawn** - Combines Twist (0.20), Ripple (0.15), and Shockwave (0.16). Best for magical spawns, portal effects, and dimensional warps. Twist creates the rotation into the portal, ripple expands outward, and shockwave creates a final energy burst.

7. **UI Pop** - Combines Punch (0.20) and Squash Stretch vertical (0.15). Best for button presses, item collection feedback, and UI pop animations. Punch creates the initial outward pop, and squash adds a secondary vertical bounce.

```
Event: Player -> On health changed to critical
  Action: HealthIcon.behaviors.Spring -> Mesh preset combo  [preset: Electric Stun]
                                                             [intensity: 1.5]  [centerX: 0.5]  [centerY: 0.5]
                                                             [angle: 0]  [auto mesh: Yes]

Event: Enemy -> On hit by sword
  Action: Enemy.behaviors.Spring -> Mesh preset combo  [preset: Sword Trail]
                                                       [intensity: 1.0]  [centerX: 0.5]  [centerY: 0.5]
                                                       [angle: SwordSlash.Angle]  [auto mesh: Yes]

Event: Bomb -> On collision with ground
  Action: Ground.behaviors.Spring -> Mesh preset combo  [preset: Heavy Slam]
                                                        [intensity: 0.8]  [centerX: Bomb.X]  [centerY: Bomb.Y]
                                                        [angle: 0]  [auto mesh: Yes]
```

### Effect Stacking and Composition

**Yes, multiple mesh effects absolutely stack together.** When you call multiple mesh effect actions on the same frame (or different frames before the mesh settles), their impulses accumulate. Each effect injects velocity into the mesh points, and the spring physics naturally compounds these contributions as vertices spring back.

**How stacking works:**

1. Each mesh effect action calculates vertex impulses for its specific deformation shape (punch, wobble, ripple, etc.)
2. These impulses are *added* to each vertex's velocity, not overwritten
3. Multiple calls' velocities accumulate in each vertex
4. The spring physics updates every frame, pulling vertices toward the rest position (zero offset) with all accumulated velocity
5. All effects spring back together naturally; the mesh settles only after all energy dissipates

**Stacking example:**

```
Event: Boss -> On hit by melee attack
  Action: Boss.behaviors.Spring -> Punch  [centerX: 0.5]  [centerY: 0.5]
                                          [strength: 0.2]  [radius: 1.0]  [falloff: Smooth]
  Action: Boss.behaviors.Spring -> Wobble  [angle: 180]  [strength: 0.15]
```

Result: The sprite first punches outward from center, and simultaneously wobbles backward (away from the attacker). As the spring physics update, the vertices experience both impulses at once and spring back through them naturally. The combo feels heavier and more complex than either effect alone.

**Stacking with constant sway:**

```
Event: On start of layout
  Action: Flag.behaviors.Spring -> Start constant sway  [angle: 0]  [strength: 0.1]
                                                        [wavelength: 0.5]  [speed: 1.0]

Event: Wind gust triggered
  Action: Flag.behaviors.Spring -> Wave  [angle: 0]  [strength: 0.2]  [wavelength: 0.4]
```

Result: Constant sway animates the flag continuously. When the wind gust Wave action fires, its impulse is added to the ongoing sway motion. The flag responds to the gust while still sway-animating beneath it, creating realistic layered motion.

---

## 8. Actions Reference

### Core Spring

| Action | Description |
|---|---|
| **Spring to** | Springs from the current value to a target. Inherits any existing velocity. Use Angle mode for rotation values. |
| **Spring from/to** | Springs from an explicit start value to a target. Resets velocity if not already animating. |
| **Set always spring** | Enables or disables always-spring mode, setting the permanent target and mode (Value or Angle). |
| **Set always spring target** | Updates the always-spring destination without changing any other settings. |
| **Set enabled** | Enables or disables the entire behavior. Disabled behavior stops ticking and does not update the value. |
| **Set stiffness** | Changes pull-toward-target force. Higher values are snappier. No upper limit; values above 1 cause fast oscillation. |
| **Set damping** | Changes how fast velocity decays. Must be 0–1. Values near 1 produce near-zero overshoot. |
| **Set precision** | Changes the settling threshold. Lower values mean the spring settles more completely before stopping. |
| **Stop at current value** | Freezes the spring at whatever value it currently has. Fires `On Stopped`. |
| **Snap to target** | Instantly teleports to the target and clears all velocity. Fires `On Stopped`. |
| **Set velocity** | Overwrites the spring's current velocity to the given value. Wakes the spring. |
| **Add to velocity** | Adds to the spring's current velocity. Wakes the spring. Useful for impulses. |
| **Reset spring to** | Instantly places the value at a given number and clears all motion. Does not fire any trigger. |

### Mesh Setup

| Action | Description |
|---|---|
| **Create mesh grid** | Creates a mesh on the instance and initializes all spring points. Minimum 2×2. Replaces any existing mesh. |
| **Destroy grid** | Removes the mesh from the instance and clears all spring state. |
| **Set mesh enabled** | Pause or resume mesh spring updates without destroying the grid. |
| **Set mesh stiffness** | Spring pull strength for the mesh simulation. Independent from the core spring stiffness. |
| **Set mesh damping** | Velocity decay for mesh vertices. Independent from the core spring damping. |
| **Set mesh precision** | Settling threshold for mesh vertices. |
| **Reset offsets** | Springs all mesh vertices back to zero offset immediately (zeroes velocity too). Stops mesh animation. |

### Mesh Effects

All mesh effect actions include an **Auto Mesh** parameter (default `Yes`). When set to `Yes`, a mesh is automatically created using the current auto mesh resolution (default 5×5) if none exists - no manual setup required. Set to `No` when managing the mesh yourself for a custom resolution. Use **Set auto mesh resolution** before your first effect call to control the density of the auto-created mesh.

| Action | Description |
|---|---|
| **Squash and stretch** | Applies a classic squash/stretch impulse around a normalized center with a given radius. |
| **Punch** | Pushes vertices outward from a point with linear, smooth, or exponential falloff. |
| **Wobble** | Applies a directional shear impulse - one side of the sprite pushes one way, the opposite side the other. |
| **Ripple** | Creates concentric wave rings of alternating push/pull from an origin point. |
| **Shockwave** | Ring-shaped outward blast - center unaffected, only the ring band is displaced. |
| **Twist** | Swirls the mesh in a rotational motion around a pivot, then springs back. |
| **Wave** | Pushes parallel bands of vertices in alternating directions, like a flag in wind. |
| **Directional bend** | Bends the mesh toward a direction with stronger leading-side displacement for lean/recoil feel. |
| **Noise jitter burst** | Randomized per-vertex burst useful for electric shock, glitch tremor, and impact rattle. |
| **Impact trail wave** | Directional banded trail wave for slash arcs, dash wakes, and projectile pressure trails. |
| **Start constant sway** | Begins continuous sinusoidal sway (grass, plants, cloth, flags). Specify angle, strength, wavelength, and speed. Runs automatically each tick until stopped. |
| **Stop constant sway** | Stops sway and lets vertices spring back to rest naturally. Fires `On Mesh Settled` when done. |
| **Set auto mesh resolution** | Sets the columns and rows used when Auto Mesh = Yes auto-creates a mesh. Default 5×5. Use 8×8 or higher for smoother deformation on large sprites. |
| **Mesh preset combo** | Applies a pre-configured blend of 2–4 mesh effects tuned for specific game-feel scenarios (Hit Impact, Heavy Slam, Sword Trail, Wind Gust, Electric Stun, Portal Spawn, UI Pop). Intensity scales all effect strengths. |

---

## 9. Conditions Reference

| Condition | Description |
|---|---|
| **Is animating** | True while the core spring is in motion (not yet settled). Invertible. |
| **Is enabled** | True if the behavior is currently enabled. Invertible. |
| **Has reached target** | True if the spring has settled at its target (not animating, within precision). Invertible. |
| **Is always spring enabled** | True if always-spring mode is active. Invertible. |
| **Mesh is supported** | True if the attached object supports the C3 mesh API. Invertible. |
| **Is mesh enabled** | True if the mesh is enabled and ticking. Invertible. |
| **Is mesh animating** | True while any mesh vertex is still in motion. Invertible. |
| **Has mesh settled** | True when mesh animation has stopped and total energy is below precision. Invertible. |
| **Is mesh sway enabled** | True while constant sway is running. Use to check before starting sway again or to branch on sway state. Invertible. |

---

## 10. Expressions Reference

### Core Spring

| Expression | Returns | Description |
|---|---|---|
| `Value` | Number | Current interpolated spring value. This is the number to drive your properties with. |
| `Progress` | Number (0–1) | How far along the animation is. `0` = at start, `1` = at target. |
| `From` | Number | The start value of the current or last animation. |
| `To` | Number | The target value of the current or last animation. |
| `Velocity` | Number | Current velocity of the spring physics simulation. |
| `Stiffness` | Number | Current stiffness setting. |
| `Damping` | Number | Current damping setting. |
| `Precision` | Number | Current precision setting. |
| `AlwaysSpringTarget` | Number | The current always-spring target value. |

### Mesh State

| Expression | Returns | Description |
|---|---|---|
| `MeshEnergy` | Number | Sum of all vertex motion (offsets + velocities). Near `0` when settled. |
| `MeshPointCount` | Number | Total number of mesh control points (cols × rows). |
| `MeshOffsetXAtIndex(i)` | Number | Current X offset (normalized) of mesh point at flat index `i` (`0` to `MeshPointCount - 1`). Returns `0` if out of range. |
| `MeshOffsetYAtIndex(i)` | Number | Current Y offset (normalized) of mesh point at flat index `i` (`0` to `MeshPointCount - 1`). Returns `0` if out of range. |
| `MeshCols` | Number | Number of columns in the active mesh grid. |
| `MeshRows` | Number | Number of rows in the active mesh grid. |

---

## 11. Triggers Reference

### Core Spring Triggers

| Trigger | Fires When |
|---|---|
| **On started** | The spring begins a new animation (either SpringTo or SpringFromTo is called on a settled spring). |
| **On reached target** | The spring naturally settles at its target through physics. |
| **On stopped** | The spring is manually interrupted via **Stop at current value** or **Snap to target**. |

### Mesh Spring Triggers

| Trigger | Fires When |
|---|---|
| **On mesh started** | Mesh animation begins (an effect action is called while the mesh was at rest). |
| **On mesh settled** | All mesh vertices come to rest (energy drops below precision). |
| **On mesh unsupported** | The first mesh action is attempted on an object that does not support the mesh API. Fires once per instance. |

---

## 12. System Use Cases

### Core Spring System

*Animating a numeric value with physics-motivated motion.*

**Scenario:** A UI panel slides in from off-screen when the player opens the inventory.

```
Event: On "Inventory" button pressed
  Action: InventoryPanel.behaviors.SpringY -> Reset spring to  [value: -400]
  Action: InventoryPanel.behaviors.SpringY -> Spring to  [target: 200]  [mode: Value]

Event: Every tick
  Action: InventoryPanel -> Set Y to InventoryPanel.behaviors.SpringY.Value
```

**Scenario:** A health bar smoothly animates to a new value whenever the player takes damage.

```
Event: Player -> On health changed
  Action: HealthBar.behaviors.SpringW -> Spring to  [target: (Player.Health / Player.MaxHealth) * 400]  [mode: Value]

Event: Every tick
  Action: HealthBar -> Set Width to HealthBar.behaviors.SpringW.Value
```

**Scenario:** Snap a spring immediately (skip animation) if the player presses Escape while a transition is running.

```
Event: Keyboard -> On "Escape" key pressed
  Condition: TransitionPanel.behaviors.SpringY -> Is animating
  Action: TransitionPanel.behaviors.SpringY -> Snap to target
```

### Always-Spring System

*Continuously following a moving target.*

**Scenario:** A camera smoothly follows the player with configurable lag.

```
Event: On start of layout
  Action: Camera.behaviors.SpringX -> Set always spring  [enabled: Enabled]  [target: Player.X]  [mode: Value]
  Action: Camera.behaviors.SpringY -> Set always spring  [enabled: Enabled]  [target: Player.Y]  [mode: Value]

Event: Every tick
  Action: Camera.behaviors.SpringX -> Set always spring target  [target: Player.X]
  Action: Camera.behaviors.SpringY -> Set always spring target  [target: Player.Y]
  Action: Scroll -> ScrollTo  Camera.behaviors.SpringX.Value,  Camera.behaviors.SpringY.Value
```

**Scenario:** A turret barrel springs toward the player angle, always using the shortest rotational path.

```
Event: On start of layout
  Action: Turret.behaviors.SpringAngle -> Set always spring  [enabled: Enabled]  [target: 0]  [mode: Angle]

Event: Every tick
  Action: Turret.behaviors.SpringAngle -> Set always spring target
      [target: angle(Turret.X, Turret.Y, Player.X, Player.Y)]
  Action: Turret -> Set Angle to Turret.behaviors.SpringAngle.Value
```

### Mesh Spring System

*Per-vertex physics deformation on a sprite.*

**Scenario:** A character sprite squashes on landing and springs back.

```
Event: On start of layout
  Action: Hero.behaviors.Spring -> Create mesh grid  [cols: 8]  [rows: 8]

Event: Hero -> On landed
  Action: Hero.behaviors.Spring -> Squash/stretch  [axis: Vertical]  [amount: 0.22]
                                                    [centerX: 0.5]  [centerY: 1.0]  [radius: 1.0]

Event: Hero.behaviors.Spring -> On mesh settled
  // Play settle sound, etc.
```

**Scenario:** Check mesh support before use, fall back gracefully.

```
Event: On start of layout
  Condition: HeroSprite.behaviors.Spring -> Mesh is supported
  Action: HeroSprite.behaviors.Spring -> Create mesh grid  [cols: 6]  [rows: 6]

Event: HeroSprite.behaviors.Spring -> On mesh unsupported
  Action: System -> Set global variable "MeshEnabled" to 0
```

### Trigger System

*Reacting to spring lifecycle events.*

**Scenario:** Play a sound when the spring finishes animating naturally (not skipped).

```
Event: MenuPanel.behaviors.SpringScale -> On reached target
  Action: Audio -> Play "panel_settled"

Event: MenuPanel.behaviors.SpringScale -> On stopped
  // Skipped - no sound
```

---

## 13. Game Use Cases

### 1. Bouncy Coin Pickup Counter

**Scenario:** Coins fly to a HUD counter and the counter number springs to the new value with a satisfying pop.

```
Event: Player -> On collect Coin
  Action: System -> Add 1 to global "Score"
  Action: ScoreLabel.behaviors.SpringScale -> Spring to  [target: 1.3]  [mode: Value]

Event: ScoreLabel.behaviors.SpringScale -> On reached target
  Condition: ScoreLabel.behaviors.SpringScale.Value >= 1.3
  Action: ScoreLabel.behaviors.SpringScale -> Spring to  [target: 1.0]  [mode: Value]

Event: Every tick
  Action: ScoreLabel -> Set Scale to ScoreLabel.behaviors.SpringScale.Value
  Action: ScoreLabel -> Set Text to Score
```

### 2. Camera Shake on Explosion

**Scenario:** The camera jolts on an explosion then springs back to the player.

```
Event: Explosion -> On created
  Action: CamOffset.behaviors.SpringX -> Add to velocity  [value: choose(-20, 20)]
  Action: CamOffset.behaviors.SpringY -> Add to velocity  [value: choose(-15, 15)]

Event: Every tick
  Action: CamOffset.behaviors.SpringX -> Spring to  [target: 0]  [mode: Value]
  Action: CamOffset.behaviors.SpringY -> Spring to  [target: 0]  [mode: Value]
  Action: Scroll -> ScrollTo
      Player.X + CamOffset.behaviors.SpringX.Value,
      Player.Y + CamOffset.behaviors.SpringY.Value
```

> Use a separate invisible `CamOffset` object as a value container. Its X/Y are never displayed - only the spring values matter.

### 3. Elastic Platformer Landing

**Scenario:** A platformer hero squashes on landing and stretches on jump.

```
Event: On start of layout
  Action: Hero.behaviors.MeshSpring -> Create mesh grid  [cols: 6]  [rows: 8]

Event: Hero.Platform -> On landed
  Action: Hero.behaviors.MeshSpring -> Squash/stretch  [axis: Vertical]  [amount: 0.25]
                                                        [centerX: 0.5]  [centerY: 1.0]  [radius: 1.0]

Event: Hero.Platform -> On jump
  Action: Hero.behaviors.MeshSpring -> Squash/stretch  [axis: Horizontal]  [amount: -0.2]
                                                        [centerX: 0.5]  [centerY: 0.5]  [radius: 1.0]
```

### 4. Enemy Hit Reaction

**Scenario:** An enemy lurches backward when struck, then spring-returns.

```
Event: Bullet -> On collision with Enemy
  Action: Enemy.behaviors.SpringX -> Add to velocity  [value: Bullet.behaviors.Bullet.Speed * 0.05]
  Action: Enemy.behaviors.MeshSpring -> Punch  [centerX: 0.5]  [centerY: 0.5]
                                               [strength: 0.3]  [radius: 0.8]  [falloff: Smooth]

Event: Every tick
  Condition: Enemy.behaviors.SpringX -> Is animating
  Action: Enemy -> Set X to Enemy.X + Enemy.behaviors.SpringX.Value
```

### 5. Smooth Dialogue Box Open/Close

**Scenario:** A dialogue box scales in and out smoothly when opened or closed.

```
Event: On "OpenDialog" trigger
  Action: DialogBox.behaviors.SpringScale -> Reset spring to  [value: 0]
  Action: DialogBox.behaviors.SpringScale -> Spring to  [target: 1]  [mode: Value]

Event: On "CloseDialog" trigger
  Action: DialogBox.behaviors.SpringScale -> Spring to  [target: 0]  [mode: Value]

Event: DialogBox.behaviors.SpringScale -> On reached target
  Condition: DialogBox.behaviors.SpringScale.Value < 0.01
  Action: DialogBox -> Set Visible to No

Event: Every tick
  Action: DialogBox -> Set Scale to DialogBox.behaviors.SpringScale.Value
```

### 6. Analog Gauge / Speedometer

**Scenario:** A car speedometer needle springs to the current speed.

```
Event: On start of layout
  Action: Needle.behaviors.SpringAngle -> Set always spring  [enabled: Enabled]  [target: -90]  [mode: Angle]

Event: Every tick
  Action: Needle.behaviors.SpringAngle -> Set always spring target
      [target: -90 + (Car.Speed / Car.MaxSpeed) * 180]
  Action: Needle -> Set Angle to Needle.behaviors.SpringAngle.Value
```

### 7. Rope / Chain Segment Follow

**Scenario:** Each chain link springs toward the position of the link above it, creating an organic trailing effect.

```
Event: Every tick  [For each Chain link, ordered by index]
  Local var "TargetX" = (Index = 0) ? Player.X : PreviousLink.X
  Local var "TargetY" = (Index = 0) ? Player.Y : PreviousLink.Y
  Action: ChainLink.behaviors.SpringX -> Set always spring target  [target: TargetX]
  Action: ChainLink.behaviors.SpringY -> Set always spring target  [target: TargetY]
  Action: ChainLink -> Set X to ChainLink.behaviors.SpringX.Value
  Action: ChainLink -> Set Y to ChainLink.behaviors.SpringY.Value
```

### 8. Tower Defense Enemy Wobble on Hit

**Scenario:** When an enemy takes a hit, its sprite wobbles in the direction of the damage.

```
Event: Enemy -> On damaged
  Action: Enemy.behaviors.MeshSpring -> Wobble
      [angle: angle(Attacker.X, Attacker.Y, Enemy.X, Enemy.Y)]
      [strength: 0.18]
```

### 9. Inventory Slot Hover Enlarge

**Scenario:** Hovering an inventory slot scales it up; leaving scales it back.

```
Event: ItemSlot -> On mouse enter
  Action: ItemSlot.behaviors.SpringScale -> Spring to  [target: 1.15]  [mode: Value]

Event: ItemSlot -> On mouse leave
  Action: ItemSlot.behaviors.SpringScale -> Spring to  [target: 1.0]  [mode: Value]

Event: Every tick
  Action: ItemSlot -> Set Scale to ItemSlot.behaviors.SpringScale.Value
```

### 10. Magic Spell Charge Indicator

**Scenario:** A ring indicator expands as a charge bar fills, then pops when released.

```
Event: Every tick  [while charge key held]
  Action: ChargeRing.behaviors.SpringScale -> Spring to  [target: ChargeAmount / MaxCharge]  [mode: Value]

Event: On charge released
  Action: ChargeRing.behaviors.SpringScale -> Spring to  [target: 1.5]  [mode: Value]

Event: ChargeRing.behaviors.SpringScale -> On reached target
  Condition: ChargeRing.behaviors.SpringScale.Value >= 1.4
  Action: ChargeRing -> Set Visible to No

Event: Every tick
  Action: ChargeRing -> Set Scale to ChargeRing.behaviors.SpringScale.Value
```

### 11. Satisfying Button Press

**Scenario:** A UI button compresses slightly when pressed and springs back.

```
Event: Button -> On mouse button pressed
  Action: Button.behaviors.MeshSpring -> Squash/stretch  [axis: Vertical]  [amount: 0.15]
                                                          [centerX: 0.5]  [centerY: 0.5]  [radius: 1.0]

Event: Button -> On mouse button released
  Action: Button.behaviors.SpringScale -> Add to velocity  [value: 0.05]
```

### 12. Water Surface Ripple on Impact

**Scenario:** A stone landing in water creates a ripple that springs back.

```
Event: Stone -> On collision with Water
  Action: Water.behaviors.MeshSpring -> Ripple
      [centerX: (Stone.X - Water.BBoxLeft) / Water.Width]
      [centerY: 0.3]
      [strength: 0.3]  [wavelength: 0.2]  [decay: 2.0]
```

### 13. Player Footstep Ground Squash

**Scenario:** The ground tile deforms slightly under each footstep.

```
Event: Hero.Platform -> On landed
  Action: GroundTile.behaviors.MeshSpring -> Squash/stretch  [axis: Vertical]  [amount: 0.08]
                                                              [centerX: 0.5]  [centerY: 0.0]  [radius: 0.5]
```

### 14. Dialogue Character Emotion Pulse

**Scenario:** A character portrait pulses in scale when an important line fires.

```
Event: On dialogue line "!" played
  Action: Portrait.behaviors.SpringScale -> Spring to  [target: 1.12]  [mode: Value]

Event: Portrait.behaviors.SpringScale -> On reached target
  Condition: Portrait.behaviors.SpringScale.Value > 1.1
  Action: Portrait.behaviors.SpringScale -> Spring to  [target: 1.0]  [mode: Value]

Event: Every tick
  Action: Portrait -> Set Scale to Portrait.behaviors.SpringScale.Value
```

### 15. Parallax Layer Speed Spring

**Scenario:** Parallax layers spring to their correct offsets with a natural lag when the camera moves.

```
Event: Every tick
  Action: BackgroundLayer.behaviors.SpringX -> Set always spring target
      [target: -(Camera.X * 0.3)]
  Action: BackgroundLayer -> Set X to BackgroundLayer.behaviors.SpringX.Value
```

### 16. Enemy Anticipation Windup

**Scenario:** Before a heavy attack, an enemy compresses along the attack axis, then swings through with a wobble.

```
Event: Boss -> On "Windup" animation frame
  Action: Boss.behaviors.MeshSpring -> Squash/stretch  [axis: Horizontal]  [amount: -0.2]
                                                        [centerX: 0.5]  [centerY: 0.5]  [radius: 1.0]

Event: Boss -> On "Strike" animation frame
  Action: Boss.behaviors.MeshSpring -> Wobble  [angle: 0]  [strength: 0.25]
```

### 17. UI Toast Notification Slide In

**Scenario:** A notification slides in from the right edge, bounces slightly, and holds.

```
Event: On "ShowToast" triggered
  Action: Toast.behaviors.SpringX -> Reset spring to  [value: LayoutWidth + 200]
  Action: Toast.behaviors.SpringX -> Spring to  [target: LayoutWidth - 320]  [mode: Value]

Event: Every tick
  Action: Toast -> Set X to Toast.behaviors.SpringX.Value

Event: On "HideToast" triggered
  Action: Toast.behaviors.SpringX -> Spring to  [target: LayoutWidth + 200]  [mode: Value]
```

### 18. Loading Bar Fill with Overshoot

**Scenario:** A loading bar fills to 100% with a satisfying spring overshoot.

```
Event: On loading complete
  Action: LoadBar.behaviors.SpringW -> Set stiffness to  0.1
  Action: LoadBar.behaviors.SpringW -> Set damping to  0.7
  Action: LoadBar.behaviors.SpringW -> Spring to  [target: 600]  [mode: Value]

Event: Every tick
  Action: LoadBar -> Set Width to clamp(LoadBar.behaviors.SpringW.Value, 0, 600)
```

### 19. Crosshair Spread on Fire

**Scenario:** A weapon's crosshair spreads outward when firing and contracts when idle.

```
Event: Player -> On fire weapon
  Action: Crosshair.behaviors.SpringSpread -> Add to velocity  [value: 8]

Event: Every tick
  Action: Crosshair.behaviors.SpringSpread -> Spring to  [target: BaseSpread]  [mode: Value]
  Action: CrosshairLeft  -> Set X to Crosshair.X - Crosshair.behaviors.SpringSpread.Value
  Action: CrosshairRight -> Set X to Crosshair.X + Crosshair.behaviors.SpringSpread.Value
  Action: CrosshairTop   -> Set Y to Crosshair.Y - Crosshair.behaviors.SpringSpread.Value
  Action: CrosshairBot   -> Set Y to Crosshair.Y + Crosshair.behaviors.SpringSpread.Value
```

### 20. Save/Load Spring State

**Scenario:** The player's camera position springs correctly after loading a saved game.

Simple Spring saves and loads its full state (value, velocity, target, stiffness, damping, mesh points) via Construct's built-in save system. No extra event sheet work is required. After `System > Load`, the spring resumes exactly where it was - including any in-progress animation.

```
Event: On "SaveGame" pressed
  Action: System -> Save

Event: On "LoadGame" pressed
  Action: System -> Load
  // SpringX and SpringY resume their previous animation state automatically
```

### 21. Cloth / Flag Ripple on Wind

**Scenario:** A flag sprite ripples continuously on a wind event.

```
Event: On "WindGust" triggered
  Action: Flag.behaviors.MeshSpring -> Wobble  [angle: 90]  [strength: 0.12]
  Action: Flag.behaviors.MeshSpring -> Ripple  [centerX: 0.0]  [centerY: 0.5]
                                               [strength: 0.08]  [wavelength: 0.35]  [decay: 0.5]
```

### 22. Freeze-Frame Punch Impact

**Scenario:** On a strong hit, game speed drops to near-zero for one frame, then springs back to full speed - giving a "freeze frame" game-feel moment.

```
Event: Heavy attack lands
  Action: System -> Set time scale to 0.05
  Action: TimeScale.behaviors.SpringTS -> Reset spring to  [value: 0.05]
  Action: TimeScale.behaviors.SpringTS -> Spring to  [target: 1.0]  [mode: Value]

Event: Every tick
  Action: System -> Set time scale to TimeScale.behaviors.SpringTS.Value
```

> Pair this with a mesh Punch on the hit target in the same frame for maximum impact.

---

### Mesh Effects Use Cases

Each effect injects velocity into mesh vertices and lets the spring simulation handle the return to rest. No per-tick code is needed after the action call.

#### Squash and Stretch

**Landing bounce.** The most common use. Call on every `On landed` event with Vertical axis, pivot at `(0.5, 1.0)` (base of the sprite), radius `1.0`. Amount `0.2` is natural; `0.35` is exaggerated cartoon.

**Jump stretch.** On jump, use Horizontal axis with a negative amount (`-0.15`) and pivot `(0.5, 0.5)`. The sprite narrows and elongates mid-air, then springs back.

**Button press feedback.** Vertical axis, small amount (`0.1`), pivot at center. Fires on mouse-down; the sprite visibly compresses then pops back on release.

**Heavy footstep ground dent.** Apply to the ground tile on player landing with a small amount (`0.06`), pivot at `(0.5, 0.0)` (top of the tile), radius `0.4`. The tile surface dimples under the player's weight.

**Recoil on weapon fire.** Horizontal axis on the gun sprite, negative amount (kicks backward), pivot at `(1.0, 0.5)` (muzzle end). Springs back to neutral after each shot.

#### Punch

**Bullet / melee hit impact.** Convert the world-space hit position to normalized coordinates and punch outward from there. Use Smooth falloff for a natural splat feel, Exponential for a sharp focused dent.

**Obstacle collision.** When a moving object hits a wall, punch the wall sprite at the point of contact. Radius `0.3` and Smooth falloff localizes the dent to just around the impact point.

**Player death burst.** On death, punch from center (`0.5, 0.5`) with high strength (`0.5+`) and radius `1.0`. The whole sprite explodes outward before being destroyed.

**Pickup collect pop.** When a coin or item is collected, punch the HUD icon at center with a moderate strength, creating a satisfying outward pop that springs back.

#### Wobble

**Enemy hit direction feedback.** Use `angle(attacker.X, attacker.Y, enemy.X, enemy.Y)` as the angle. The sprite leans away from the attacker and springs back - purely directional, no outward burst.

**Wind gust on foliage.** Periodically fire Wobble at angle `0` on tree/grass sprites with a low strength (`0.08–0.12`). Vary the angle slightly for each instance to avoid uniform movement.

**Attack wind-up tell.** Before a boss swings, wobble it in the attack direction. The sprite visibly leans into the strike, signalling the move to the player.

**Nervous idle animation.** Low-strength wobbles (`0.05`) at random angles on a short timer create an organic, unsettled idle without requiring a hand-authored animation.

#### Ripple

**Water surface on impact.** Convert the splash world position to normalized coords and ripple from there. Wavelength `0.2` (many tight rings), Decay `1.5–2.0` (rings fade with distance), Strength `0.25`.

**Magic circle activation.** Center ripple (`0.5, 0.5`) with low decay (`0.5`) so rings spread across the whole rune/sigil sprite uniformly. Pairs well with a simultaneous Twist for a portal feel.

**Shockwave propagation on a large floor sprite.** Low decay (`0.3`) ripple from the explosion position. With a large wavelength (`0.4`), just one or two rings sweep slowly across a floor tile.

**Healing pulse on character.** Soft ripple from center, low strength (`0.1`), zero decay, large wavelength (`0.8`) - produces a gentle, single-ring outward pulse on the sprite.

#### Shockwave

**Bomb explosion.** Ring radius `0.5`, width `0.2`, high strength. The outer half of the sprite blasts outward while the center stays still, creating a ring-detonation silhouette.

**EMP / stun burst.** Ring radius `0.3`, width `0.3` (wide ring). The mid-section of an enemy sprite flares outward and springs back. Chain it across multiple nearby enemies by calling the action on each in a for-each loop.

**Boss phase transition.** A large ring radius (`0.7`) with wide width (`0.35`) deforms almost the entire sprite in a single expanding crown shape - ideal for a form-change moment.

**Shield absorb hit.** Apply to a shield sprite at the contact point (converted to normalized). Small ring radius and width create a localized ring ripple where the hit landed.

#### Twist

**Portal / warp effect.** Center twist (`0.5, 0.5`), Smooth falloff, strong positive strength. Fire once when the portal activates; the sprite spirals and snaps back.

**Spin attack wind-up.** Apply before a rotational attack animation plays. The sprite coils in the spin direction and releases when the attack connects.

**Confusion / daze status.** Alternating-direction twists (`+0.15`, then `-0.15`) on a short timer while a character is stunned give a dizzy wobble that reads clearly without a custom animation.

**Coin/collectible pickup spin.** A quick Twist on the HUD icon when the player collects something with a spin mechanic (e.g., spinning coins). Positive or negative based on the coin's rotation direction.

#### Wave

**Flag in wind.** Angle `0` (wave travels right to left), Strength `0.12`, Wavelength `0.5`. Fire every few seconds or tie the strength to a wind variable. Each call injects a new wave that settles naturally.

**Cloth / curtain flutter.** Angle `90` (wave travels top to bottom), low strength, Wavelength `0.4`. Periodically re-trigger for continuous flutter. Vary the angle ±10° for organic variation.

**Energy field / force barrier.** Angle `0`, moderate strength (`0.18`), tight wavelength (`0.25`) for many bands. Fire on hit to show the barrier straining, then spring back to flat.

**Swimming character undulation.** Apply a Wave perpendicular to the character's movement direction each tick while submerged (use a low strength like `0.06` and reset before re-applying so it doesn't stack).

#### Directional Bend

**Weapon recoil lean.** Apply opposite the firing direction on character or weapon sprites so the silhouette bends backward and springs back quickly.

**Strong wind push.** Fire on gust events using wind angle and low-to-medium strength for trees, grass clumps, and hanging props that should all lean together.

**Enemy anticipation pose.** Bend toward movement direction just before charge attacks to create a readable wind-up pose without animation frames.

**Vehicle drift body roll.** Use turn direction as angle and moderate strength to make karts/hovercraft bodies roll into turns.

#### Noise Jitter Burst

**Electric stun hit.** Trigger on shock status apply with center at impact point and small radius for sharp localized jitter.

**Critical hit freeze shake.** During hit-stop frames, fire a medium-strength jitter burst for a crunchy impact feel.

**Glitch enemy state.** Periodically call jitter with low strength while enemy is corrupted to create unstable visual noise.

**Earthquake micro-rattle.** Apply low strength, large radius bursts on environmental sprites during quake phases.

#### Impact Trail Wave

**Sword slash pressure trail.** Fire along slash direction when hit lands so the target deforms in directional bands instead of radial bursts.

**Dash wake distortion.** Trigger at dash start/end using move angle for a wake-like wave that stretches along movement path.

**Projectile fly-by shock.** On near-miss events, use projectile angle and a narrow trail width for a quick pressure ripple.

**Boss beam sweep.** Call repeatedly while beam rotates, updating angle each tick for a sweeping deformation ribbon.

#### Constant Sway

**Grass fields in ambient wind.** Call `Start constant sway` once with angle `0`, strength around `0.08–0.12`, and speed around `0.8–1.2`. This gives continuous idle plant motion without per-tick event logic.

**Plant reactions to weather state.** Keep sway running with low values during calm weather, then call `Start constant sway` again with higher strength and speed when a storm starts - parameters update instantly without stopping and restarting. Call `Stop constant sway` when entering indoor areas; vertices spring back to rest naturally.

**Underwater kelp or seaweed drift.** Use longer wavelength (`0.8–1.2`) and slower speed (`0.4–0.8`) for broad, heavy underwater swaying. Increase mesh damping if you want a more sluggish return when stopped.

**Hanging signs and banners.** Use angle `90` and moderate strength for vertical-biased sway on suspended objects. Call `Stop constant sway` during cutscenes if you need a fully still frame for dialogue closeups. Use the `Is mesh sway enabled` condition to avoid calling Stop unnecessarily.

### Other game use cases

**Platformers.** Spring physics is a natural fit for the tactile feedback that defines polished platformers. Landing bounce, coyote-time cues, variable-height jump feel, and wall-slide scrunch are all achievable with one or two mesh squash/stretch calls. Always-spring cameras follow the player with tunable lag that can tighten during wall-runs and loosen during free-fall. Jump-arc stretching (horizontal squash on peak, vertical squash on land) adds the classic cartoon-feel springiness without a full animation rig.

**RPGs and visual novels.** Character portraits pulse and react during dramatic dialogue lines. Stat bars (HP, MP, EXP) flow smoothly to new values instead of snapping. Inventory items animate into their slots with a settling bounce. Menu panels slide in and out without requiring hand-authored tweens. Equipment equip/unequip causes the stat meters to spring to new values in a satisfying sequence.

**Shoot-'em-ups (shmups).** Weapon crosshair spread springs outward on each shot and contracts during cool-down. The player ship springs back toward the screen center after hard dodges. Bullet counters and charge meters animate reactively. Boss parts spring back after being damaged, giving a sense of physical weight. Bomb explosions ripple the background layer with a mesh ripple effect.

**Tower defense.** Enemy units visually wobble and compress when they take hits, giving satisfying feedback without particle effects. Tower range indicators spring into view when selected. Build menus slide in from the side with physics-feel easing. Projectile hit markers spring from scale 0 to 1 on impact and fade out.

**Puzzle games.** Tiles spring into position when placed, giving physical weight to each move. A selected piece pulses slightly to indicate it is active. Incorrect placements trigger a punch or wobble effect on the grid. Completion animations (cascading scale pops) are naturally sequenced using `On reached target` chains. Drag-and-snap interactions inherit velocity so pieces fling into slots with momentum and bounce back.

**Horror / atmospheric games.** Slow, low-stiffness springs add creep and dread to UI reveals - health bars that grudgingly fill, doors that slowly spring open. Ambient object sway (curtains, hanging lights) is easily produced with periodic `Add to velocity` impulses and high damping. A heartbeat HUD indicator can pulse with a spring that is repeatedly kicked on each beat event.

**Endless runners and arcade games.** Score counters pop on milestone digits. Character lean during turns (spring the rotation offset). Obstacle approach indicators that scale up as the player closes in. Speed lines that spring in/out based on velocity. Combo multiplier labels that scale up with each hit and return to baseline when the combo resets.

**Card games and board games.** Cards spring into the hand position on draw. Dragged cards spring back if released in an invalid area. Hover previews scale up with a snap. Stack animations use `Spring From/To` with staggered start times to create a cascading reveal. Card flip animations can use the `Progress` expression to blend two card face textures at the 0.5 midpoint.

**Fighting games.** Health bars drain with spring deceleration so final-hit drama is prolonged. Hit-stop (freeze frame) is a one-liner using time scale spring. Character sprites punch outward on block hit and spring back. Portrait close-ups bounce-in when a KO is called. Input prompts jiggle to draw attention when the player is idle.

**Metroidvania / exploration games.** Map icons spring into position when a new room is discovered. Ability unlock banners slide in from the top with a bounce. Item pickup animations use scale-from-zero springs on the floating item label. Gate/door indicators pulse when the player approaches a locked room and the player has the key.

**Racing / driving games.** Speedometer needles and tachometers track engine RPM with a spring for a mechanical feel. Nitro boost meter fills with a fast, snappy spring and drains with a slower, floatier one. Position indicator (1st, 2nd...) bounces in when the rank changes. Checkpoint time-bonus labels spring up and then fade out using an opacity spring.

**Strategy and simulation.** Resource counters spring to new values after a trade or build. Alert icons pulse on new events. Tooltip panels spring in when hovering over units. Minimap blips scale up when selected. Progress bars for building construction fill smoothly with a spring, giving a sense that something physical is happening.

**Rhythm games.** Note lane indicators pulse on beat. Hit rating labels (PERFECT, GOOD, MISS) scale from 0 with a spring and settle at 1. Combo text bounces slightly on each successful hit. The health/fever bar springs to new values on hit streaks. Missed notes cause the lane to shake with an Add-to-velocity impulse.

**Point-and-click and adventure games.** Dialogue choice buttons spring in one by one (staggered using instance index as delay). Inventory item tooltips spring open from the cursor position. Scene transition overlays scale from the click point using a punch-from-origin spring. Object interaction highlights pulse with a low-amplitude wobble to draw attention.

**Sports games.** Score displays spring to new values after each goal/point. Countdown timers pulse on each second tick. Ball trajectory indicators spring into alignment with movement. Replay rewind controls slide in from the side. Stadium crowd cheer meters fill with a bouncy spring on big plays.

**Idle / clicker games.** Click feedback numbers (+1, +10, etc.) spring from scale 0 and float upward using a spring driving Y offset. Upgrade buttons enlarge on hover and spring back. Production rate indicators smoothly update as upgrades are purchased. Prestige resets play a full-screen scale-out animation before the layout reloads.

**Simulation / city builder.** Population and happiness meters use springs so changes feel gradual and continuous. Building selection highlights spring-scale into view. Notification banners for events (disaster, milestone) slide in from the top. Budget balance numbers spring to new values after tax cycles, giving a sense of the economy breathing.

**Roguelikes / dungeon crawlers.** Stat modification popups spring up from the player on level-up. Loot item cards spring from the floor position to a presentation position. HP drain from DOT effects is reflected in a slowly trailing health bar spring. Room clear celebrations: the room exits spring-expand when enemies are defeated.

---

## 14. C3 Debugger

Open the debugger in Construct 3 with **Debug > Run** (or F9). Select the instance in the debugger panel. Simple Spring adds two sections.

### Simple Spring section

| Field | Meaning | Editable |
|---|---|---|
| `isEnabled` | Whether the behavior is ticking. | No |
| `isAnimating` | Whether the core spring is in motion. | No |
| `value` | Current interpolated spring value. | Yes - changing it teleports the value without changing the target. |
| `from` | Start of the current or last animation. | No |
| `to` | Target of the current animation. | Yes - changing it mid-run redirects the spring. |
| `velocity` | Current physics velocity. | Yes - inject velocity for live testing. |
| `stiffness` | Current stiffness. | Yes |
| `damping` | Current damping. | Yes |
| `precision` | Settling threshold. | Yes |
| `alwaysSpring` | Whether always-spring mode is active. | No |

### Simple Spring Mesh section

| Field | Editable | Notes |
|---|---|---|
| `supported` | No | Whether this object supports the mesh API. |
| `enabled` | Yes | Pause/resume mesh ticking without destroying the grid. |
| `animating` | No | True while any vertex is in motion. |
| `cols` / `rows` | No | Grid dimensions. |
| `energy` | No | Total vertex motion. Near `0` when settled. |
| `stiffness` / `damping` / `precision` | Yes | Tune mesh feel live. |

Editing `value`, `to`, `velocity`, `stiffness`, `damping`, or `precision` live is the fastest way to tune spring feel without stopping the preview.

---

## 15. Scripting

### Accessing the behavior from script

The behavior name is what you typed in Construct's properties panel, not the addon ID. If you named it "SpringX":

```js
const spring = myInstance.behaviors.SpringX;
```

### Calling actions from script

Every ACE file with `expose: true` has its handler function copied directly onto the runtime prototype. The method name is PascalCase, derived from the file name (`a.SpringTo.js` → `SpringTo()`). **Combo parameters are 0-based indices**, not string labels.

```js
// Spring to 200 in Value mode (mode index 0)
spring.SpringTo(200, 0);

// Spring to 90 in Angle mode (mode index 1)
spring.SpringTo(90, 1);

// Spring from 0 to 100
spring.SpringFromTo(0, 100);

// Set always spring: enabled (index 0), target 500, Value mode (index 0)
spring.SetAlwaysSpring(0, 500, 0);

// Add a velocity impulse
spring.AddToVelocity(-12);

// Reset to a value
spring.Reset(0);

// Stop / snap
spring.Stop();
spring.SnapToTarget();
```

### Reading state from script

These camelCase getter methods are on the instance class and reflect live runtime state:

```js
const val    = spring._getValue();
const vel    = spring._getVelocity();
const prog   = spring._getProgress();
const from   = spring._getFromValue();
const to     = spring._getToValue();
const anim   = spring._isSpringAnimating();
const always = spring._isAlwaysSpringEnabled();
const target = spring._getAlwaysSpringTarget();

// Mesh getters
const supported = spring._isMeshSupported();
const energy    = spring._getMeshEnergy();
const count     = spring._getMeshPointCount();
const offsetX   = spring._getMeshOffsetXAtIndex(5);
```

### Listening to triggers from script

```js
spring.addEventListener("OnStarted",       () => console.log("spring started"));
spring.addEventListener("OnReachedTarget", () => console.log("reached target"));
spring.addEventListener("OnStopped",       () => console.log("manually stopped"));
spring.addEventListener("OnMeshStarted",   () => console.log("mesh started"));
spring.addEventListener("OnMeshSettled",   () => console.log("mesh settled"));
spring.addEventListener("OnMeshUnsupported", () => console.log("mesh not supported"));
```

### Complete scripting example

```js
const spring = inst.behaviors.SpringScale;

// Initialize and animate in
spring.Reset(0);
spring.SpringTo(1, 0);   // mode 0 = Value

// Listen for settlement
spring.addEventListener("OnReachedTarget", function handler() {
  console.log(`Scale settled at ${spring._getValue()}`);
  spring.removeEventListener("OnReachedTarget", handler);
});
```

---

## 16. Feature Deep-Dives

### Stiffness, Damping, and the Feel Dial

Think of stiffness and damping as two orthogonal controls:

| | Low Damping (0.6–0.75) | High Damping (0.85–0.97) |
|---|---|---|
| **Low Stiffness (0.05–0.1)** | Slow, wobbly, underdamped | Slow, creeping, overdamped |
| **High Stiffness (0.2–0.4)** | Fast, bouncy, dramatic | Fast, snappy, minimal overshoot |

Common presets:

| Feel | Stiffness | Damping |
|---|---|---|
| Bouncy toy | 0.12 | 0.68 |
| Snappy UI | 0.22 | 0.85 |
| Camera follow | 0.08 | 0.82 |
| Heavy door | 0.06 | 0.88 |
| Jello | 0.04 | 0.92 |
| Rigid snap | 0.35 | 0.9 |

### Framerate Independence

The physics runs at exactly 60 steps/second regardless of frame rate. At 30 fps, two physics steps fire per frame. At 120 fps, half a step fires per frame and the display value is interpolated. Spring behavior is deterministic across frame rates - the same stiffness and damping always produce the same motion curve, which matters for reproducible game logic and save/load correctness.

Delta time is capped at ~67ms (≈ 15 fps equivalent) to prevent physics explosions when the browser tab is backgrounded or the device throttles.

### Save and Load

The behavior serializes its complete state: value, velocity, from/to targets, stiffness/damping/precision, enabled flag, always-spring settings, and the full mesh point array (offsets + velocities). When a save game is loaded, mid-air springs resume exactly where they were, including mid-animation mesh deformations. No extra event sheet logic is needed.

---

## 17. Tips and Common Mistakes

- **You must drive properties yourself every tick.** The behavior only updates a number. You are responsible for writing `Set X to MyObj.behaviors.SpringX.Value` each tick. Forgetting this is the most common mistake.

- **Add the behavior twice for two-axis animation.** One Spring behavior = one animated number. For X and Y you need two behaviors. Give them distinct names ("SpringX", "SpringY") in the properties panel.

- **Do not call `Spring to` every tick.** Each call re-sets the `from` value and fires `On Started`. Call it once on the triggering event, then read `Value` every tick.

- **`On reached target` vs `Has reached target`.** `On reached target` is a trigger - it fires once when the spring settles. `Has reached target` is a polled condition. Use the trigger for one-shot reactions; use the condition for continuous checks.

- **Mesh effects need `Create grid` first.** Calling `Punch` or `Wobble` before `Create grid` silently does nothing.

- **Mesh coordinates are normalized (0–1), not pixels.** To convert a world-space impact point: `nx = (HitX - Sprite.BBoxLeft) / Sprite.Width`.

- **`On stopped` fires for manual interruptions only.** Naturally settling springs fire `On reached target`. Only `Stop at current value` and `Snap to target` fire `On stopped`.

- **High stiffness (> 1) is valid but aggressive.** Values above `0.5` cause very rapid oscillation. This is not clamped - it can be useful for physical effects - but it will look wrong as an easing curve for most UI.

- **Reset before animating in from a specific start.** If an object was previously animated and you want to start from a known position, call `Reset spring to [startValue]` first, then `Spring to [target]`. Otherwise the spring inherits the previous velocity.

- **Mesh is only supported on world objects.** Non-world plugin instances will always fire `On Mesh Unsupported`. Keep mesh setup inside a `Mesh is supported` condition guard when the behavior is on a mixed-type object family.
