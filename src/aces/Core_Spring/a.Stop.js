export const config = {
  deprecated: true,
  listName: "Stop at current value",
  displayText: "Stop spring at current value",
  description: "Deprecated. Use 'Stop spring' in the Multi Spring category instead.",
  params: [],
};

export default function () {
  this._stopAtCurrentValue();
}
