export const config = {
  listName: "Is spring animating",
  displayText: "Spring {0} is animating",
  description: "True if the named spring is currently animating.",
  isInvertible: true,
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id of the spring to test.", type: "string", initialValue: '"default"' },
  ],
};

export default function (springId) {
  return this._isSpringAnimatingId(springId);
}