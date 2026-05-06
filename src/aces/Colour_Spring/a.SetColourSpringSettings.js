export const config = {
  listName: "Settings: Set colour spring",
  displayText: "Set colour spring {0} settings to stiffness {1}, damping {2}, precision {3}",
  description: "Set stiffness, damping, and precision for all three channels of a named colour spring.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for the colour spring.", type: "string", initialValue: '"main"' },
    { id: "stiffness", name: "Stiffness", desc: "Spring stiffness.", type: "number", initialValue: "1.25" },
    { id: "damping", name: "Damping", desc: "Spring damping in range 0-1.", type: "number", initialValue: "0.9" },
    { id: "precision", name: "Precision", desc: "Completion threshold in range 0.0001-1.", type: "number", initialValue: "0.01" },
  ],
};

export default function (springId, stiffness, damping, precision) {
  this._setColourSpringSettingsId(springId, stiffness, damping, precision);
}
