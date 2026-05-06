export const config = {
  isDeprecated: true,
  listName: "Snap to target",
  displayText: "(DEPRECATED) Snap to target",
  description: "Deprecated. Use the Multi Spring Playback category to snap or clear a named spring instead.",
  params: [],
};

export default function () {
  this._snapToTarget();
}
