export const config = {
  listName: "Do Mesh Effect: Punch",
  displayText: "Punch at ({0}, {1}) strength {2}, radius {3}, falloff {4}, auto mesh {5}",
  description: "Blast all mesh vertices outward from a point, then spring back. Good for hit impacts, explosions, and shockwaves.",
  params: [
    { id: "centerX", name: "Impact X", desc: "Horizontal impact point (0=left edge, 0.5=center, 1=right edge). To use a world-space hit position: (HitX - Sprite.BBoxLeft) / Sprite.Width.", type: "number", initialValue: "0.5" },
    { id: "centerY", name: "Impact Y", desc: "Vertical impact point (0=top edge, 0.5=center, 1=bottom edge). To use a world-space hit position: (HitY - Sprite.BBoxTop) / Sprite.Height.", type: "number", initialValue: "0.5" },
    { id: "strength", name: "Strength", desc: "Outward impulse per vertex. 0.2 is a light hit, 0.4 is a heavy impact, 0.6+ is explosive.", type: "number", initialValue: "0.2" },
    { id: "radius", name: "Radius", desc: "How wide the blast spreads (normalized). 1.0 blasts the whole sprite. 0.3 creates a tight, localized dent at the impact point.", type: "number", initialValue: "1" },
    { id: "falloff", name: "Falloff", desc: "Linear: uniform strength across radius. Smooth: softer edges, more natural. Exponential: concentrated at center, sharp falloff.", type: "combo", initialValue: "linear", items: [{ linear: "Linear" }, { smooth: "Smooth" }, { exponential: "Exponential" }] },
    { id: "autoMesh", name: "Auto Mesh", desc: "Yes: automatically create a 5×5 mesh grid if none exists (no setup required). No: skip the effect if no grid has been created yet with Create Grid.", type: "combo", initialValue: "yes", items: [{ yes: "Yes" }, { no: "No" }] },
  ],
};

export default function (centerX, centerY, strength, radius, falloff, autoMesh) {
  this._meshPunch(centerX, centerY, strength, radius, falloff, autoMesh);
}
