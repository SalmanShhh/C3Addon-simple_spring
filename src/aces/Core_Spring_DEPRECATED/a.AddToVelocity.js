export const config = {
  isDeprecated: true,
  listName: "Add to velocity",
  displayText: "(DEPRECATED) Add {0} to spring velocity",
  description: "Deprecated. Use 'Velocity: Add to named spring' in the Multi Spring category instead.",
  params: [{ id: "value", name: "Value", desc: "Value to add to velocity.", type: "number", initialValue: "0" }],
};

export default function (value) {
  this._addToVelocity(value);
}
