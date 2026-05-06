export const config = {
  listName: "Has transform spring reached target",
  displayText: "{1} spring {0} has reached target",
  description: "True if the selected transform spring has reached its target.",
  isInvertible: true,
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id of the spring to test.", type: "string", initialValue: '"main"' },
    {
      id: "transformType",
      name: "Transform Type",
      desc: "Which transform spring type to test.",
      type: "combo",
      initialValue: "position",
      items: [
        { position: "Position" },
        { size: "Size" },
        { angle: "Angle" },
      ],
    },
  ],
};

export default function (springId, transformType) {
  return this._hasTransformSpringReachedTargetId(transformType, springId);
}
