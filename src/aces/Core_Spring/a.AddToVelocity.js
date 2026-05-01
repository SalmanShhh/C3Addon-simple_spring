export const config = {
  listName: "Add to velocity",
  displayText: "Add {0} to velocity",
  description: "Add a value to the spring's current velocity.",
  params: [{ id: "value", name: "Value", desc: "Value to add to velocity.", type: "number", initialValue: "0" }],
};

export default function (value) {
  this._addToVelocity(value);
}
