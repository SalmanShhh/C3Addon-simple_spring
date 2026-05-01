export const config = {
  listName: "Set damping",
  displayText: "Set mesh damping to {0}",
  description: "Set mesh spring damping.",
  params: [{ id: "value", name: "Damping", desc: "Mesh spring damping value.", type: "number", initialValue: "0.9" }],
};

export default function (value) {
  this._setMeshDamping(value);
}
