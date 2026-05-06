export const config = {
  isDeprecated: true,
  listName: "Is always spring enabled",
  displayText: "(DEPRECATED) Is always spring enabled",
  description: "Deprecated. Use 'Is constant spring enabled' in the Multi Spring category instead.",
  isInvertible: true,
  params: [],
};

export default function () {
  return this._isAlwaysSpringEnabled();
}
