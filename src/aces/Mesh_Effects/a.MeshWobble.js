export const config = {
  listName: "Do Mesh Effect: Wobble",
  displayText: "Wobble angle {0}, strength {1}, auto mesh {2}",
  description: "Shear the mesh in a direction — one side pushes one way, the opposite side pushes back. Good for hit reactions, wind gusts, and attack wind-ups.",
  params: [
    { id: "angle", name: "Angle", desc: "Direction of the shear in degrees. 0 = left/right shear (horizontal hit). 90 = up/down shear (vertical hit). Use angle() to match an attacker's direction.", type: "number", initialValue: "0" },
    { id: "strength", name: "Strength", desc: "How far the shear pushes. 0.1 is a subtle nudge, 0.2 is a solid hit, 0.35+ is dramatic. Negative values reverse the shear direction.", type: "number", initialValue: "0.15" },
    { id: "autoMesh", name: "Auto Mesh", desc: "Yes: automatically create a 5×5 mesh grid if none exists (no setup required). No: skip the effect if no grid has been created yet with Create Grid.", type: "combo", initialValue: "yes", items: [{ yes: "Yes" }, { no: "No" }] },
  ],
};

export default function (angle, strength, autoMesh) {
  this._meshWobble(angle, strength, autoMesh);
}
