export const config = {
  listName: "Is colour spring animating",
  displayText: "Colour spring \"{0}\" is animating",
  description: "True if any channel in the named colour spring is animating.",
  isInvertible: true,
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id of the colour spring to test.", type: "string", initialValue: '"main"' },
  ],
};

export default function (springId) {
  return this._isColourSpringAnimatingId(springId);
}
