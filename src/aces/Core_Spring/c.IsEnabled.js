export const config = {
  listName: "Is enabled",
  displayText: "Is enabled",
  description: "True if the spring behavior is enabled.",
  isInvertible: true,
  params: [],
};

export default function () {
  return this._isSpringEnabled();
}
