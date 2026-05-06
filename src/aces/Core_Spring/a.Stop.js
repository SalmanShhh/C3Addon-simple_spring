export const config = {
  isDeprecated: true,
  listName: "Stop at current value",
  displayText: "(DEPRECATED) Stop spring at current value",
  description: "Deprecated. Use the Multi Spring Playback category to stop or clear a named spring instead.",
  params: [],
};

export default function () {
  this._stopAtCurrentValue();
}
