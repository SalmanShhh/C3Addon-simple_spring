export const config = {
  isDeprecated: true,
  listName: "Reset to value",
  displayText: "(DEPRECATED) Reset spring to {0}",
  description: "Deprecated. Use the Multi Spring category to set a named spring's start value or recreate the spring instead.",
  params: [{ id: "value", name: "Value", desc: "Value to reset to.", type: "number", initialValue: "0" }],
};

export default function (value) {
  this._resetToValue(value);
}
