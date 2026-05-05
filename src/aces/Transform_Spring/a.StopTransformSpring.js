export const config = {
  listName: "Stop transform spring",
  displayText: "Stop {1} spring {0}",
  description: "Stop a transform spring and disable its auto-apply.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for this transform spring.", type: "string", initialValue: '"main"' },
    {
      id: "transformType",
      name: "Transform Type",
      desc: "Which transform spring type to stop.",
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
  this._stopTransformSpringId(transformType, springId);
}
