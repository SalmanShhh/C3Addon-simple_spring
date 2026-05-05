export const config = {
  listName: "Has colour spring reached target",
  displayText: "Colour spring {0} has reached target",
  description: "True if all channels in the named colour spring have reached their targets.",
  isInvertible: true,
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id of the colour spring to test.", type: "string", initialValue: '"main"' },
  ],
};

export default function (springId) {
  return this._hasColourSpringReachedTargetId(springId);
}
