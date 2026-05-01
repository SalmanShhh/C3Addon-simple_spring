export const config = {
  listName: "Reset to value",
  displayText: "Reset spring to {0}",
  description: "Instantly reset the spring value and clear velocity. Stops any active animation.",
  params: [{ id: "value", name: "Value", desc: "Value to reset to.", type: "number", initialValue: "0" }],
};

export default function (value) {
  this._resetToValue(value);
}
