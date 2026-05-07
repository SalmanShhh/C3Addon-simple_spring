# Simple Spring Guide

Simple Spring is a Construct 3 behavior for spring-driven animation of numeric values, colour channels, transform channels, and mesh vertices. It replaces manual lerp loops, hand-authored easing timelines, and repetitive per-tick setup with a consistent spring model that supports named springs, auto-apply transform and colour workflows, playback controls, and mesh deformation presets.

## Table of Contents

1. [Core Concepts](#1-core-concepts)
2. [Project Setup](#2-project-setup)
3. [Plugin Properties](#3-plugin-properties)
4. [Spring Values (Multi_Spring)](#4-spring-values-multi_spring)
5. [Springs Playback (Multi_Spring_Playback)](#5-springs-playback-multi_spring_playback)
6. [Colour Spring](#6-colour-spring)
7. [Spring Position](#7-spring-position)
8. [Spring Size](#8-spring-size)
9. [Spring Angle](#9-spring-angle)
10. [Mesh Setup, Effects, and State](#10-mesh-setup-effects-and-state)
11. [Core Spring (Deprecated)](#11-core-spring-deprecated)
12. [Actions Reference](#12-actions-reference)
13. [Conditions Reference](#13-conditions-reference)
14. [Expressions Reference](#14-expressions-reference)
15. [Triggers Reference](#15-triggers-reference)
16. [System Use Cases](#16-system-use-cases)
17. [Game Use Cases](#17-game-use-cases)
18. [C3 Debugger](#18-c3-debugger)
19. [Scripting (C3 Script / JavaScript)](#19-scripting-c3-script--javascript)
20. [Feature Deep-Dives](#20-feature-deep-dives)
21. [Tips and Common Mistakes](#21-tips-and-common-mistakes)

## 1. Core Concepts

### The problem this addon solves

Construct projects often need responsive motion that can be interrupted and retargeted without looking robotic. A spring model solves this by tracking value, velocity, and settling threshold continuously, so transitions remain smooth when targets change often.

### Key design decisions

- **Named springs per behavior instance**: one object can host many spring IDs in one behavior.
- **Auto-apply groups**: colour, position, size, and angle each maintain one active auto-apply spring ID at a time.
- **Fixed-step physics with interpolation**: internal spring stepping is stable while exposed values are smooth.
- **Active-only ticking**: only active/paused/constant springs are processed each tick for better scalability.
- **Deprecated Core Spring kept for compatibility**: old ACEs remain available but all new work should use the non-deprecated categories.

### Key concepts at a glance

| Concept | Meaning |
|---|---|
| **Spring ID** | Unique string key for a spring (for example `"cam_x"`, `"health"`). |
| **Stiffness** | Pull force toward target. Higher values respond faster. |
| **Damping** | Energy loss factor in range 0-1. Higher values reduce overshoot. |
| **Precision** | Settle threshold used to detect completion. |
| **Constant spring** | A spring that keeps chasing updated targets over time. |
| **Auto-apply** | Behaviour writes sprung results directly to object properties each tick. |

### Scenarios where this addon excels

- **UI feedback**: panel slides, number counters, button pops.
- **Camera smoothing**: constant spring follow with tunable lag.
- **Impact reactions**: velocity impulses and mesh punches.
- **Colour transitions**: health tints, status effects, ambient palette shifts.
- **Transform animation without tick glue**: combined grouped spring actions with per-call Apply To Property control.
- **Stylized deformation**: mesh effect presets and constant sway.

## 2. Project Setup

1. Add **Simple Spring** behavior to an object.
2. Keep default properties initially (`Default Stiffness`, `Default Damping`, `Default Precision`, `Enabled`).
3. Start with **Spring Values** if you want manual property application, or use **Colour Spring / Spring Position / Spring Size / Spring Angle** for auto-apply workflows.

First working example:

```text
Event: On start of layout
  Action: Player -> Start: Named spring -> "x", Current value, 0, 500, Value

Event: Every tick
  Action: Player -> Set X to Player.SpringValue("x")
```

## 3. Plugin Properties

| Property | Type | Default | Description |
|---|---|---|---|
| Default Stiffness | Float | `1.25` | Default stiffness used when a spring is first created. |
| Default Damping | Float | `0.9` | Default damping used when a spring is first created. |
| Default Precision | Float | `0.01` | Default settle threshold used when a spring is first created. |
| Enabled | Check | `true` | Enables or disables spring processing for the behavior instance. |

## 4. Spring Values (Multi_Spring)

This is the main named-spring category for generic numeric animation.

### What it does

Creates and controls independent named springs on one behavior instance.

### When to use it

Use this when you want to drive any numeric property manually with expressions, or when you need many coordinated springs on one object.

### Example

```text
Event: Enemy -> On created
  Action: Enemy -> Start: Named spring -> "scale", From value, 0, 1, Value

Event: Every tick
  Action: Enemy -> Set Scale to Enemy.SpringValue("scale")
```

### Gotchas

- Spring IDs are per behavior instance.
- `Constant: Set spring` now handles constant setup and retargeting in one action.
- Use playback category actions for pause/resume/stop operations.

## 5. Springs Playback (Multi_Spring_Playback)

This category controls spring execution state by ID or globally.

### What it does

Pauses, resumes, or stops named springs without changing setup actions.

### Example

```text
Event: PauseMenu -> On opened
  Action: Player -> Pause: All springs

Event: PauseMenu -> On closed
  Action: Player -> Resume: All springs
```

### Gotchas

- `Stop: Spring by ID` clears the named spring state.
- Use `Pause` when you want to continue from current motion later.

## 6. Colour Spring

Colour Spring drives RGB values with spring physics and can auto-apply to object colour properties.

### Colour space quick summary

| Colour Space | Best for | Why it is useful |
|---|---|---|
| RGB | Direct channel control, damage flashes, LED-like UI effects | You control red/green/blue channels directly, so exact art-directed colours are easy to hit. |
| HSL | Smooth hue ramps, readable status gradients, UI theming | Hue changes stay visually even while saturation/lightness stay stable, which is great for health and state ramps. |
| HSV | VFX pulses, glow intensity shifts, bloom-friendly transitions | Value channel behaves like brightness energy, so glow and intensity animation is easy to tune. |

### Example use cases by colour space

RGB damage flash:

```text
Event: Player -> On damaged
  Action: Player -> Start: Colour spring -> "damage_rgb", RGB, Current value, 255,255,255, 255,100,100, true

Event: Player -> On recovered
  Action: Player -> Start: Colour spring -> "damage_rgb", RGB, Current value, 255,100,100, 255,255,255, true
```

HSL health gradient:

```text
Event: Every tick
  Action: HealthBar -> Constant: Set colour spring -> "hp_hsl", HSL, 120 * (HP / MaxHP), 90, 50, true
```

HSV charge glow:

```text
Event: Weapon -> While charging
  Action: Weapon -> Constant: Set colour spring -> "charge_hsv", HSV, 200, 70, 40 + Charge01 * 60, true

Event: Weapon -> On charge released
  Action: Weapon -> Start: Colour spring -> "charge_hsv", HSV, Current value, 200,70,100, 40,0,100, true
```

HSV stealth reveal pulse:

```text
Event: StealthUnit -> While revealed
  Action: StealthUnit -> Constant: Set colour spring -> "reveal_hsv", HSV, 180, 45, 55 + sin(time * 4) * 12, true
```

#### RGB other examples (10)

1. Enemy hit flash from white to red without affecting brightness logic.
2. Crit hit flash from white to yellow for stronger readability than standard damage.
3. Poison status tint by raising green and reducing red over time.
4. Frozen status tint by boosting blue while keeping red/green muted.
5. UI warning panel pulse by springing only red channel intensity.
6. Team-color retargeting where exact RGB brand values must be preserved.
7. Damage number text tint from orange to white after impact.
8. Checkpoint activation pulse from neutral gray to exact cyan accent.
9. Pickup rarity flash where each rarity maps to strict authored RGB endpoints.
10. Alarm light prop cycling between two exact reds for industrial scenes.

#### HSL other examples (10)

1. Health orb hue sweep from green to yellow to red with fixed lightness.
2. Mana orb hue shift from cyan to violet while keeping saturation stable.
3. Quest marker state transitions using hue only so icon contrast remains constant.
4. Craft quality indicator from dull hue to premium hue without brightness jump.
5. Combo meter color progression where hue communicates streak tier.
6. Day-night UI theme interpolation by springing hue and saturation only.
7. Dialogue mood badge transitions across warm/cool palettes with steady lightness.
8. Minimap threat overlay moving from calm hue to danger hue smoothly.
9. Rhythm lane judgement feedback where hue steps map to timing quality bands.
10. Faction influence map gradients with smooth hue travel and readable midpoints.

#### HSV other examples (10)

1. Charged attack glow where Value increases with charge percent.
2. Shield recharge pulse where Value oscillates while Hue remains fixed.
3. Rare loot sparkle intensity driven by Value bursts for quick attention.
4. Stealth detection meter where saturation and value increase as risk rises.
5. Teleport pad warm-up using increasing Value and slight Hue drift.
6. Ultimate-ready indicator with high-Value pulse and reduced saturation at cooldown end.
7. Laser warning beam brightening by Value before firing.
8. Boss phase transition aura where Value spikes on phase swap.
9. Rhythm downbeat flash where Value peaks on beat then settles.
10. Hazard zone edge glow where Value follows distance-to-center function.

Practical selection rule:

- Pick RGB when art direction needs exact channel endpoints.
- Pick HSL when hue progression readability matters most.
- Pick HSV when brightness or glow intensity is the main signal.

### Example

```text
Event: Player -> On damaged
  Action: Player -> Start: Colour spring -> "damage", RGB, Current value, 0,0,0, 255,80,80, true
```

### Gotchas

- One colour spring ID owns auto-apply at a time.
- `Constant: Set colour spring` replaces old enabled/target split actions.
- `ColourSpace("springId")` reports the currently configured colour space for that spring ID (`rgb`, `hsl`, or `hsv`).

## 7. Spring Position

Position springs animate X/Y/Z channels and optionally apply to object properties.

### Example

```text
Event: On start of layout
  Action: CameraProxy -> Constant: Set position spring -> "follow", Player.X, Player.Y, 0, true

Event: Every tick
  Action: CameraProxy -> Constant: Set position spring -> "follow", Player.X, Player.Y, 0, true
  Action: ScrollTo -> Scroll to CameraProxy.X, CameraProxy.Y
```

### Gotchas

- Use `Settings: Set transform spring` here when you need per-spring transform tuning.
- `Velocity: Add to position spring` applies per axis.

## 8. Spring Size

Size springs animate Width/Height (and internal Depth channel) with optional auto-apply.

### Example

```text
Event: Icon -> On selected
  Action: Icon -> Apply Size spring -> "pulse", 32,32, 40,40, true
```

### Gotchas

- Constant action is `Constant: Set size spring`.
- Velocity action is `Velocity: Add to size spring`.

## 9. Spring Angle

Angle springs animate angular motion with optional auto-apply.

### Example

```text
Event: Turret -> Every tick
  Action: Turret -> Constant: Set angle spring -> "aim", angle(Turret.X, Turret.Y, Player.X, Player.Y), true
```

### Gotchas

- Use angle spring category for angular behaviour, not generic mode toggles in multi spring.
- Velocity action is `Velocity: Add to angle spring`.

## 10. Mesh Setup, Effects, and State

Mesh categories manage per-vertex spring deformation and state queries.

### Example

```text
Event: Hero -> On landed
  Action: Hero -> Do Mesh Effect: Squash and stretch -> Vertical, 0.2, 0.5, 1.0, 1.0, Yes
```

### Gotchas

- Auto mesh is available in effect actions and can create grid automatically.
- If unsupported, `On unsupported` trigger fires.

## 11. Core Spring (Deprecated)

Core Spring ACEs are deprecated compatibility actions and conditions. They are still functional for existing projects, but new logic should use Spring Values, Springs Playback, and specialized categories.

## 12. Actions Reference

### Spring Values

| Action | Description |
|---|---|
| Start: Named spring | Starts or retargets a named spring from current or explicit start value. |
| Settings: Set spring | Overrides stiffness, damping, and precision for one named spring. |
| Velocity: Set named spring | Sets the named spring velocity directly. |
| Velocity: Add to named spring | Adds an impulse to named spring velocity. |
| Constant: Set spring | Configures and runs a constant spring toward target. |
| Manage: Remove spring | Removes a named spring from this behavior instance. |

### Springs Playback

| Action | Description |
|---|---|
| Pause: Spring by ID | Pauses one named spring. |
| Resume: Spring by ID | Resumes one named spring. |
| Stop: Spring by ID | Stops and clears one named spring. |
| Pause: All springs | Pauses all springs on this instance. |
| Resume: All springs | Resumes all springs on this instance. |
| Stop: All springs | Stops and clears all springs on this instance. |

### Colour Spring

| Action | Description |
|---|---|
| Start: Colour spring | Starts a colour spring with explicit Apply To Property control in the same action. |
| Constant: Set colour spring | Sets and runs constant colour spring. |
| Settings: Set colour spring | Sets stiffness, damping, precision for named colour spring channels. |
| Settings: Set colour spring from duration | Fits stiffness and damping from duration, precision, and bounce profile. |

### Spring Position

| Action | Description |
|---|---|
| Apply Position spring | Starts position spring with explicit Apply To Property control in the same action. |
| Constant: Set position spring | Configures and runs constant position spring. |
| Start Value: Transform position spring | Sets start values for position spring channels. |
| End Value: Transform position spring | Sets target values for position spring channels. |
| Settings: Set transform spring | Sets stiffness, damping, precision for position spring channels. |
| Settings: Set position spring from duration | Fits stiffness and damping from duration, precision, and bounce profile. |
| Velocity: Add to position spring | Adds velocity per X/Y/Z channel. |

### Spring Size

| Action | Description |
|---|---|
| Apply Size spring | Starts size spring with explicit Apply To Property control in the same action. |
| Constant: Set size spring | Configures and runs constant size spring. |
| Start Value: Transform size spring | Sets start width and height values. |
| End Value: Transform size spring | Sets target width and height values. |
| Settings: Set size spring from duration | Fits stiffness and damping from duration, precision, and bounce profile. |
| Velocity: Add to size spring | Adds velocity on width and height channels. |

### Spring Angle

| Action | Description |
|---|---|
| Apply Angle spring | Starts angle spring with explicit Apply To Property control in the same action. |
| Constant: Set angle spring | Configures and runs constant angle spring. |
| Start Value: Transform angle spring | Sets angle spring start value. |
| End Value: Transform angle spring | Sets angle spring target value. |
| Settings: Set angle spring from duration | Fits stiffness and damping from duration, precision, and bounce profile. |
| Velocity: Add to angle spring | Adds angular velocity impulse. |

### Mesh Setup

| Action | Description |
|---|---|
| Create grid | Creates mesh grid for deformation. |
| Destroy grid | Destroys mesh grid and clears state. |
| Reset offsets | Resets mesh offsets and velocities. |
| Set enabled | Enables or disables mesh processing. |
| Set stiffness | Sets mesh stiffness. |
| Set damping | Sets mesh damping. |
| Set precision | Sets mesh settle threshold. |

### Mesh Effects

| Action | Description |
|---|---|
| Do Mesh Effect: Punch | Radial punch impulse from center point. |
| Do Mesh Effect: Squash and stretch | Axis-based squash or stretch. |
| Do Mesh Effect: Wobble | Directional wobble impulse. |
| Do Mesh Effect: Ripple | Radial ripple wave impulse. |
| Do Mesh Effect: Shockwave | Ring-shaped outward impulse. |
| Do Mesh Effect: Twist | Rotational twist impulse. |
| Do Mesh Effect: Wave | Directional wave bands. |
| Do Mesh Effect: Directional bend | Bend deformation in direction. |
| Do Mesh Effect: Noise jitter burst | Randomized jitter impulse in radius. |
| Do Mesh Effect: Impact trail wave | Directional trail-style wave impulse. |
| Do Mesh Effect: Preset combo | Applies one of 11 multi-effect presets. |
| Mesh: Start constant sway | Starts persistent sine sway on mesh. |
| Mesh: Stop constant sway | Stops constant sway. |
| Mesh: Set auto mesh resolution | Sets grid resolution used by auto-mesh creation. |

### Core Spring (Deprecated)

| Action | Description |
|---|---|
| Start: Spring to | Deprecated single-spring start action. |
| Start: Spring from/to | Deprecated single-spring from/to action. |
| Start: Spring from/to angle | Deprecated single-spring angle from/to action. |
| Constant: Set spring | Deprecated constant single-spring setup. |
| Constant: Set spring target | Deprecated constant target update action. |
| Velocity: Set spring | Deprecated single-spring velocity set action. |
| Velocity: Add to spring | Deprecated single-spring velocity add action. |
| Settings: Set stiffness | Deprecated stiffness setter. |
| Settings: Set damping | Deprecated damping setter. |
| Settings: Set precision | Deprecated precision setter. |
| Settings: Set behavior enabled | Deprecated behavior enable toggle. |
| Playback: Stop at current value | Deprecated stop action. |
| Playback: Snap to target | Deprecated snap action. |
| Reset: Spring to value | Deprecated reset action. |

## 13. Conditions Reference

| Condition | Description |
|---|---|
| Has spring reached target | True when named spring has settled. |
| Is spring animating | True while named spring is actively animating. |
| Is constant spring enabled | True if named spring constant mode is active. |
| On spring started | Trigger when spring starts. |
| On spring reached target | Trigger when spring settles. |
| On spring stopped | Trigger when spring is stopped. |
| Has colour spring reached target | True when colour spring channels settle. |
| Is colour spring animating | True while colour spring channels animate. |
| Has transform spring reached target | True when transform channels settle. |
| Is transform spring animating | True while transform channels animate. |
| Is mesh sway enabled | True while constant mesh sway is active. |
| Is supported | True if mesh API is supported by object surface. |
| Is enabled | True if mesh simulation is enabled. |
| Is animating | True while mesh points are still in motion. |
| Has settled | True when mesh energy is below threshold. |
| On started | Trigger when mesh animation starts. |
| On settled | Trigger when mesh animation settles. |
| On unsupported | Trigger when mesh features are unavailable. |
| Has spring reached target (deprecated) | Legacy single-spring settled check. |
| Is constant spring enabled (deprecated) | Legacy constant enabled check. |
| Is spring animating (deprecated) | Legacy single-spring animation check. |
| Is behavior enabled (deprecated) | Legacy behavior enabled check. |
| On spring reached target (deprecated) | Legacy trigger. |
| On spring started (deprecated) | Legacy trigger. |
| On spring stopped (deprecated) | Legacy trigger. |

## 14. Expressions Reference

| Expression | Returns | Description |
|---|---|---|
| SpringValue("id") | number | Current value of named spring. |
| SpringVelocity("id") | number | Current velocity of named spring. |
| SpringFrom("id") | number | Current/last start value for named spring. |
| SpringTo("id") | number | Current target value for named spring. |
| SpringProgress("id") | number | Named spring progress in range 0-1. |
| SpringProperty("id", prop) | number | Named spring property (`stiffness`, `damping`, `precision`). |
| SpringEventId(mode) | string | Last triggered/completed spring ID context. |
| SpringCount | number | Number of springs in map. |
| SpringIdAt(index) | string | Spring ID at map iteration index. |
| ColourRed("id") | number | Current red channel 0-255. |
| ColourGreen("id") | number | Current green channel 0-255. |
| ColourBlue("id") | number | Current blue channel 0-255. |
| ColourHex("id") | string | Current colour in hex format. |
| ColourSpace("id") | string | Current colour space used by the named colour spring (`rgb`, `hsl`, or `hsv`). |
| TransformX("id") | number | Sprung X value. |
| TransformY("id") | number | Sprung Y value. |
| TransformZ("id") | number | Sprung Z value. |
| TransformWidth("id") | number | Sprung width value. |
| TransformHeight("id") | number | Sprung height value. |
| TransformDepth("id") | number | Sprung depth value. |
| TransformAngle("id") | number | Sprung angle value. |
| MeshEnergy | number | Aggregate mesh energy metric. |
| MeshPointCount | number | Total points in mesh grid. |
| MeshOffsetXAtIndex(i) | number | Mesh point X offset at index. |
| MeshOffsetYAtIndex(i) | number | Mesh point Y offset at index. |
| MeshCols | number | Mesh column count. |
| MeshRows | number | Mesh row count. |
| Value (deprecated) | number | Legacy default spring value. |
| Velocity (deprecated) | number | Legacy default spring velocity. |
| From (deprecated) | number | Legacy default spring start value. |
| To (deprecated) | number | Legacy default spring target value. |
| Progress (deprecated) | number | Legacy default spring progress. |
| Stiffness (deprecated) | number | Legacy default spring stiffness. |
| Damping (deprecated) | number | Legacy default spring damping. |
| Precision (deprecated) | number | Legacy default spring precision. |
| AlwaysSpringTarget (deprecated) | number | Legacy constant target value. |

## 15. Triggers Reference

| Trigger | Description |
|---|---|
| On spring started | Named spring starts animating. |
| On spring reached target | Named spring completes naturally. |
| On spring stopped | Named spring is stopped. |
| On started | Mesh animation starts. |
| On settled | Mesh animation settles. |
| On unsupported | Mesh operations are attempted on unsupported object surface. |

## 16. System Use Cases

### Spring Values System

Spring Values system manages named numeric springs you read with expressions.

Scenario: Keep UI score display chasing real score.

```text
Event: Player -> On score changed
  Action: HUD -> Start: Named spring -> "score", Current value, 0, Score, Value

Event: Every tick
  Action: ScoreText -> Set Text to int(HUD.SpringValue("score"))
```

Scenario: Use per-spring velocity impulse for recoil without extra objects.

```text
Event: Weapon -> On fired
  Action: Weapon -> Velocity: Add to named spring -> "recoil", 10

Event: Every tick
  Action: Weapon -> Start: Named spring -> "recoil", Current value, 0, 0, Value
  Action: Weapon -> Set Y to WeaponBaseY + Weapon.SpringValue("recoil")
```

Note: This pattern keeps control logic in one behavior instance and avoids extra tween state variables.

### Playback System

Playback system controls pause, resume, and stop lifecycle for named springs.

Scenario: Pause all spring motion during menu open.

```text
Event: PauseMenu -> On opened
  Action: Player -> Pause: All springs

Event: PauseMenu -> On closed
  Action: Player -> Resume: All springs
```

Scenario: Stop and clear temporary spring IDs after a one-shot effect.

```text
Event: FX -> On spring reached target
  Condition: FX.SpringEventId("last_completed") = "hit_flash"
  Action: FX -> Stop: Spring by ID -> "hit_flash"
```

Note: Stop by ID is useful for cleanup when a spring should not persist in the map.

### Colour System

Colour system springs RGB values and can auto-apply object colour.

Scenario: Damage tint that settles back.

```text
Event: Player -> On damaged
  Action: Player -> Start: Colour spring -> "damage", RGB, Current value, 0,0,0, 255,120,120, true
```

Scenario: Health bar colour tracks HP with constant spring target updates.

```text
Event: On start of layout
  Action: HealthBar -> Constant: Set colour spring -> "hp_colour", RGB, 0, 255, 0, true

Event: Every tick
  Action: HealthBar -> Constant: Set colour spring -> "hp_colour", RGB, (1 - HP / MaxHP) * 255, (HP / MaxHP) * 255, 0, true
```

Note: Constant colour spring consolidates old enabled and target workflows into one action.

### Transform System

Transform system covers position, size, and angle channels with optional auto-apply.

Scenario: Camera proxy follows player with constant position spring.

```text
Event: Every tick
  Action: CameraProxy -> Constant: Set position spring -> "cam", Player.X, Player.Y, 0, true
```

Scenario: Apply scale pop and angular tilt together on dash start.

```text
Event: Player -> On dash started
  Action: Player -> Apply Size spring -> "dash_scale", Player.Width, Player.Height, Player.Width * 1.15, Player.Height * 0.9, true
  Action: Player -> Velocity: Add to angle spring -> "dash_tilt", 18

Event: Player -> On dash ended
  Action: Player -> Apply Angle spring -> "dash_tilt", Player.Angle, 0, true
```

Note: Combining categories keeps each channel focused while sharing one behavior instance.

### Mesh System

Mesh system provides spring-based deformation with setup, effect, and state control.

Scenario: Land impact deformation with auto mesh.

```text
Event: Hero -> On landed
  Action: Hero -> Do Mesh Effect: Punch -> 0.5, 1.0, 0.25, 0.7, Smooth, Yes
```

Scenario: Use mesh support guard on mixed object selections.

```text
Event: For each SelectedObject
  Condition: SelectedObject -> Is supported
  Action: SelectedObject -> Do Mesh Effect: Wobble -> 0, 0.12, Yes
```

Note: Guarding by support avoids no-op calls on unsupported object surfaces.

## 17. Game Use Cases

### 1. Simple panel slide

Scenario: A menu panel springs from off-screen into place.

Layer structure:

```text
UI
  MenuPanel
```

```text
Event: Menu -> On opened
  Action: Panel -> Apply Position spring -> "panel", -600, 120, 0, 80, 120, 0, true
```

Tip: Use Start Value and End Value transform actions when you need reusable preset positions.

### 2. Camera smoothing

Scenario: Camera follows player with stable lag.

Layer structure:

```text
World
  Player
  CameraProxy
```

```text
Event: Every tick
  Action: CameraProxy -> Constant: Set position spring -> "follow", Player.X, Player.Y, 0, true
  Action: ScrollTo -> Scroll to CameraProxy.X, CameraProxy.Y
```

Tip: Set transform spring settings on the camera spring ID to tune responsiveness per layout.

### 3. Health bar colour ramp

Scenario: Health bar colour shifts toward red as health drops.

Layer structure:

```text
UI
  HealthBar
```

```text
Event: Every tick
  Action: HealthBar -> Constant: Set colour spring -> "hp", HSL, 120 * (HP / MaxHP), 100, 50, true
```

Tip: HSL gives smoother hue transitions than direct RGB for gradient ramps.

### 4. Weapon recoil

Scenario: Recoil impulse on shot.

Layer structure:

```text
World
  Gun
```

```text
Event: Gun -> On fired
  Action: Gun -> Velocity: Add to named spring -> "recoil", 12

Event: Every tick
  Action: Gun -> Start: Named spring -> "recoil", Current value, 0, 0, Value
  Action: Gun -> Set Y to GunBaseY + Gun.SpringValue("recoil")
```

Tip: This keeps recoil springing back naturally without dedicated reset logic.

### 5. UI pop

Scenario: Button press pop using size spring.

```text
Event: Button -> On clicked
  Action: Button -> Apply Size spring -> "pop", 1,1, 1.2,1.2, true

Event: Button -> On spring reached target
  Condition: Button.SpringEventId("last_completed") = "pop"
  Action: Button -> Apply Size spring -> "pop", Button.Width, Button.Height, Button.Width, Button.Height, true
```

Tip: Chain a return spring in completion trigger for clean two-phase pop animation.

### 6. Turret aim

Scenario: Continuous angular tracking.

```text
Event: Every tick
  Action: Turret -> Constant: Set angle spring -> "aim", angle(Turret.X, Turret.Y, Player.X, Player.Y), true
```

Tip: Use angle spring category for shortest-path rotation behavior.

### 7. Dash tilt

Scenario: Add angular velocity during dash burst.

```text
Event: Player -> On dash started
  Action: Player -> Velocity: Add to angle spring -> "tilt", 25

Event: Player -> On dash ended
  Action: Player -> Apply Angle spring -> "tilt", Player.Angle, 0, true
```

Tip: Velocity impulse plus explicit settle target gives responsive but controlled motion.

### 8. Floating collectible

Scenario: Up-down bob with playback controls.

```text
Event: Collectible -> On paused
  Action: Collectible -> Pause: Spring by ID -> "bob"

Event: Collectible -> On resumed
  Action: Collectible -> Resume: Spring by ID -> "bob"
```

Tip: Pause and resume preserve momentum and target state.

### 9. Hit deformation

Scenario: Sprite impact using preset.

```text
Event: Enemy -> On damaged
  Action: Enemy -> Do Mesh Effect: Preset combo -> Hit Impact, 1.0, 0.5, 0.5, 0, Yes
```

Tip: Preset combo is ideal for quick setup, then tune intensity per enemy class.

### 10. Cleanup edge case

Scenario: Remove temporary spring after animation ends.

```text
Event: FX -> On spring reached target
  Condition: FX.SpringEventId("last_completed") = "temp"
  Action: FX -> Manage: Remove spring -> "temp"
```

Tip: Removing short-lived spring IDs keeps SpringCount and iteration clean.

### 11. Save and load continuity

Scenario: In-progress spring motion restores after load.

```text
Event: SaveButton -> On clicked
  Action: System -> Save

Event: LoadButton -> On clicked
  Action: System -> Load
```

Tip: Spring map state, auto-apply ownership, and mesh state are restored by runtime save/load methods.

### 12. Combined colour and mesh hit feedback

Scenario: Enemy hit flashes colour and deforms mesh in the same frame.

Layer structure:

```text
World
  Enemy
```

```text
Event: Enemy -> On damaged
  Action: Enemy -> Start: Colour spring -> "hit_tint", RGB, Current value, 0,0,0, 255,140,140, true
  Action: Enemy -> Do Mesh Effect: Punch -> 0.5, 0.5, 0.2, 0.8, Smooth, Yes
```

Tip: This combination reads clearly even without extra particles.

### 27. Adaptive colour logic by colour space

Scenario: You have shared UI logic that behaves differently depending on whether a spring is configured in RGB, HSL, or HSV.

```text
Event: Every tick
  Condition: HUD.ColourSpace("hp") = "hsl"
  Action: DebugText -> Set Text to "HSL mode active"

Event: Every tick
  Condition: HUD.ColourSpace("hp") = "rgb"
  Action: DebugText -> Set Text to "RGB mode active"
```

Tip: This is useful for reusable UI/event logic where spring IDs can be configured differently per layout.

### 13. Card hand fan animation

Scenario: Cards entering hand spring to position and angle for a readable fan.

Layer structure:

```text
UI
  Card_0..Card_N
```

```text
Event: On card added to hand
  Action: Card -> Apply Position spring -> "hand_pos", Card.X, -200, 0, TargetX, TargetY, 0, true
  Action: Card -> Apply Angle spring -> "hand_rot", 0, TargetAngle, true
```

Tip: Use one spring ID per channel (`hand_pos`, `hand_rot`) so retargeting remains predictable.

### 14. Minimap ping pulse

Scenario: A minimap marker pulses size when a ping is placed.

```text
Event: Minimap -> On ping added
  Action: PingIcon -> Apply Size spring -> "ping_pop", 8, 8, 14, 14, true

Event: PingIcon -> On spring reached target
  Condition: PingIcon.SpringEventId("last_completed") = "ping_pop"
  Action: PingIcon -> Apply Size spring -> "ping_pop", PingIcon.Width, PingIcon.Height, 8, 8, true
```

Tip: For UI pulses, higher damping reduces distracting bounce in peripheral vision.

### 15. Dialogue choice highlight

Scenario: Focused dialogue option gets colour and size emphasis.

```text
Event: ChoiceItem -> On focused
  Action: ChoiceItem -> Start: Colour spring -> "focus_tint", RGB, Current value, 0, 0, 0, 255, 230, 170, true
  Action: ChoiceItem -> Apply Size spring -> "focus_size", ChoiceItem.Width, ChoiceItem.Height, ChoiceItem.Width * 1.05, ChoiceItem.Height * 1.05, true

Event: ChoiceItem -> On unfocused
  Action: ChoiceItem -> Start: Colour spring -> "focus_tint", RGB, Current value, 0, 0, 0, 255, 255, 255, true
```

Tip: Combining subtle tint and scale gives clear focus feedback without audio.

### 16. Companion follow lag

Scenario: A companion follows player with spring lag that feels alive.

```text
Event: Every tick
  Action: Companion -> Constant: Set position spring -> "follow", Player.X - 48, Player.Y + 16, 0, true
```

Tip: Lower stiffness and slightly lower damping creates soft follow motion for companions.

### 17. Boss weak-point warning

Scenario: Weak-point icon flashes before opening for damage.

```text
Event: Boss -> On weak-point about to open
  Action: WeakPointIcon -> Start: Colour spring -> "warn", RGB, Current value, 0, 0, 0, 255, 80, 80, true
  Action: WeakPointIcon -> Start: Named spring -> "alpha", Current value, 0, 255, Value

Event: Every tick
  Action: WeakPointIcon -> Set Opacity to WeakPointIcon.SpringValue("alpha")
```

Tip: Keep warning springs independent from gameplay hit springs to avoid accidental retargeting.

### 18. Projectile trail settle

Scenario: Trail segments settle toward path anchors with spring smoothing.

```text
Event: Every tick
  Action: Segment_0 -> Constant: Set position spring -> "trail", Projectile.X, Projectile.Y, 0, true
  Action: Segment_1 -> Constant: Set position spring -> "trail", Segment_0.X, Segment_0.Y, 0, true
  Action: Segment_2 -> Constant: Set position spring -> "trail", Segment_1.X, Segment_1.Y, 0, true
```

Tip: This produces chain-like drag without custom interpolation code.

### 19. Craft queue progress smoothing

Scenario: Craft progress bar value updates frequently but remains readable.

```text
Event: CraftSystem -> On progress changed
  Action: CraftUI -> Start: Named spring -> "craft_fill", Current value, 0, Progress01 * 100, Value

Event: Every tick
  Action: CraftBar -> Set Width to CraftUI.SpringValue("craft_fill")
```

Tip: Spring smoothing avoids tiny jitter from rapid server or simulation updates.

### 20. Fishing line tension wobble

Scenario: Bobber gets directional wobble on tension spikes.

```text
Event: Fishing -> On tension spike
  Action: Bobber -> Do Mesh Effect: Wobble -> RodAngle, 0.16, Yes
  Action: Bobber -> Velocity: Add to angle spring -> "bobber_tilt", 10
```

Tip: Combining mesh wobble and angle velocity sells tension better than either alone.

### 21. Building placement ghost feedback

Scenario: Placement ghost turns red and compresses when invalid, then recovers.

```text
Event: BuildGhost -> While placement invalid
  Action: BuildGhost -> Start: Colour spring -> "validity", RGB, Current value, 0,0,0, 255,130,130, true
  Action: BuildGhost -> Apply Size spring -> "validity_size", BuildGhost.Width, BuildGhost.Height, BuildGhost.Width * 0.95, BuildGhost.Height * 0.95, true

Event: BuildGhost -> While placement valid
  Action: BuildGhost -> Start: Colour spring -> "validity", RGB, Current value, 0,0,0, 255,255,255, true
```

Tip: Fast stiffness with high damping makes validity feedback crisp and readable.

### 22. Rhythm hit marker bounce

Scenario: Perfect hit marker pops and settles quickly on beat games.

```text
Event: Rhythm -> On perfect hit
  Action: HitMarker -> Velocity: Add to size spring -> "hit_pop", 6, 6
  Action: HitMarker -> Apply Size spring -> "hit_pop", HitMarker.Width, HitMarker.Height, HitMarker.Width * 1.2, HitMarker.Height * 1.2, true

Event: HitMarker -> On spring reached target
  Condition: HitMarker.SpringEventId("last_completed") = "hit_pop"
  Action: HitMarker -> Apply Size spring -> "hit_pop", HitMarker.Width, HitMarker.Height, BaseW, BaseH, true
```

Tip: Syncing spring starts to beat timing gives strong visual rhythm without extra animation assets.

### 23. Menu carousel snap

Scenario: A horizontal menu carousel snaps to selected index with spring easing.

Layer structure:

```text
UI
  CarouselRoot
  Item_0..Item_N
```

```text
Event: UI -> On carousel index changed
  Action: CarouselRoot -> Start: Named spring -> "carousel_x", Current value, 0, -Index * ItemSpacing, Value

Event: Every tick
  Action: CarouselRoot -> Set X to BaseX + CarouselRoot.SpringValue("carousel_x")
```

Tip: Keep one spring for root motion instead of one per item to reduce event complexity.

### 24. Checkpoint respawn settle

Scenario: Player respawns with fast position settle and colour fade-in.

```text
Event: Player -> On respawned
  Action: Player -> Apply Position spring -> "respawn_pos", Checkpoint.X, Checkpoint.Y - 120, 0, Checkpoint.X, Checkpoint.Y, 0, true
  Action: Player -> Start: Colour spring -> "respawn_tint", RGB, Current value, 0,0,0, 255,255,255, true
```

Tip: This gives readable respawn feedback without blocking player control.

### 25. Duration tuning with bounce profile

Scenario: One spring ID gets reused for different feel targets without hand-tuning stiffness/damping every time.

```text
Event: Player -> On entered water
  Action: Player -> Settings: Set spring from duration -> "cam_y", 0.7, 0.02, No bounce

Event: Player -> On dash started
  Action: Player -> Settings: Set spring from duration -> "cam_y", 0.25, 0.02, Very bouncy
```

Tip: Duration controls settle time, and bounce profile controls overshoot character.

### 26. Async sequencing for grouped springs

Scenario: A card intro needs Position + Angle grouped actions to run in order, waiting for the previous spring motion to fully settle first.

```text
Event: Card -> On revealed
  Action: Card -> Apply Position spring -> "reveal_pos", Card.X, -180, 0, TargetX, TargetY, 0, true  // async action waits for completion
  Action: Card -> Apply Angle spring -> "reveal_rot", -12, 0, true                                     // starts after previous settles
```

Tip: Grouped async actions now wait on all related channel springs for the spring ID, so sequencing matches tween-like expectations.

### Other game use cases

**Platformer**: Use position and angle springs for responsive character follow and impact tilt.

**Action RPG**: Drive UI bars and status colour transitions with named springs and colour spring actions.

**Shooter**: Combine recoil velocity impulses and crosshair spread springs for weapon feel.

**Puzzle**: Apply spring values to tile movement for satisfying settle motion.

**Racing**: Use angle and value springs for gauge needles and camera damping.

**Tower Defense**: Use mesh presets on enemy hit and spring values for UI economy counters.

**Visual Novel**: Use colour and size springs for portrait emphasis and dialogue panel transitions.

**Survival Crafting**: Use spring values for inventory and crafting queue counters that remain readable under frequent updates.

**Metroidvania**: Use angle and position springs to give doors, lifts, and map reveal widgets a weighted mechanical feel.

**Stealth**: Use subtle colour springs for suspicion indicators and low-amplitude mesh wobble for environmental disturbances.

**City Builder**: Use spring values to smooth population and resource deltas so dashboard numbers stay readable during spikes.

**Auto Battler**: Use transform size and colour springs on unit upgrades so tier changes stand out immediately.

**Tactics RPG**: Use position spring previews for movement paths and colour springs for threat overlays.

**Match-3**: Use named springs for combo counters and size pops on tile clears without creating temporary tween objects.

**Idle Game**: Use spring value smoothing for large-number counters to improve readability during rapid accumulation.

**Deckbuilder**: Use transform angle and position springs to fan cards and settle reshuffles smoothly.

**MOBA UI**: Use cooldown ring colour springs and subtle mesh punch on ultimate-ready notifications.

**Sports Game**: Use camera follow springs and UI pulse springs for momentum shifts, goals, and foul alerts.

**Horror**: Use low-frequency constant sway and occasional mesh jitter bursts for ambient unease in props.

**Educational Games**: Use spring-driven feedback on correct and incorrect answers to reinforce outcomes clearly.

**Point and Click Adventure**: Use transform and colour springs to highlight interactables and transition inventory panels.

**Bullet Hell**: Use recoil and crosshair spread springs to keep aim feedback responsive under dense projectile load.

**Farm Sim**: Use spring value smoothing for growth progress meters and harvest notifications.

**Party Game**: Use quick size and colour springs for score pips, prompts, and minigame round starts.

**Pinball**: Use velocity-based springs for UI multipliers and mesh impact presets on bumper hits.

**Roguelite**: Use spring chains for loot reveal and rarity colour transitions on pickup cards.

**Naval Combat**: Use camera lag springs and mesh wave effects on HUD elements for sea-state feel.

**Flight Arcade**: Use angle and position springs for cockpit UI drift and target marker stabilization.

**Social Simulation**: Use spring value smoothing for relationship meters and event notification cards.

**Typing Game**: Use hit marker size springs and colour springs for streak feedback.

**Time Management**: Use spring-driven queue and urgency indicators so task state changes remain legible.

**Platform Fighter**: Use mesh hit presets and angle springs for knockback readability and impact clarity.

**Dungeon Crawler**: Use transform position springs for room transition cards and minimap marker emphasis.

**Puzzle Platformer**: Use spring position and angle cues to make moving mechanisms feel physically coherent.

**Card Battler UI**: Use named springs for mana gem fills, hand spacing, and rarity glow adjustments.

**Arena Survival**: Use constant position spring cameras and colour warning springs for hazard telegraphs.

## 18. C3 Debugger

`_getDebuggerProperties` is implemented and exposes main spring and mesh sections.

### How to open

1. Run preview.
2. Open Construct debugger.
3. Select an instance with Simple Spring behavior.

### Fields

| Section | Field | Meaning |
|---|---|---|
| Main Spring Properties | isEnabled | Behavior enabled state. |
| Main Spring Properties | springCount | Total springs in map. |
| Main Spring Properties | Playing/Active Springs | Count of active running springs. |
| Main Spring Properties | Paused Springs | Count of paused springs. |
| Main Spring Properties | isAnimating | Default spring animating state. |
| Main Spring Properties | value/from/to/velocity | Default spring runtime values. |
| Main Spring Properties | stiffness/damping/precision | Default spring parameters. |
| Main Spring Properties | alwaysSpring | Default spring constant-mode state. |
| Main Spring Properties | lastSpringId | Last triggered spring ID. |
| Mesh Properties | enabled | Mesh enabled flag. |
| Mesh Properties | animating | Mesh animation state. |
| Mesh Properties | Mesh Grid | Grid size cols x rows. |
| Mesh Properties | energy | Current total mesh energy metric. |
| Mesh Properties | stiffness/damping/precision | Mesh simulation parameters. |

## 19. Scripting (C3 Script / JavaScript)

### Accessing the behavior

Behavior access is via project behavior name on the instance.

```js
const spring = inst.behaviors.Spring;
```

Use the behavior name configured in the project, not the addon ID string.

### Calling actions from script

ACE action methods are available in PascalCase from action filenames, and they execute the same runtime logic as event-sheet actions.

Exposure status is verified in this addon:

- Active ACEs use the default `expose = true` behavior from the CAW template.
- No non-deprecated ACEs are hidden from scripting.
- One deprecated action (`Core_Spring/a.SpringTo.js`) explicitly sets `expose = false`.

Method naming examples:

- `a.SpringNamed.js` -> `SpringNamed(...)`
- `a.ConstantSpring.js` -> `ConstantSpring(...)`
- `a.AddToTransformAngleVelocity.js` -> `AddToTransformAngleVelocity(...)`
- `a.MeshPresetCombo.js` -> `MeshPresetCombo(...)`

Combo parameters arrive as 0-based indices.

Common combo indices in this addon:

- Start mode: `0 = Current value`, `1 = From value`
- Value/Angle mode: `0 = Value`, `1 = Angle`
- Colour space: `0 = RGB`, `1 = HSL`, `2 = HSV`

```js
spring.SpringNamed("x", 0, 0, 320, 0);        // startMode, from, to, mode are combo/number params
spring.ConstantSpring("cam_x", player.x, 0);  // mode combo index: 0 = Value
spring.AddToSpringVelocity("cam_x", 8);
spring.ConstantTransformPosition("follow", player.x, player.y, 0, true);
spring.ConstantColour("hit", 0, 255, 120, 120, true);
spring.SpringTransformSize("ui_pop", 1, 1, 1.2, 1.2, true);
```

Additional category examples:

```js
// Spring Values
spring.SetSpringSettings("cam_x", 0.08, 0.86, 0.2);
spring.AddToSpringVelocity("cam_x", 6);

// Playback
spring.PauseSpring("cam_x");
spring.ResumeSpring("cam_x");

// Colour Spring
spring.SpringColour("hit", 0, 0, 0, 0, 0, 255, 120, 120, true);

// Transform categories
spring.ConstantTransformAngle("aim", 90, true);
spring.AddToTransformPositionVelocity("knock", 8, 0, 0);

// Mesh
spring.MeshPunch(0.5, 0.5, 0.2, 0.8, 1, "yes");
spring.MeshPresetCombo(0, 1.0, 0.5, 0.5, 0, "yes");
```

### Reading state from script

Expressions are event-sheet APIs, not script methods. For script reads, you either track your own data flow or use runtime methods exposed on the behavior instance.

If you call internal methods, treat them as runtime API and keep usage centralized so future refactors are easy.

```js
// Runtime helpers are underscore-prefixed implementation API.
const active = spring._getActiveSpringCount();
const paused = spring._getPausedSpringCount();
const lastId = spring._getLastSpringId();
const settled = spring._hasSpringReachedTarget("cam_x");
const value = spring._getSpringValue("cam_x");
const velocity = spring._getSpringVelocity("cam_x");
```

Useful runtime getters by group:

```js
// Spring map and IDs
spring._getSpringCount();
spring._getSpringIdAt(0);
spring._getLastSpringId();
spring._getLastCompletedSpringId();

// Named spring values
spring._getSpringValue("id");
spring._getSpringFrom("id");
spring._getSpringTo("id");
spring._getSpringVelocity("id");
spring._getSpringProgress("id");

// Mesh state
spring._isMeshEnabled();
spring._isMeshAnimating();
spring._getMeshEnergy();
spring._getMeshPointCount();
```

### Listening to events from script

The runtime instance exposes event methods:

```js
const onSpringStarted = () => {
  // read behavior runtime context or your own tracked IDs
};

spring.on("OnSpringStarted", onSpringStarted);
// later
spring.off("OnSpringStarted", onSpringStarted);
```

Supported trigger tags include:

- `OnSpringStarted`
- `OnSpringReachedTarget`
- `OnSpringStopped`
- `OnMeshStarted`
- `OnMeshSettled`
- `OnMeshUnsupported`

Mesh listener example:

```js
const onMeshUnsupported = () => {
  // fallback visual path
};

spring.on("OnMeshUnsupported", onMeshUnsupported);
```

### Looping patterns

If you want script-side iteration similar to SpringCount and SpringIdAt, use runtime methods:

```js
const count = spring._getSpringCount();
for (let i = 0; i < count; i++) {
  const id = spring._getSpringIdAt(i);
  const value = spring._getSpringValue(id);
  // use id/value
}
```

### Complete example

```js
class SpringController {
  constructor(inst) {
    this.spring = inst.behaviors.Spring;
    this._onReached = this._onReached.bind(this);
    this.spring.on("OnSpringReachedTarget", this._onReached);
  }

  followCamera(targetX, targetY) {
    this.spring.ConstantTransformPosition("cam", targetX, targetY, 0, true);
  }

  hitFlashAndPop() {
    this.spring.SpringColour("hit", 0, 0, 0, 0, 0, 255, 120, 120, true);
    this.spring.AddToTransformAngleVelocity("tilt", 14);
  }

  updateOverlay(score) {
    this.spring.SpringNamed("score", 0, 0, score, 0);
  }

  _onReached() {
    const last = this.spring._getLastCompletedSpringId();
    if (last === "hit") {
      this.spring.RemoveSpring("hit");
    }
  }

  destroy() {
    this.spring.off("OnSpringReachedTarget", this._onReached);
  }
}
```

Practical recommendation: call action methods freely from script, and keep underscore getter usage behind your own thin wrapper so future addon updates are easier to integrate.

## 20. Feature Deep-Dives

### Constant springs and ownership

For auto-apply groups (colour, position, size, angle), the latest constant/start call with apply enabled owns that group. If another spring ID is applied in the same group, it replaces previous ownership. This avoids conflicting writes to the same object property channels.

### Save and load behavior

The runtime serializes spring map state, last event IDs, auto-apply sets, and mesh state including points and sway parameters. Loading restores in-progress motion and rebuilds active spring tracking.

### Duration fit and bounce profile

Duration-based settings actions now include a **Bounce Profile** option:

- No bounce
- Balanced
- Bouncy
- Very bouncy

Use these when you want time-based tuning while keeping control over overshoot character.

```text
Event: UI -> On panel opened
  Action: Panel -> Settings: Set position spring from duration -> "panel", 0.35, 0.02, Balanced
  Action: Panel -> Apply Position spring -> "panel", -500, 120, 0, 80, 120, 0, true
```

### Async wait behavior for grouped springs

Async grouped actions now wait for the full grouped spring to settle before resolving when using the built-in wait queue.

```text
Event: RewardCard -> On shown
  Action: RewardCard -> Apply Size spring -> "intro", 0.8, 0.8, 1.1, 1.1, true
  Action: RewardCard -> Apply Size spring -> "intro", 1.1, 1.1, 1.0, 1.0, true
```

This pattern behaves like serialized tween steps without manual trigger plumbing.

### Mesh preset combos

`Do Mesh Effect: Preset combo` supports 11 presets:

- Hit Impact
- Heavy Slam
- Sword Trail
- Wind Gust
- Electric Stun
- Portal Spawn
- UI Pop
- Explosion Burst
- Jelly Bounce
- Whip Lash
- Teleport Glitch

## 21. Tips and Common Mistakes

- Use unique, stable spring IDs per behavior instance.
- Prefer `Constant: Set ... spring` actions over old enabled/target split workflows.
- Use playback actions for pause/resume/stop lifecycle control.
- Grouped start actions are combined now. Use one action with the final Apply To Property parameter instead of old separate "to properties" variants.
- Use duration-based settings with bounce profile to tune settle time and overshoot together.
- For transform and colour auto-apply, do not also manually set the same properties each tick unless intentional.
- Keep damping in the 0-1 range.
- Set lower precision only when you need tighter settle checks.
- Use `SpringEventId` in trigger handlers to disambiguate which spring fired.
- Call `Manage: Remove spring` for temporary IDs to keep the spring map clean.
- Use mesh support conditions or `On unsupported` trigger before relying on mesh effects across object types.
- Keep deprecated Core Spring usage only for legacy event sheets; new features should be in active categories.