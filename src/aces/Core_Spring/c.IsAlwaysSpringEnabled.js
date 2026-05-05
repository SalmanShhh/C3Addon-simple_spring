export const config = {
  deprecated: true,
  listName: "Is always spring enabled",
  displayText: "Is always spring enabled",
  description: "Deprecated. Use 'Is always spring enabled' in the Multi Spring category instead.",
  isInvertible: true,
  params: [],
};

export default function () {
  return this._isAlwaysSpringEnabled();
}
