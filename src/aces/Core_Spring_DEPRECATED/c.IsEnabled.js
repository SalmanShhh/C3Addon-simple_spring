export const config = {
  isDeprecated: true,
  listName: "Is enabled",
  displayText: "(DEPRECATED) Is enabled",
  description: "Deprecated. Checks if the entire behavior is enabled. There is no direct Multi Spring equivalent; use this only when you need the behavior-level enabled state.",
  isInvertible: true,
  params: [],
};

export default function () {
  return this._isSpringEnabled();
}
