export const config = {
  listName: "Do Mesh Effect: Twist",
  displayText: "Twist at ({0}, {1}) strength {2}, radius {3}, falloff {4}, auto mesh {5}",
  description: "Swirl the mesh around a pivot in a rotational motion, then spring back. Good for portal effects, magic circles, spin attacks, and tornado impacts.",
  params: [
    { id: "centerX", name: "Pivot X", desc: "Horizontal center of the swirl (0=left edge, 0.5=center, 1=right edge). Use 0.5 for a centered spin.", type: "number", initialValue: "0.5" },
    { id: "centerY", name: "Pivot Y", desc: "Vertical center of the swirl (0=top edge, 0.5=center, 1=bottom edge). Use 0.5 for a centered spin.", type: "number", initialValue: "0.5" },
    { id: "strength", name: "Strength", desc: "Rotational impulse. Positive = clockwise, negative = counter-clockwise. 0.2 is a gentle swirl, 0.5 is dramatic.", type: "number", initialValue: "0.2" },
    { id: "radius", name: "Radius", desc: "How far from the pivot the twist reaches (normalized). 1.0 affects the whole sprite. 0.4 = localized core swirl only.", type: "number", initialValue: "1" },
    { id: "falloff", name: "Falloff", desc: "Linear: uniform spin across radius. Smooth: softer edges. Exponential: strongest at center, sharp drop-off.", type: "combo", initialValue: "linear", items: [{ linear: "Linear" }, { smooth: "Smooth" }, { exponential: "Exponential" }] },
    { id: "autoMesh", name: "Auto Mesh", desc: "Yes: automatically create a 5×5 mesh grid if none exists (no setup required). No: skip the effect if no grid has been created yet with Create Grid.", type: "combo", initialValue: "yes", items: [{ yes: "Yes" }, { no: "No" }] },
  ],
};

export default function (centerX, centerY, strength, radius, falloff, autoMesh) {
  this._meshTwist(centerX, centerY, strength, radius, falloff, autoMesh);
}
