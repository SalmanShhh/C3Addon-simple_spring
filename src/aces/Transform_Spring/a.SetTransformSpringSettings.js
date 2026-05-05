export const config = {
  listName: "Set transform spring settings",
  displayText: "Set {1} spring {0} settings to stiffness {2}, damping {3}, precision {4}",
  description: "Set stiffness, damping, and precision for a transform spring type.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for this transform spring.", type: "string", initialValue: '"main"' },
    {
      id: "transformType",
      name: "Transform Type",
      desc: "Which transform spring type to configure.",
      type: "combo",
      initialValue: "position",
      items: [
        { position: "Position" },
        { size: "Size" },
        { angle: "Angle" },
      ],
    },
    { id: "stiffness", name: "Stiffness", desc: "Spring stiffness.", type: "number", initialValue: "1.25" },
    { id: "damping", name: "Damping", desc: "Spring damping in range 0-1.", type: "number", initialValue: "0.9" },
    { id: "precision", name: "Precision", desc: "Completion threshold in range 0.0001-1.", type: "number", initialValue: "0.01" },
  ],
};

export default function (springId, transformType, stiffness, damping, precision) {
  this._setTransformSpringSettingsId(transformType, springId, stiffness, damping, precision);
}
