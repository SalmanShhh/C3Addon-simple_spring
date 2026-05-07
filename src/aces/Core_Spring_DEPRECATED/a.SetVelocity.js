export const config = {
  isDeprecated: true,
  listName: "Set velocity",
  displayText: "(DEPRECATED) Set spring velocity to {0}",
  description: "Deprecated. Use 'Velocity: Set named spring' in the Multi Spring category instead.",
  params: [{ id: "value", name: "Velocity", desc: "Velocity value.", type: "number", initialValue: "0" }],
};

export default function (value) {
  this._setVelocity(value);
}
