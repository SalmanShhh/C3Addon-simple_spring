export const config = {
  listName: "On spring reached target",
  displayText: "On Spring \"{0}\" reached target",
  description: "True if the named spring has settled at its target.",
  isInvertible: true,
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id of the spring to test.", type: "string", initialValue: '"default"' },
  ],
};

export default function (springId) {
  return this._hasSpringReachedTarget(springId);
}