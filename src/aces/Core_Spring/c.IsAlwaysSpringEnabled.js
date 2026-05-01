export const config = {
  listName: "Is always spring enabled",
  displayText: "Is always spring enabled",
  description: "True if always spring mode is currently enabled.",
  isInvertible: true,
  params: [],
};

export default function () {
  return this._isAlwaysSpringEnabled();
}
