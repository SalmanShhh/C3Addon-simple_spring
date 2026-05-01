export const config = {
  listName: "Do Mesh Effect: Noise jitter burst",
  displayText: "Noise jitter burst at ({0}, {1}) strength {2}, radius {3}, falloff {4}, auto mesh {5}",
  description: "Apply randomized per-vertex impulse for electric shock, glitch hit, fear tremor, or explosion rattle, then spring back naturally.",
  params: [
    { id: "centerX", name: "Center X", desc: "Horizontal burst origin in normalized sprite space (0=left, 0.5=center, 1=right).", type: "number", initialValue: "0.5" },
    { id: "centerY", name: "Center Y", desc: "Vertical burst origin in normalized sprite space (0=top, 0.5=center, 1=bottom).", type: "number", initialValue: "0.5" },
    { id: "strength", name: "Strength", desc: "Jitter intensity. 0.05 is subtle shake, 0.15 is strong tremor, 0.3+ is violent burst.", type: "number", initialValue: "0.12" },
    { id: "radius", name: "Radius", desc: "Area of effect from burst center. 1.0 affects whole sprite, 0.35 keeps jitter localized.", type: "number", initialValue: "1" },
    { id: "falloff", name: "Falloff", desc: "Linear: broad shake. Smooth: softer edge blend. Exponential: concentrated center jitter.", type: "combo", initialValue: "smooth", items: [{ linear: "Linear" }, { smooth: "Smooth" }, { exponential: "Exponential" }] },
    { id: "autoMesh", name: "Auto Mesh", desc: "Yes: automatically create a 5x5 mesh grid if none exists. No: skip if no mesh grid exists.", type: "combo", initialValue: "yes", items: [{ yes: "Yes" }, { no: "No" }] },
  ],
};

export default function (centerX, centerY, strength, radius, falloff, autoMesh) {
  this._meshNoiseJitterBurst(centerX, centerY, strength, radius, falloff, autoMesh);
}
