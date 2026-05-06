export const config = {
  isDeprecated: true,
  listName: "Set damping",
  displayText: "(DEPRECATED) Set damping to {0}",
  description: "Deprecated. Use 'Settings: Set spring' in the Multi Spring category instead.",
  params: [{ id: "value", name: "Damping", desc: "Damping value (0-1).", type: "number", initialValue: "0.8" }],
};

export default function (value) {
  this._setDamping(value);
}
