export const config = {
  listName: "Stop at current value",
  displayText: "Stop spring at current value",
  description: "Stop the spring animation and keep the current value.",
  params: [],
};

export default function () {
  this._stopAtCurrentValue();
}
