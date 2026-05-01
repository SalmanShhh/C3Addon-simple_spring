export const config = {
  listName: "Do Mesh Effect: Shockwave",
  displayText: "Shockwave at ({0}, {1}) strength {2}, radius {3}, width {4}, auto mesh {5}",
  description: "Emit a ring-shaped outward blast that peaks at a set distance from the origin. Unlike Punch, the center is unaffected — only the ring is hit. Good for bomb blasts and sonic booms.",
  params: [
    { id: "centerX", name: "Epicenter X", desc: "Horizontal epicenter (0=left edge, 0.5=center, 1=right edge). To use a world-space position: (ObjX - Sprite.BBoxLeft) / Sprite.Width.", type: "number", initialValue: "0.5" },
    { id: "centerY", name: "Epicenter Y", desc: "Vertical epicenter (0=top edge, 0.5=center, 1=bottom edge). To use a world-space position: (ObjY - Sprite.BBoxTop) / Sprite.Height.", type: "number", initialValue: "0.5" },
    { id: "strength", name: "Strength", desc: "Outward impulse at the ring peak. 0.3 is a solid blast, 0.6 is explosive.", type: "number", initialValue: "0.3" },
    { id: "ringRadius", name: "Ring Radius", desc: "How far from the epicenter the ring sits (normalized). 0.0 puts the ring at the center (similar to Punch). 0.5 = ring is halfway to the sprite edge.", type: "number", initialValue: "0.4" },
    { id: "ringWidth", name: "Ring Width", desc: "Thickness of the ring on each side of the peak (normalized). 0.1 = tight sharp ring. 0.4 = wide, soft blast zone.", type: "number", initialValue: "0.2" },
    { id: "autoMesh", name: "Auto Mesh", desc: "Yes: automatically create a 5×5 mesh grid if none exists (no setup required). No: skip the effect if no grid has been created yet with Create Grid.", type: "combo", initialValue: "yes", items: [{ yes: "Yes" }, { no: "No" }] },
  ],
};

export default function (centerX, centerY, strength, ringRadius, ringWidth, autoMesh) {
  this._meshShockwave(centerX, centerY, strength, ringRadius, ringWidth, autoMesh);
}
