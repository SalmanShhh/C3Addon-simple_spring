export const config = {
  deprecated: true,
  listName: "Set stiffness",
  displayText: "Set stiffness to {0}",
  description: "Deprecated. Use 'Set spring settings' in the Multi Spring category instead.",
  params: [{ id: "value", name: "Stiffness", desc: "Stiffness value.", type: "number", initialValue: "0.15" }],
};

export default function (value) {
  this._setStiffness(value);
}
