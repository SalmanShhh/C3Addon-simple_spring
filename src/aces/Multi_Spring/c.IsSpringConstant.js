export const config = {
  listName: "Is spring constant",
  displayText: "Is Spring \"{0}\" constant",
  description: "True if the named spring is currently configured as a constant spring.",
  isInvertible: true,
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id of the spring to test.", type: "string", initialValue: '"default"' },
  ],
};

export default function (springId) {
  return this._isAlwaysSpringEnabledId(springId);
}
