export const config = {
  listName: "Set stiffness",
  displayText: "Set mesh stiffness to {0}",
  description: "Set mesh spring stiffness.",
  params: [{ id: "value", name: "Stiffness", desc: "Mesh spring stiffness value.", type: "number", initialValue: "1.25" }],
};

export default function (value) {
  this._setMeshStiffness(value);
}
