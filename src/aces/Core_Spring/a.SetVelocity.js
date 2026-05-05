export const config = {
  deprecated: true,
  listName: "Set velocity",
  displayText: "Set velocity to {0}",
  description: "Deprecated. Use 'Set spring velocity' in the Multi Spring category instead.",
  params: [{ id: "value", name: "Velocity", desc: "Velocity value.", type: "number", initialValue: "0" }],
};

export default function (value) {
  this._setVelocity(value);
}
