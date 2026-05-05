export const config = {
  deprecated: true,
  listName: "Set damping",
  displayText: "Set damping to {0}",
  description: "Deprecated. Use 'Set spring settings' in the Multi Spring category instead.",
  params: [{ id: "value", name: "Damping", desc: "Damping value (0-1).", type: "number", initialValue: "0.8" }],
};

export default function (value) {
  this._setDamping(value);
}
