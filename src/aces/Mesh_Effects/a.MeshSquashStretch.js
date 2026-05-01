export const config = {
  listName: "Do Mesh Effect: Squash and stretch",
  displayText: "Squash/stretch axis {0}, amount {1}, center ({2}, {3}), radius {4}, auto mesh {5}",
  description: "Squeeze the sprite along one axis and bow it out along the other, then spring back. Classic animation squash/stretch principle.",
  params: [
    { id: "axis", name: "Axis", desc: "Vertical squashes top-to-bottom (use for landings). Horizontal squashes left-to-right (use for wall hits or wind-up).", type: "combo", initialValue: "horizontal", items: [{ horizontal: "Horizontal" }, { vertical: "Vertical" }] },
    { id: "amount", name: "Amount", desc: "Impulse strength. 0.15-0.25 is a subtle bounce. 0.4+ is exaggerated cartoon feel. Negative reverses the squeeze direction.", type: "number", initialValue: "0.2" },
    { id: "centerX", name: "Pivot X", desc: "Horizontal pivot point (0=left edge, 0.5=center, 1=right edge). Use 0.5 for a symmetric squash.", type: "number", initialValue: "0.5" },
    { id: "centerY", name: "Pivot Y", desc: "Vertical pivot point (0=top edge, 0.5=center, 1=bottom edge). Use 1.0 for a ground landing (squashes from feet up). Use 0.0 for a ceiling hit.", type: "number", initialValue: "0.5" },
    { id: "radius", name: "Radius", desc: "How far the effect spreads from the pivot (normalized). 1.0 deforms the whole sprite. Lower values create a localized bulge at the pivot point.", type: "number", initialValue: "1" },
    { id: "autoMesh", name: "Auto Mesh", desc: "Yes: automatically create a 5×5 mesh grid if none exists (no setup required). No: skip the effect if no grid has been created yet with Create Grid.", type: "combo", initialValue: "yes", items: [{ yes: "Yes" }, { no: "No" }] },
  ],
};

export default function (axis, amount, centerX, centerY, radius, autoMesh) {
  this._meshSquashStretch(axis, amount, centerX, centerY, radius, autoMesh);
}
