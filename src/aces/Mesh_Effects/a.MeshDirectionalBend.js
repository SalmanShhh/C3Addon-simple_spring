export const config = {
  listName: "Do Mesh Effect: Directional bend",
  displayText: "Directional bend angle {0}, strength {1}, radius {2}, falloff {3}, auto mesh {4}",
  description: "Bend the mesh toward a direction with stronger motion on the leading edge. Great for wind push, recoil lean, and directional impact anticipation.",
  params: [
    { id: "angle", name: "Angle", desc: "Direction to bend toward in degrees. 0 = right, 90 = down, 180 = left, -90 = up.", type: "number", initialValue: "0" },
    { id: "strength", name: "Strength", desc: "Bend intensity. 0.08 is subtle lean, 0.2 is strong directional push, 0.35+ is exaggerated cartoon bend.", type: "number", initialValue: "0.15" },
    { id: "radius", name: "Radius", desc: "How wide the bend influence is from center. 1.0 affects almost the whole sprite, 0.5 keeps bend more central.", type: "number", initialValue: "1" },
    { id: "falloff", name: "Falloff", desc: "Linear: even fade. Smooth: softer edges. Exponential: concentrated center influence.", type: "combo", initialValue: "smooth", items: [{ linear: "Linear" }, { smooth: "Smooth" }, { exponential: "Exponential" }] },
    { id: "autoMesh", name: "Auto Mesh", desc: "Yes: automatically create a 5x5 mesh grid if none exists. No: skip if no mesh grid exists.", type: "combo", initialValue: "yes", items: [{ yes: "Yes" }, { no: "No" }] },
  ],
};

export default function (angle, strength, radius, falloff, autoMesh) {
  this._meshDirectionalBend(angle, strength, radius, falloff, autoMesh);
}
