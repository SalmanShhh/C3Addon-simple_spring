export const config = {
  listName: "Do Mesh Effect: Preset combo",
  displayText: "Apply mesh preset {0}, intensity {1}, center ({2}, {3}), angle {4}, auto mesh {5}",
  description: "Apply a pre-configured combination of mesh effects tuned for specific game feel scenarios. Each preset blends 2–4 effects together. Intensity scales all effect strengths proportionally.",
  params: [
    {
      id: "preset",
      name: "Preset",
      desc: "Select a preset combination: Hit Impact (punch + jitter + bend for melee hits), Heavy Slam (shockwave + squash + ripple for large impacts), Sword Trail (impact trail + twist for slashing arcs), Wind Gust (directional bend + wave for environmental forces), Electric Stun (jitter + wobble + ripple for shock effects), Portal Spawn (twist + ripple + shockwave for magical spawns), UI Pop (punch + squash for UI interactions).",
      type: "combo",
      initialValue: "hit_impact",
      items: [
        { hit_impact: "Hit Impact" },
        { heavy_slam: "Heavy Slam" },
        { sword_trail: "Sword Trail" },
        { wind_gust: "Wind Gust" },
        { electric_stun: "Electric Stun" },
        { portal_spawn: "Portal Spawn" },
        { ui_pop: "UI Pop" },
      ],
    },
    {
      id: "intensity",
      name: "Intensity",
      desc: "Multiplier for all effect strengths in this preset (0.5–2.0 typical). 1.0 is balanced. Lower values create subtle effects; higher values create exaggerated impacts.",
      type: "number",
      initialValue: "1.0",
    },
    {
      id: "centerX",
      name: "Impact X",
      desc: "Horizontal center point for effects (0=left, 0.5=center, 1=right). Ignored by effects that don't use center-based logic (e.g., Wind Gust).",
      type: "number",
      initialValue: "0.5",
    },
    {
      id: "centerY",
      name: "Impact Y",
      desc: "Vertical center point for effects (0=top, 0.5=center, 1=bottom). Ignored by effects that don't use center-based logic (e.g., Wind Gust).",
      type: "number",
      initialValue: "0.5",
    },
    {
      id: "angle",
      name: "Angle (degrees)",
      desc: "Direction angle in degrees (0–360). Used by directional effects like Wind Gust and Sword Trail. Ignored by radial presets like Portal Spawn.",
      type: "number",
      initialValue: "0",
    },
    {
      id: "autoMesh",
      name: "Auto Mesh",
      desc: "Yes: automatically create a 5×5 mesh grid if none exists (no setup required). No: skip the effect if no grid has been created yet with Create Grid.",
      type: "combo",
      initialValue: "yes",
      items: [{ yes: "Yes" }, { no: "No" }],
    },
  ],
};

export default function (preset, intensity, centerX, centerY, angle, autoMesh) {
  this._meshApplyPreset(preset, intensity, centerX, centerY, angle, autoMesh);
}
