export const config = {
  listName: "Set stiffness",
  displayText: "Set stiffness to {0}",
  description: "Set spring stiffness. Higher values increase responsiveness.",
  params: [{ id: "value", name: "Stiffness", desc: "Stiffness value.", type: "number", initialValue: "0.15" }],
};

export default function (value) {
  this._setStiffness(value);
}
