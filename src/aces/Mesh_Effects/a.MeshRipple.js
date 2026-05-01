export const config = {
  listName: "Do Mesh Effect: Ripple",
  displayText: "Ripple at ({0}, {1}) strength {2}, wavelength {3}, decay {4}, auto mesh {5}",
  description: "Emit concentric rings of alternating push/pull from an origin point, like a stone dropped in water.",
  params: [
    { id: "centerX", name: "Origin X", desc: "Horizontal wave origin (0=left edge, 0.5=center, 1=right edge). To use a world-space position: (ObjX - Sprite.BBoxLeft) / Sprite.Width.", type: "number", initialValue: "0.5" },
    { id: "centerY", name: "Origin Y", desc: "Vertical wave origin (0=top edge, 0.5=center, 1=bottom edge). Use 0.5 for a center splash or convert a world-space hit position.", type: "number", initialValue: "0.5" },
    { id: "strength", name: "Strength", desc: "Amplitude of each wave ring. 0.15 is a subtle ripple, 0.35 is a dramatic splash.", type: "number", initialValue: "0.2" },
    { id: "wavelength", name: "Wavelength", desc: "Spacing between rings in normalized units. 0.25 gives ~4 rings across the sprite. 0.5 gives ~2 rings. Larger = fewer, wider rings.", type: "number", initialValue: "0.25" },
    { id: "decay", name: "Decay", desc: "How quickly rings fade with distance from the origin. 0 = uniform rings across the whole sprite. 2 = rings fade quickly. 4+ = rings are very localized.", type: "number", initialValue: "2" },
    { id: "autoMesh", name: "Auto Mesh", desc: "Yes: automatically create a 5×5 mesh grid if none exists (no setup required). No: skip the effect if no grid has been created yet with Create Grid.", type: "combo", initialValue: "yes", items: [{ yes: "Yes" }, { no: "No" }] },
  ],
};

export default function (centerX, centerY, strength, wavelength, decay, autoMesh) {
  this._meshRipple(centerX, centerY, strength, wavelength, decay, autoMesh);
}
