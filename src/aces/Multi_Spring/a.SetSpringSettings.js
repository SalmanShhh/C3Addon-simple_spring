export const config = {
  listName: "Settings: Set spring",
  displayText: "Set spring {0} settings to stiffness {1}, damping {2}, precision {3}",
  description: "Override stiffness, damping, and precision for a named spring. New springs inherit the behavior's default stiffness, damping, and precision set in the properties panel.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for the spring to configure.", type: "string", initialValue: '"main"' },
    { id: "stiffness", name: "Stiffness", desc: "Spring stiffness. How quickly the spring responds.", type: "number", initialValue: "1.25" },
    { id: "damping", name: "Damping", desc: "Spring damping (0-1). Higher values reduce overshoot.", type: "number", initialValue: "0.9" },
    { id: "precision", name: "Precision", desc: "Settle threshold (0.0001-1). Lower values require closer proximity to target.", type: "number", initialValue: "0.01" },
  ],
};

export default function (springId, stiffness, damping, precision) {
  this._setStiffness(stiffness, springId);
  this._setDamping(damping, springId);
  this._setPrecision(precision, springId);
}