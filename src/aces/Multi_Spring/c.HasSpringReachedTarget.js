export const config = {
  listName: "Has spring reached target",
  displayText: "Spring {0} has reached target",
  description: "True if the named spring has settled at its target.",
  isInvertible: true,
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id of the spring to test.", type: "string", initialValue: '"default"' },
  ],
};

export default function (springId) {
  return this._hasSpringReachedTarget(springId);
}