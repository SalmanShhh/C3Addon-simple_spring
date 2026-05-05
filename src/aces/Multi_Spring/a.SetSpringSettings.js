export const config = {
  listName: "Set spring settings",
  displayText: "Set spring {0} settings to stiffness {1}, damping {2}, precision {3}",
  description: "Override stiffness, damping, and precision for a named spring.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for the spring to configure.", type: "string", initialValue: '"main"' },
    { id: "stiffness", name: "Stiffness", desc: "Spring stiffness.", type: "number", initialValue: "1.25" },
    { id: "damping", name: "Damping", desc: "Spring damping.", type: "number", initialValue: "0.9" },
    { id: "precision", name: "Precision", desc: "Settle threshold.", type: "number", initialValue: "0.01" },
  ],
};

export default function (springId, stiffness, damping, precision) {
  this._setStiffness(stiffness, springId);
  this._setDamping(damping, springId);
  this._setPrecision(precision, springId);
}