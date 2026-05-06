export const config = {
  listName: "Is constant spring enabled",
  displayText: "Spring {0} is running as a constant spring",
  description: "True if the named spring is running in constant (always-on) mode.",
  isInvertible: true,
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id of the spring to test.", type: "string", initialValue: '"default"' },
  ],
};

export default function (springId) {
  return this._isAlwaysSpringEnabledId(springId);
}