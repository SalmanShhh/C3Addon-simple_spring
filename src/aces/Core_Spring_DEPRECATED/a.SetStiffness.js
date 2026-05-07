export const config = {
  isDeprecated: true,
  listName: "Set stiffness",
  displayText: "(DEPRECATED) Set stiffness to {0}",
  description: "Deprecated. Use 'Settings: Set spring' in the Multi Spring category instead.",
  params: [{ id: "value", name: "Stiffness", desc: "Stiffness value.", type: "number", initialValue: "0.15" }],
};

export default function (value) {
  this._setStiffness(value);
}
