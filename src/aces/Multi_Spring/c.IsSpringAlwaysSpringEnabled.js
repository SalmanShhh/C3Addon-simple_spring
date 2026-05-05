export const config = {
  listName: "Is always spring enabled",
  displayText: "Spring {0} always spring is enabled",
  description: "True if the named spring is in always spring mode.",
  isInvertible: true,
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id of the spring to test.", type: "string", initialValue: '"default"' },
  ],
};

export default function (springId) {
  return this._isAlwaysSpringEnabledId(springId);
}