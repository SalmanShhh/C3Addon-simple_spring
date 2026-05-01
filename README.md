<img src="./src/icon.svg" width="100" /><br>
# Simple Spring
<i>Simple numeric spring physics. Springs a value from a start to a target with velocity inheritance. now includes Mesh effects!</i> <br>
### Version 1.5.0.1

[<img src="https://placehold.co/200x50/4493f8/FFF?text=Download&font=montserrat" width="200"/>](https://github.com/SalmanShhh/C3Addon-simple_spring/releases/download/salmanshh_simple_spring-1.5.0.1.c3addon/salmanshh_simple_spring-1.5.0.1.c3addon)
<br>
<sub> [See all releases](https://github.com/SalmanShhh/C3Addon-simple_spring/releases) </sub> <br>

#### What's New in 1.5.0.1
**Changed:**
update short description to mention Mesh Effects


<sub>[View full changelog](#changelog)</sub>

---
<b><u>Author:</u></b> SalmanShh <br>
<sub>Made using [CAW](https://marketplace.visualstudio.com/items?itemName=skymen.caw) </sub><br>

## Table of Contents
- [Usage](#usage)
- [Examples Files](#examples-files)
- [Properties](#properties)
- [Actions](#actions)
- [Conditions](#conditions)
- [Expressions](#expressions)
---
## Usage
To build the addon, run the following commands:

```
npm i
npm run build
```

To run the dev server, run

```
npm i
npm run dev
```

## Examples Files
| Description | Download |
| --- | --- |
| Mesh Effects - Simple Spring Example | [<img src="https://placehold.co/120x30/4493f8/FFF?text=Download&font=montserrat" width="120"/>](https://github.com/SalmanShhh/C3Addon-simple_spring/raw/refs/heads/main/examples/Mesh%20Effects%20-%20Simple%20Spring%20Example.c3p) |
| simple-spring-examples  | [<img src="https://placehold.co/120x30/4493f8/FFF?text=Download&font=montserrat" width="120"/>](https://github.com/SalmanShhh/C3Addon-simple_spring/raw/refs/heads/main/examples/simple-spring-examples%20.c3p) |

---
## Properties
| Property Name | Description | Type |
| --- | --- | --- |
| Stiffness | How quickly spring responds, Increase stiffness for faster response. | float |
| Damping | How much oscillation is dampened (0-1), Increase damping to reduce overshoot. | float |
| Precision | Threshold to consider animation complete. Lower values require closer proximity to target. | float |
| Enabled | Enable or disable the spring behavior. | check |


---
## Actions
| Action | Description | Params
| --- | --- | --- |
| Add to velocity | Add a value to the spring's current velocity. | Value             *(number)* <br> |
| Reset to value | Instantly reset the spring value and clear velocity. Stops any active animation. | Value             *(number)* <br> |
| Set always spring to target | When enabled, the spring will continuously spring towards the target value even after reaching it. Useful for following a changing target. | Enabled             *(combo)* <br>Target             *(number)* <br>Mode             *(combo)* <br> |
| Set always spring target | Update the target for always spring mode without changing other settings. Only has an effect when always spring is enabled. | Target             *(number)* <br> |
| Set damping | Set spring damping (0-1). Higher values reduce oscillation. | Damping             *(number)* <br> |
| Set enabled | Enable or disable the spring behavior. | State             *(boolean)* <br> |
| Set precision | Set spring precision threshold (0.0001-1). | Precision             *(number)* <br> |
| Set stiffness | Set spring stiffness. Higher values increase responsiveness. | Stiffness             *(number)* <br> |
| Set velocity | Set the spring's current velocity. | Velocity             *(number)* <br> |
| Snap to target | Instantly jump to the target value. |  |
| Spring from/to | Spring numeric value from start to target. Inherits velocity if already animating. | From             *(number)* <br>To             *(number)* <br> |
| Spring from/to angle (deprecated) | Deprecated: use 'Spring to' with Angle mode instead. Spring angle value from start to target, taking the shortest path. | From             *(number)* <br>To             *(number)* <br> |
| Spring to | Spring to a target value from the current value. Inherits velocity if already animating. Use Angle mode to take the shortest rotational path. | To             *(number)* <br>Mode             *(combo)* <br> |
| Stop at current value | Stop the spring animation and keep the current value. |  |
| Mesh: Start constant sway | Start continuous sinusoidal sway. The mesh keeps swaying automatically each tick until Stop Constant Sway is called. Great for grass, plants, cloth, or flags. | Angle             *(number)* <br>Strength             *(number)* <br>Wavelength             *(number)* <br>Speed             *(number)* <br>Auto Mesh             *(combo)* <br> |
| Do Mesh Effect: Directional bend | Bend the mesh toward a direction with stronger motion on the leading edge. Great for wind push, recoil lean, and directional impact anticipation. | Angle             *(number)* <br>Strength             *(number)* <br>Radius             *(number)* <br>Falloff             *(combo)* <br>Auto Mesh             *(combo)* <br> |
| Do Mesh Effect: Impact trail wave | Create a directional banded wave from an impact path. Ideal for slash trails, dash wake distortion, and projectile fly-by pressure waves. | Origin X             *(number)* <br>Origin Y             *(number)* <br>Angle             *(number)* <br>Strength             *(number)* <br>Wavelength             *(number)* <br>Trail Width             *(number)* <br>Auto Mesh             *(combo)* <br> |
| Do Mesh Effect: Noise jitter burst | Apply randomized per-vertex impulse for electric shock, glitch hit, fear tremor, or explosion rattle, then spring back naturally. | Center X             *(number)* <br>Center Y             *(number)* <br>Strength             *(number)* <br>Radius             *(number)* <br>Falloff             *(combo)* <br>Auto Mesh             *(combo)* <br> |
| Do Mesh Effect: Preset combo | Apply a pre-configured combination of mesh effects tuned for specific game feel scenarios. Each preset blends 2–4 effects together. Intensity scales all effect strengths proportionally. | Preset             *(combo)* <br>Intensity             *(number)* <br>Impact X             *(number)* <br>Impact Y             *(number)* <br>Angle (degrees)             *(number)* <br>Auto Mesh             *(combo)* <br> |
| Do Mesh Effect: Punch | Blast all mesh vertices outward from a point, then spring back. Good for hit impacts, explosions, and shockwaves. | Impact X             *(number)* <br>Impact Y             *(number)* <br>Strength             *(number)* <br>Radius             *(number)* <br>Falloff             *(combo)* <br>Auto Mesh             *(combo)* <br> |
| Do Mesh Effect: Ripple | Emit concentric rings of alternating push/pull from an origin point, like a stone dropped in water. | Origin X             *(number)* <br>Origin Y             *(number)* <br>Strength             *(number)* <br>Wavelength             *(number)* <br>Decay             *(number)* <br>Auto Mesh             *(combo)* <br> |
| Do Mesh Effect: Shockwave | Emit a ring-shaped outward blast that peaks at a set distance from the origin. Unlike Punch, the center is unaffected — only the ring is hit. Good for bomb blasts and sonic booms. | Epicenter X             *(number)* <br>Epicenter Y             *(number)* <br>Strength             *(number)* <br>Ring Radius             *(number)* <br>Ring Width             *(number)* <br>Auto Mesh             *(combo)* <br> |
| Do Mesh Effect: Squash and stretch | Squeeze the sprite along one axis and bow it out along the other, then spring back. Classic animation squash/stretch principle. | Axis             *(combo)* <br>Amount             *(number)* <br>Pivot X             *(number)* <br>Pivot Y             *(number)* <br>Radius             *(number)* <br>Auto Mesh             *(combo)* <br> |
| Mesh: Stop constant sway | Stop the continuous sway. The mesh vertices spring back to rest naturally — OnMeshSettled fires when they come to a stop. |  |
| Do Mesh Effect: Twist | Swirl the mesh around a pivot in a rotational motion, then spring back. Good for portal effects, magic circles, spin attacks, and tornado impacts. | Pivot X             *(number)* <br>Pivot Y             *(number)* <br>Strength             *(number)* <br>Radius             *(number)* <br>Falloff             *(combo)* <br>Auto Mesh             *(combo)* <br> |
| Do Mesh Effect: Wave | Push parallel bands of vertices in alternating directions, like a flag rippling in wind. Vertices move perpendicular to the wave travel direction. | Angle             *(number)* <br>Strength             *(number)* <br>Wavelength             *(number)* <br>Auto Mesh             *(combo)* <br> |
| Do Mesh Effect: Wobble | Shear the mesh in a direction — one side pushes one way, the opposite side pushes back. Good for hit reactions, wind gusts, and attack wind-ups. | Angle             *(number)* <br>Strength             *(number)* <br>Auto Mesh             *(combo)* <br> |
| Mesh: Set auto mesh resolution | Set the number of columns and rows used when Auto Mesh = Yes automatically creates a mesh. Higher values produce smoother, more detailed deformation at the cost of CPU. Default is 5×5. For subtle UI effects 4×4 is fine. For smooth squash/stretch on large sprites use 8×8 or higher. | Columns             *(number)* <br>Rows             *(number)* <br> |
| Create grid | Create or replace a mesh grid on the instance and initialize mesh spring state. | Columns             *(number)* <br>Rows             *(number)* <br> |
| Destroy grid | Destroy the mesh and clear all mesh spring state. |  |
| Reset offsets | Reset all mesh point offsets and velocities back to rest. |  |
| Set damping | Set mesh spring damping. | Damping             *(number)* <br> |
| Set enabled | Enable or disable mesh spring simulation. | Enabled             *(boolean)* <br> |
| Set precision | Set mesh settle precision. | Precision             *(number)* <br> |
| Set stiffness | Set mesh spring stiffness. | Stiffness             *(number)* <br> |


---
## Conditions
| Condition | Description | Params
| --- | --- | --- |
| Has reached target | True if the spring has reached its target. |  |
| Is always spring enabled | True if always spring mode is currently enabled. |  |
| Is animating | True if the spring is currently animating. |  |
| Is enabled | True if the spring behavior is enabled. |  |
| On reached target | Triggered when the spring reaches its target. |  |
| On started | Triggered when the spring begins a new animation. |  |
| On stopped | Triggered when the spring is manually stopped via Stop or Snap to target. |  |
| Is mesh sway enabled | True while constant sway is running. Use this to check whether sway was started before starting it again, or to branch logic when sway is active. |  |
| Has settled | True if mesh motion is currently settled. |  |
| Is animating | True if mesh points are currently animating. |  |
| Is enabled | True if mesh spring simulation is enabled. |  |
| Is supported | True if the attached instance supports mesh API operations. |  |
| On settled | Triggered when mesh spring animation settles. |  |
| On started | Triggered when mesh spring animation starts. |  |
| On unsupported | Triggered when a mesh action is called on an instance that does not support mesh. |  |


---
## Expressions
| Expression | Description | Return Type | Params
| --- | --- | --- | --- |
| AlwaysSpringTarget | Get the current always spring target value. | number |  | 
| Damping | Get the current damping. | number |  | 
| From | Get the from (start) value. | number |  | 
| Precision | Get the current precision threshold. | number |  | 
| Progress | Get the animation progress from 0 (at start) to 1 (at target). | number |  | 
| Stiffness | Get the current stiffness. | number |  | 
| To | Get the to (target) value. | number |  | 
| Value | Get the current spring value. | number |  | 
| Velocity | Get the current velocity. | number |  | 
| MeshCols | Get current mesh column count. | number |  | 
| MeshEnergy | Total kinetic + displacement energy across all mesh points. Returns 0 when the mesh is fully at rest. Use this to check whether the mesh is still animating e.g. trigger a sound or effect only while energy > 0.01. | number |  | 
| MeshOffsetXAtIndex | Get mesh point X offset at index. | number | Index *(number)* <br> | 
| MeshOffsetYAtIndex | Get mesh point Y offset at index. | number | Index *(number)* <br> | 
| MeshPointCount | Get total mesh point count for Repeat loop workflows. | number |  | 
| MeshRows | Get current mesh row count. | number |  | 


---
## Changelog

### Version 1.5.0.1

**Changed:**
update short description to mention Mesh Effects

---

### Version 1.5.0.0

**Added:**
- ADDED MESH EFFECTS! (Ripple, Shockwave, Twist, Sway, Wobble, Directional Bend, etc)
- New ACE "MeshPresetCombo"  6 parameters (Preset, Intensity, CenterX/Y, Angle, AutoGrid) allowing you to apply pre-tuned effect combinations in one action call.
- Mesh effects 
- Mesh Effects Example project.

**Fixed:**
- ACEs now in Folder Structure, in line with the rest of my addons
---

### Version 1.4.0.0

**Added:**
- Added "Reset Value" clears all spring state to a given value
-  "stop At Current Value" and "Snap To Target" now fire "OnStopped" trigger
- _isAlwaysSpringEnabled() and _getAlwaysSpringTarget() functions.
-

**Fixed:**
- Takes deltatime from object instead of the runtime. (makes it so it animates correctly with the object's timescale).
- Removed always-spring's per-frame "_isAnimating = true", it now only re-wakes when the spring is actually not settled (dist ≥ precision or speed ≥ precision), no longer continuously running every frame.
- Debugger values editing fix.
- "set Stiffness" no longer clamps to 1,  only lower-bounds at 0.001, matching the properties.
- _setAlwaysSpringTarget() now wakes the animation when always-spring is active
---

### Version 1.3.0.0

**Added:**
Add new ACEs: actions (SpringTo, SetAlwaysSpring, SetAlwaysSpringTarget, SetEnabled, SetPrecision), condition (IsEnabled), trigger (OnStarted), and expressions (Progress, Precision). 

Runtime changes: add _isEnabled and gate ticking, implement _springTo (with angle handling), trigger OnStarted when animations start, add precision/enabled setters, always-spring target setter, progress calculation, include enabled in save/load, and expose new debug properties.

add Guide

---

### Version 1.2.0.0

**Added:**
Add new ACEs: actions (SpringTo, SetAlwaysSpring, SetAlwaysSpringTarget, SetEnabled, SetPrecision), condition (IsEnabled), trigger (OnStarted), and expressions (Progress, Precision). 

Runtime changes: add _isEnabled and gate ticking, implement _springTo (with angle handling), trigger OnStarted when animations start, add precision/enabled setters, always-spring target setter, progress calculation, include enabled in save/load, and expose new debug properties.

---

### Version 1.1.1.0

**Fixed:**
fix issue correctly fetching instance deltatime
---

### Version 1.1.0.0

**Changed:**
Rewrote the spring physics logic in instance.js to use fixed-step updates for framerate independence and smoother interpolation. Simplified and renamed internal state variables, improved angle handling, and consolidated finishing/reset logic. 

---

### Version 1.0.0.0

**Added:**
initial release, fix version ID

---

### Version 0.0.0.0

**Added:**
Initial release.

---
