export const config = {
  deprecated: true,
  listName: "Reset to value",
  displayText: "Reset spring to {0}",
  description: "Deprecated. Use 'Reset spring' in the Multi Spring category instead.",
  params: [{ id: "value", name: "Value", desc: "Value to reset to.", type: "number", initialValue: "0" }],
};

export default function (value) {
  this._resetToValue(value);
}
