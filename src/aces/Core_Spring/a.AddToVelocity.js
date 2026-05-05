export const config = {
  deprecated: true,
  listName: "Add to velocity",
  displayText: "Add {0} to velocity",
  description: "Deprecated. Use 'Add to spring velocity' in the Multi Spring category instead.",
  params: [{ id: "value", name: "Value", desc: "Value to add to velocity.", type: "number", initialValue: "0" }],
};

export default function (value) {
  this._addToVelocity(value);
}
