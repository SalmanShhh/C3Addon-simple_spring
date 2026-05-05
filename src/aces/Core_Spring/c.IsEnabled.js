export const config = {
  deprecated: true,
  listName: "Is enabled",
  displayText: "Is enabled",
  description: "Deprecated. Checks if the entire behavior is enabled. There is no Multi Spring equivalent — use this if you need to check the behavior-level enabled state.",
  isInvertible: true,
  params: [],
};

export default function () {
  return this._isSpringEnabled();
}
