export const config = {
  listName: "Set velocity",
  displayText: "Set velocity to {0}",
  description: "Set the spring's current velocity.",
  params: [{ id: "value", name: "Velocity", desc: "Velocity value.", type: "number", initialValue: "0" }],
};

export default function (value) {
  this._setVelocity(value);
}
