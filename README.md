<img src="./src/icon.svg" width="100" /><br>
# Simple Spring
<i>Simple numeric spring physics with multiple named springs per behavior instance, plus object-level mesh effects.</i> <br>
### Version 2.0.0.2

[<img src="https://placehold.co/200x50/4493f8/FFF?text=Download&font=montserrat" width="200"/>](https://github.com/SalmanShhh/C3Addon-simple_spring/releases/download/salmanshh_simple_spring-2.0.0.2.c3addon/salmanshh_simple_spring-2.0.0.2.c3addon)
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
| (uses deprecated ACEs now) simple-spring-examples  | [<img src="https://placehold.co/120x30/4493f8/FFF?text=Download&font=montserrat" width="120"/>](https://github.com/SalmanShhh/C3Addon-simple_spring/raw/refs/heads/main/examples/(uses%20deprecated%20ACEs%20now)%20simple-spring-examples%20.c3p) |
| Mesh Effects - Simple Spring Example | [<img src="https://placehold.co/120x30/4493f8/FFF?text=Download&font=montserrat" width="120"/>](https://github.com/SalmanShhh/C3Addon-simple_spring/raw/refs/heads/main/examples/Mesh%20Effects%20-%20Simple%20Spring%20Example.c3p) |
| Transforms & Colours - Simple Spring  | [<img src="https://placehold.co/120x30/4493f8/FFF?text=Download&font=montserrat" width="120"/>](https://github.com/SalmanShhh/C3Addon-simple_spring/raw/refs/heads/main/examples/Transforms%20&%20Colours%20-%20Simple%20Spring%20.c3p) |

---
## Properties
| Property Name | Description | Type |
| --- | --- | --- |
| Default Stiffness | Default stiffness applied to newly created springs. How quickly the spring responds - increase for faster response. | float |
| Default Damping | Default damping applied to newly created springs (0-1). Increase to reduce overshoot and oscillation. | float |
| Default Precision | Default precision applied to newly created springs. Threshold to consider animation complete - lower values require closer proximity to target. | float |
| Enabled | Enable or disable the spring behavior. | check |


---
## Actions
| Action | Description | Params
| --- | --- | --- |
| Apply Constant: Set colour spring | Enable or update a constant colour spring, springing toward the given target each tick. New springs inherit the behavior's default stiffness, damping, and precision. Use the Settings ACE to override per spring. Use Pause/Stop playback ACEs to deactivate. | Spring ID             *(string)* <br>Colour Space             *(combo)* <br>Target Channel 1             *(number)* <br>Target Channel 2             *(number)* <br>Target Channel 3             *(number)* <br>Apply To Properties             *(boolean)* <br> |
| Settings: Set colour spring | Set stiffness, damping, and precision for all three channels of a named colour spring. | Spring ID             *(string)* <br>Stiffness             *(number)* <br>Damping             *(number)* <br>Precision             *(number)* <br> |
| Settings: Set colour spring from duration | Compute stiffness and damping so a colour spring settles in about the requested duration, with a selectable bounce profile. | Spring ID             *(string)* <br>Duration             *(number)* <br>Precision             *(number)* <br>Bounce Profile             *(combo)* <br> |
| Apply Colour spring | Combined colour spring action for current-to-target or from-to workflows with optional apply-to-properties. | Spring ID             *(string)* <br>Colour Space             *(combo)* <br>Start Mode             *(combo)* <br>From Channel 1             *(number)* <br>From Channel 2             *(number)* <br>From Channel 3             *(number)* <br>To Channel 1             *(number)* <br>To Channel 2             *(number)* <br>To Channel 3             *(number)* <br>Apply To Properties             *(boolean)* <br> |
| Add to velocity | Deprecated. Use 'Velocity: Add to named spring' in the Multi Spring category instead. | Value             *(number)* <br> |
| Reset to value | Deprecated. Use the Multi Spring category to set a named spring's start value or recreate the spring instead. | Value             *(number)* <br> |
| Set always spring to target | Deprecated. Use 'Constant: Set spring' in the Multi Spring category instead. | Enabled             *(combo)* <br>Target             *(number)* <br>Mode             *(combo)* <br> |
| Set always spring target | Deprecated. Use 'Constant: Set spring' in the Multi Spring category instead. | Target             *(number)* <br> |
| Set damping | Deprecated. Use 'Settings: Set spring' in the Multi Spring category instead. | Damping             *(number)* <br> |
| Set enabled | Deprecated. Enables or disables the entire behavior. There is no direct Multi Spring equivalent; use this only when you need to pause all springs on an object. | State             *(boolean)* <br> |
| Set precision | Deprecated. Use 'Settings: Set spring' in the Multi Spring category instead. | Precision             *(number)* <br> |
| Set stiffness | Deprecated. Use 'Settings: Set spring' in the Multi Spring category instead. | Stiffness             *(number)* <br> |
| Set velocity | Deprecated. Use 'Velocity: Set named spring' in the Multi Spring category instead. | Velocity             *(number)* <br> |
| Snap to target | Deprecated. Use the Multi Spring Playback category to snap or clear a named spring instead. |  |
| Spring from/to | Deprecated. Use 'Start: Named spring' in the Multi Spring category instead. | From             *(number)* <br>To             *(number)* <br> |
| Spring from/to angle (deprecated) | Deprecated. Use 'Start: Named spring' in the Multi Spring category with Angle mode instead. | From             *(number)* <br>To             *(number)* <br> |
| Spring to | Deprecated. Use 'Start: Named spring' in the Multi Spring category instead. | To             *(number)* <br>Mode             *(combo)* <br> |
| Stop at current value | Deprecated. Use the Multi Spring Playback category to stop or clear a named spring instead. |  |
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
| Velocity: Add to named spring | Add an impulse to a named spring's current velocity. | Spring ID             *(string)* <br>Velocity             *(number)* <br> |
| Apply Constant: Set spring | Enable or update a constant named spring, springing toward the given target each tick. New springs inherit the behavior's default stiffness, damping, and precision. Use the Settings ACE to override per spring. Use Pause/Stop playback ACEs to deactivate. | Spring ID             *(string)* <br>Target             *(number)* <br> |
| Debug: Log active springs | Output a table of currently active springs and state values to the browser console. |  |
| Manage: Remove spring | Remove a named spring and its state. The legacy default spring is reset instead of removed. | Spring ID             *(string)* <br> |
| Settings: Set spring | Override stiffness, damping, and precision for a named spring. New springs inherit the behavior's default stiffness, damping, and precision set in the properties panel. | Spring ID             *(string)* <br>Stiffness             *(number)* <br>Damping             *(number)* <br>Precision             *(number)* <br> |
| Settings: Set spring from duration | Compute stiffness and damping so a named spring settles in about the requested duration, with a selectable bounce profile. | Spring ID             *(string)* <br>Duration             *(number)* <br>Precision             *(number)* <br>Bounce Profile             *(combo)* <br> |
| Velocity: Set named spring | Set the current velocity of a named spring directly. | Spring ID             *(string)* <br>Velocity             *(number)* <br> |
| Apply spring | Spring a named value from a start point to a target. New springs inherit the behavior's default stiffness, damping, and precision. Use the Settings ACE to override per spring. | Spring ID             *(string)* <br>Start Mode             *(combo)* <br>From             *(number)* <br>To             *(number)* <br>Mode             *(combo)* <br> |
| Pause: All springs | Pause all active springs. |  |
| Pause: Spring by ID | Pause a spring by ID if it is active. | Spring ID             *(string)* <br> |
| Resume: All springs | Resume all paused springs. |  |
| Resume: Spring by ID | Resume a previously paused spring by ID. | Spring ID             *(string)* <br> |
| Stop: All springs | Stop and clear all springs. |  |
| Stop: Spring by ID | Clear a spring by ID. | Spring ID             *(string)* <br> |
| Velocity: Add to angle spring | Add angular velocity to a transform angle spring. | Spring ID             *(string)* <br>Angular Velocity             *(number)* <br> |
| Apply Constant: Set angle spring | Enable or update a constant angle spring, springing toward the given target each tick. New springs inherit the behavior's default stiffness, damping, and precision. Use the Settings ACE to override per spring. Use Pause/Stop playback ACEs to deactivate. | Spring ID             *(string)* <br>Target Angle             *(number)* <br>Apply To Properties             *(boolean)* <br> |
| Settings: Set angle spring from duration | Compute stiffness and damping so an angle spring settles in about the requested duration, with a selectable bounce profile. | Spring ID             *(string)* <br>Duration             *(number)* <br>Precision             *(number)* <br>Bounce Profile             *(combo)* <br> |
| End Value: Transform angle spring | Overwrite the end value of a transform angle spring. | Spring ID             *(string)* <br>End Angle             *(number)* <br> |
| Start Value: Transform angle spring | Overwrite the start value of a transform angle spring. | Spring ID             *(string)* <br>Start Angle             *(number)* <br> |
| Apply Angle spring | Combined angle spring action using explicit start and end values, with optional apply-to-properties. | Spring ID             *(string)* <br>From Angle             *(number)* <br>To Angle             *(number)* <br>Apply To Properties             *(boolean)* <br> |
| Velocity: Add to position spring | Add a velocity impulse to a transform position spring. | Spring ID             *(string)* <br>Velocity X             *(number)* <br>Velocity Y             *(number)* <br>Velocity Z             *(number)* <br> |
| Apply Constant: Set position spring | Enable or update a constant position spring, springing toward the given target each tick. New springs inherit the behavior's default stiffness, damping, and precision. Use the Settings ACE to override per spring. Use Pause/Stop playback ACEs to deactivate. | Spring ID             *(string)* <br>Target X             *(number)* <br>Target Y             *(number)* <br>Target Z             *(number)* <br>Apply To Properties             *(boolean)* <br> |
| Settings: Set position spring from duration | Compute stiffness and damping so a position spring settles in about the requested duration, with a selectable bounce profile. | Spring ID             *(string)* <br>Duration             *(number)* <br>Precision             *(number)* <br>Bounce Profile             *(combo)* <br> |
| End Value: Transform position spring | Overwrite the end value of a transform position spring. | Spring ID             *(string)* <br>End X             *(number)* <br>End Y             *(number)* <br>End Z             *(number)* <br> |
| Start Value: Transform position spring | Overwrite the start value of a transform position spring. | Spring ID             *(string)* <br>Start X             *(number)* <br>Start Y             *(number)* <br>Start Z             *(number)* <br> |
| Settings: Set transform spring | Set stiffness, damping, and precision for a transform spring. | Spring ID             *(string)* <br>Stiffness             *(number)* <br>Damping             *(number)* <br>Precision             *(number)* <br> |
| Apply Position spring | Position spring action using explicit start and end values, including optional Z channel, with optional apply-to-properties. | Spring ID             *(string)* <br>From X             *(number)* <br>From Y             *(number)* <br>From Z             *(number)* <br>To X             *(number)* <br>To Y             *(number)* <br>To Z             *(number)* <br>Apply To Properties             *(boolean)* <br> |
| Velocity: Add to size spring | Add a velocity impulse to a transform size spring. | Spring ID             *(string)* <br>Velocity Width             *(number)* <br>Velocity Height             *(number)* <br> |
| Apply Constant: Set size spring | Enable or update a constant size spring, springing toward the given target each tick. New springs inherit the behavior's default stiffness, damping, and precision. Use the Settings ACE to override per spring. Use Pause/Stop playback ACEs to deactivate. | Spring ID             *(string)* <br>Target Width             *(number)* <br>Target Height             *(number)* <br>Apply To Properties             *(boolean)* <br> |
| Settings: Set size spring from duration | Compute stiffness and damping so a size spring settles in about the requested duration, with a selectable bounce profile. | Spring ID             *(string)* <br>Duration             *(number)* <br>Precision             *(number)* <br>Bounce Profile             *(combo)* <br> |
| End Value: Transform size spring | Overwrite the end value of a transform size spring. | Spring ID             *(string)* <br>End Width             *(number)* <br>End Height             *(number)* <br> |
| Start Value: Transform size spring | Overwrite the start value of a transform size spring. | Spring ID             *(string)* <br>Start Width             *(number)* <br>Start Height             *(number)* <br> |
| Apply Size spring | Size spring action using explicit start and end values, with optional apply-to-properties. | Spring ID             *(string)* <br>From Width             *(number)* <br>From Height             *(number)* <br>To Width             *(number)* <br>To Height             *(number)* <br>Apply To Properties             *(boolean)* <br> |


---
## Conditions
| Condition | Description | Params
| --- | --- | --- |
| Has colour spring reached target | True if all channels in the named colour spring have reached their targets. | Spring ID *(string)* <br> |
| Is colour spring animating | True if any channel in the named colour spring is animating. | Spring ID *(string)* <br> |
| Has reached target | Deprecated. Use 'Has spring reached target' in the Multi Spring category instead. |  |
| Is always spring enabled | Deprecated. Use 'Is constant spring enabled' in the Multi Spring category instead. |  |
| Is animating | Deprecated. Use 'Is spring animating' in the Multi Spring category instead. |  |
| Is enabled | Deprecated. Checks if the entire behavior is enabled. There is no direct Multi Spring equivalent; use this only when you need the behavior-level enabled state. |  |
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
| On spring reached target | True if the named spring has settled at its target. | Spring ID *(string)* <br> |
| Is constant spring enabled | True if the named spring is running in constant (always-on) mode. | Spring ID *(string)* <br> |
| Is spring animating | True if the named spring is currently animating. | Spring ID *(string)* <br> |
| Is spring constant | True if the named spring is currently configured as a constant spring. | Spring ID *(string)* <br> |
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
| ColourSpace | Get the current colour space used by a named colour spring (rgb, hsl, or hsv). | string | Spring ID *(string)* <br> | 
| AlwaysSpringTarget | Deprecated. There is no direct Multi Spring expression replacement. Use 'Constant: Set spring' in the Multi Spring category to manage the target instead. | number |  | 
| Damping | Deprecated. Use the Multi Spring category expression SpringDamping("id") instead. | number |  | 
| From | Deprecated. Use the Multi Spring category expression SpringFrom("id") instead. | number |  | 
| Precision | Deprecated. Use the Multi Spring category expression SpringPrecision("id") instead. | number |  | 
| Progress | Deprecated. Use the Multi Spring category expression SpringProgress("id") instead. | number |  | 
| Stiffness | Deprecated. Use the Multi Spring category expression SpringStiffness("id") instead. | number |  | 
| To | Deprecated. Use the Multi Spring category expression SpringTo("id") instead. | number |  | 
| Value | Deprecated. Use the Multi Spring category expression SpringValue("id") instead. | number |  | 
| Velocity | Deprecated. Use the Multi Spring category expression SpringVelocity("id") instead. | number |  | 
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
| SpringTimeToTargetSeconds | Estimate how long in seconds a named spring will take to settle at its target from its current state. Returns 0 if already settled or spring missing, or -1 if not settled within the simulation window. | number | Spring ID *(string)* <br> | 
| SpringTo | Get the target value of a named spring. | number | Spring ID *(string)* <br> | 
| SpringValue | Get the current value of a named spring. | number | Spring ID *(string)* <br> | 
| SpringVelocity | Get the current velocity of a named spring. | number | Spring ID *(string)* <br> | 
| TransformAngle | Get the current sprung angle value for a transform angle spring. | number | Spring ID *(string)* <br> | 
| TransformX | Get the current sprung X value for a transform position spring. | number | Spring ID *(string)* <br> | 
| TransformY | Get the current sprung Y value for a transform position spring. | number | Spring ID *(string)* <br> | 
| TransformZ | Get the current sprung Z value for a transform position spring. | number | Spring ID *(string)* <br> | 
| TransformDepth | Get the current sprung depth value for a transform size spring. | number | Spring ID *(string)* <br> | 
| TransformHeight | Get the current sprung height value for a transform size spring. | number | Spring ID *(string)* <br> | 
| TransformWidth | Get the current sprung width value for a transform size spring. | number | Spring ID *(string)* <br> | 


---
## Changelog

### Version 2.0.0.2

---

### Version 2.0.0.1

**Fixed:**
fix positioning
---

### Version 2.0.0.0

**Added:**
- Added Set Spring Settings From Duration.
- Added ACE for knowing whether a spring is a "Constant" spring.
- Added ACE for getting an estimated time it will take to reach target value (SpringTimeToTargetSeconds)
- Added Expression for getting the colour space being used by a Colour Spring.

**Changed:**
- Improved naming scheme of Spring ACEs
- Clean up debugger of old deprecated values.
- Combine Apply Springing ACEs to lessen the ACE counts.

**Fixed:**
- Fix Spring Triggers.
- Fix Springing Angle Triggers.
- Fix Async Actions so they work with the "Wait for previous actions to complete" action similar to the Tween Behaviour.
---

### Version 1.6.2.0

**Fixed:**
- Fix the Deprecated ACEs not working.
---

### Version 1.6.1.0

**Added:**
- Added  (Async) "Wait for previous actions" support for Spring Actions so they can be sequenced similar to the Tween Behaviour.
- Dedicated playback category
- Separate instance-applying spring ACEs for colour, transform XYZ, and transform angle, instead of using a toggle inside the main start ACEs.
- New constant spring ACEs for Colour Spring and Transform Spring.
- Add ACEs for Applying Velocity to Spring Transform Categories (Position, Size, Angle, Value.)
- Updated Debugger for new spring system.
- Debug ACE for logging all the active springs in browser log.

**Changed:**
- Updated the instance-applying ACE wording from "To Object" / "on object" to "To Properties".
- Renamed active ACEs with purpose-based prefixes such as "Start":, "Stop:", "Reset:", "Snap:", "Settings:", "Velocity:", "Constant:", "Apply:", and "Manage:" to improve sorting and discoverability.
- Reorganized active spring ACEs into clearer folder-based categories so playback actions show up separately in Construct.


**Fixed:**
- Correctly depecrated old Spring ACEs
- Removed the mixed “apply to instance” parameter pattern from active spring start ACEs, which made the action picker harder to scan.
- Brought deprecated spring start ACEs in line with the newer async sequencing behavior for legacy event sheets.
- Corrected deprecated ACE authoring to use the proper isDeprecated flag expected by Construct.
---

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
