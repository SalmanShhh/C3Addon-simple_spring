<img src="./src/icon.svg" width="100" /><br>
# Simple Spring
<i>Simple numeric spring physics with multiple named springs per behavior instance, plus object-level mesh effects.</i> <br>
### Version 1.6.0.1

[<img src="https://placehold.co/200x50/4493f8/FFF?text=Download&font=montserrat" width="200"/>](https://github.com/SalmanShhh/C3Addon-simple_spring/releases/download/salmanshh_simple_spring-1.6.0.1.c3addon/salmanshh_simple_spring-1.6.0.1.c3addon)
<br>
<sub> [See all releases](https://github.com/SalmanShhh/C3Addon-simple_spring/releases) </sub> <br>

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
| Apply spring colour to object | One-shot apply of the current sprung colour to the host object using supported runtime colour APIs. For fewer actions, use Spring/Reset colour ACEs with Apply To Object = Yes. | Spring ID             *(string)* <br> |
| Reset colour spring | Instantly reset all channels of a named colour spring to a value using the selected colour space, with optional object apply. | Spring ID             *(string)* <br>Colour Space             *(combo)* <br>Channel 1             *(number)* <br>Channel 2             *(number)* <br>Channel 3             *(number)* <br>Use For Instance             *(combo)* <br> |
| Set colour spring settings | Set stiffness, damping, and precision for all three channels of a named colour spring. | Spring ID             *(string)* <br>Stiffness             *(number)* <br>Damping             *(number)* <br>Precision             *(number)* <br> |
| Spring colour | Combined colour spring action for current-to-target or from-to workflows, with instance toggle. | Spring ID             *(string)* <br>Colour Space             *(combo)* <br>Start Mode             *(combo)* <br>From Channel 1             *(number)* <br>From Channel 2             *(number)* <br>From Channel 3             *(number)* <br>To Channel 1             *(number)* <br>To Channel 2             *(number)* <br>To Channel 3             *(number)* <br>Use For Instance             *(combo)* <br> |
| Stop colour spring | Stop all channels of a named colour spring at their current values. | Spring ID             *(string)* <br> |
| Add to velocity | Deprecated. Use 'Add to spring velocity' in the Multi Spring category instead. | Value             *(number)* <br> |
| Reset to value | Deprecated. Use 'Reset spring' in the Multi Spring category instead. | Value             *(number)* <br> |
| Set always spring to target | Deprecated. Use 'Set always spring' in the Multi Spring category instead. | Enabled             *(combo)* <br>Target             *(number)* <br>Mode             *(combo)* <br> |
| Set always spring target | Deprecated. Use 'Set always spring target' in the Multi Spring category instead. | Target             *(number)* <br> |
| Set damping | Deprecated. Use 'Set spring settings' in the Multi Spring category instead. | Damping             *(number)* <br> |
| Set enabled | Deprecated. Enables or disables the entire behavior. There is no Multi Spring equivalent — use this if you need to pause all springs on an object. | State             *(boolean)* <br> |
| Set precision | Deprecated. Use 'Set spring settings' in the Multi Spring category instead. | Precision             *(number)* <br> |
| Set stiffness | Deprecated. Use 'Set spring settings' in the Multi Spring category instead. | Stiffness             *(number)* <br> |
| Set velocity | Deprecated. Use 'Set spring velocity' in the Multi Spring category instead. | Velocity             *(number)* <br> |
| Snap to target | Deprecated. Use 'Snap spring to target' in the Multi Spring category instead. |  |
| Spring from/to | Deprecated. Use 'Spring from/to' in the Multi Spring category instead. | From             *(number)* <br>To             *(number)* <br> |
| Spring from/to angle (deprecated) | Deprecated. Use 'Spring to' in the Multi Spring category with Angle mode instead. | From             *(number)* <br>To             *(number)* <br> |
| Spring to | Deprecated. Use 'Spring to' in the Multi Spring category instead. | To             *(number)* <br>Mode             *(combo)* <br> |
| Stop at current value | Deprecated. Use 'Stop spring' in the Multi Spring category instead. |  |
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
| Add to spring velocity | Add velocity to a named spring. | Spring ID             *(string)* <br>Velocity             *(number)* <br> |
| Configure always spring | Combined always-spring action for enable/disable and target updates. | Spring ID             *(string)* <br>Operation             *(combo)* <br>Target             *(number)* <br>Mode             *(combo)* <br> |
| Remove spring | Remove a named spring and its state. The legacy default spring is reset instead of removed. | Spring ID             *(string)* <br> |
| Reset spring | Reset a named spring to a specific value without animating. | Spring ID             *(string)* <br>Value             *(number)* <br> |
| Set spring settings | Override stiffness, damping, and precision for a named spring. | Spring ID             *(string)* <br>Stiffness             *(number)* <br>Damping             *(number)* <br>Precision             *(number)* <br> |
| Set spring velocity | Directly set the current velocity of a named spring. | Spring ID             *(string)* <br>Velocity             *(number)* <br> |
| Snap spring to target | Finish a named spring immediately at its target value. | Spring ID             *(string)* <br> |
| Spring named | Combined spring action for from-to and current-to-target workflows. | Spring ID             *(string)* <br>Start Mode             *(combo)* <br>From             *(number)* <br>To             *(number)* <br>Mode             *(combo)* <br> |
| Stop spring | Stop a named spring immediately at its current value. | Spring ID             *(string)* <br> |
| Set transform spring settings | Set stiffness, damping, and precision for a transform spring type. | Spring ID             *(string)* <br>Transform Type             *(combo)* <br>Stiffness             *(number)* <br>Damping             *(number)* <br>Precision             *(number)* <br> |
| Spring transform angle | Combined angle spring action using current-to-target or from-to with value/angle mode, plus instance toggle. | Spring ID             *(string)* <br>Start Mode             *(combo)* <br>From Angle             *(number)* <br>To Angle             *(number)* <br>Angle Mode             *(combo)* <br>Use For Instance             *(combo)* <br> |
| Spring transform XY | Combined spring action for Position/Size using current-to-target or from-to, with instance toggle. | Spring ID             *(string)* <br>Transform Type             *(combo)* <br>Start Mode             *(combo)* <br>From A             *(number)* <br>From B             *(number)* <br>To A             *(number)* <br>To B             *(number)* <br>Use For Instance             *(combo)* <br> |
| Stop transform spring | Stop a transform spring and disable its auto-apply. | Spring ID             *(string)* <br>Transform Type             *(combo)* <br> |


---
## Conditions
| Condition | Description | Params
| --- | --- | --- |
| Has colour spring reached target | True if all channels in the named colour spring have reached their targets. | Spring ID *(string)* <br> |
| Is colour spring animating | True if any channel in the named colour spring is animating. | Spring ID *(string)* <br> |
| Has reached target | Deprecated. Use 'Has spring reached target' in the Multi Spring category instead. |  |
| Is always spring enabled | Deprecated. Use 'Is always spring enabled' in the Multi Spring category instead. |  |
| Is animating | Deprecated. Use 'Is spring animating' in the Multi Spring category instead. |  |
| Is enabled | Deprecated. Checks if the entire behavior is enabled. There is no Multi Spring equivalent — use this if you need to check the behavior-level enabled state. |  |
| On reached target | Deprecated. Use 'On spring reached target' in the Multi Spring category instead. |  |
| On started | Deprecated. Use 'On spring started' in the Multi Spring category instead. |  |
| On stopped | Deprecated. Use 'On spring stopped' in the Multi Spring category instead. |  |
| Is mesh sway enabled | True while constant sway is running. Use this to check whether sway was started before starting it again, or to branch logic when sway is active. |  |
| Has settled | True if mesh motion is currently settled. |  |
| Is animating | True if mesh points are currently animating. |  |
| Is enabled | True if mesh spring simulation is enabled. |  |
| Is supported | True if the attached instance supports mesh API operations. |  |
| On settled | Triggered when mesh spring animation settles. |  |
| On started | Triggered when mesh spring animation starts. |  |
| On unsupported | Triggered when a mesh action is called on an instance that does not support mesh. |  |
| Has spring reached target | True if the named spring has settled at its target. | Spring ID *(string)* <br> |
| Is always spring enabled | True if the named spring is in always spring mode. | Spring ID *(string)* <br> |
| Is spring animating | True if the named spring is currently animating. | Spring ID *(string)* <br> |
| On spring reached target | Triggered when a named spring settles at its target. Leave the id empty to catch any spring. | Spring ID *(string)* <br> |
| On spring started | Triggered when a named spring begins animating. Leave the id empty to catch any spring. | Spring ID *(string)* <br> |
| On spring stopped | Triggered when a named spring is stopped or snapped. Leave the id empty to catch any spring. | Spring ID *(string)* <br> |
| Has transform spring reached target | True if the selected transform spring has reached its target. | Spring ID *(string)* <br>Transform Type *(combo)* <br> |
| Is transform spring animating | True if the selected transform spring is currently animating. | Spring ID *(string)* <br>Transform Type *(combo)* <br> |


---
## Expressions
| Expression | Description | Return Type | Params
| --- | --- | --- | --- |
| ColourBlue | Get the current blue channel (0-255) of a named colour spring. | number | Spring ID *(string)* <br> | 
| ColourGreen | Get the current green channel (0-255) of a named colour spring. | number | Spring ID *(string)* <br> | 
| ColourHex | Get the current colour of a named spring as a #RRGGBB string. | string | Spring ID *(string)* <br> | 
| ColourRed | Get the current red channel (0-255) of a named colour spring. | number | Spring ID *(string)* <br> | 
| AlwaysSpringTarget | Deprecated. There is no direct Multi Spring replacement — always spring target is managed via 'Set always spring' and 'Set always spring target' actions. | number |  | 
| Damping | Deprecated. Use SpringDamping("id") in the Multi Spring category instead. | number |  | 
| From | Deprecated. Use SpringFrom("id") in the Multi Spring category instead. | number |  | 
| Precision | Deprecated. Use SpringPrecision("id") in the Multi Spring category instead. | number |  | 
| Progress | Deprecated. Use SpringProgress("id") in the Multi Spring category instead. | number |  | 
| Stiffness | Deprecated. Use SpringStiffness("id") in the Multi Spring category instead. | number |  | 
| To | Deprecated. Use SpringTo("id") in the Multi Spring category instead. | number |  | 
| Value | Deprecated. Use SpringValue("id") in the Multi Spring category instead. | number |  | 
| Velocity | Deprecated. Use SpringVelocity("id") in the Multi Spring category instead. | number |  | 
| MeshCols | Get current mesh column count. | number |  | 
| MeshEnergy | Total kinetic + displacement energy across all mesh points. Returns 0 when the mesh is fully at rest. Use this to check whether the mesh is still animating e.g. trigger a sound or effect only while energy > 0.01. | number |  | 
| MeshOffsetXAtIndex | Get mesh point X offset at index. | number | Index *(number)* <br> | 
| MeshOffsetYAtIndex | Get mesh point Y offset at index. | number | Index *(number)* <br> | 
| MeshPointCount | Get total mesh point count for Repeat loop workflows. | number |  | 
| MeshRows | Get current mesh row count. | number |  | 
| SpringCount | Get how many named springs currently exist on this behavior instance. | number |  | 
| SpringEventId | Get recent spring event ids. | string | Event Type *(string)* <br> | 
| SpringFrom | Get the starting value of a named spring. | number | Spring ID *(string)* <br> | 
| SpringIdAt | Get a spring id by zero-based index. | string | Index *(number)* <br> | 
| SpringProgress | Get progress from 0 to 1 for a named spring. | number | Spring ID *(string)* <br> | 
| SpringProperty | Get stiffness, damping, or precision of a named spring. | number | Spring ID *(string)* <br>Property *(string)* <br> | 
| SpringTo | Get the target value of a named spring. | number | Spring ID *(string)* <br> | 
| SpringValue | Get the current value of a named spring. | number | Spring ID *(string)* <br> | 
| SpringVelocity | Get the current velocity of a named spring. | number | Spring ID *(string)* <br> | 
| TransformAngle | Get the current sprung angle value for a transform angle spring. | number | Spring ID *(string)* <br> | 
| TransformHeight | Get the current sprung height value for a transform size spring. | number | Spring ID *(string)* <br> | 
| TransformWidth | Get the current sprung width value for a transform size spring. | number | Spring ID *(string)* <br> | 
| TransformX | Get the current sprung X value for a transform position spring. | number | Spring ID *(string)* <br> | 
| TransformY | Get the current sprung Y value for a transform position spring. | number | Spring ID *(string)* <br> | 


---
## Changelog

### Version 1.6.0.1

---

### Version 1.6.0.0

**Added:**
- Added Colour Springing ACEs.
- Added Transform Springing ACEs.
- Added Multi-Springing Support.
- Added More Mesh Effect Presets (Explosion Burst, Jelly Bounce, Whip Lash, Teleport Glitch).

**Changed:**
- Core Springing ACEs have been deprecated but still work, shouldn't show up anymore in the editor and descriptions will tell you an alternative ACEs to use.
- Colour Springing: only one active ID can drive object colour at a time
- Transform: one active ID each for Position, Size, and Angle

---

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
