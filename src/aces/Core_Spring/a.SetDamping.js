export const config = {
  listName: "Set damping",
  displayText: "Set damping to {0}",
  description: "Set spring damping (0-1). Higher values reduce oscillation.",
  params: [{ id: "value", name: "Damping", desc: "Damping value (0-1).", type: "number", initialValue: "0.8" }],
};

export default function (value) {
  this._setDamping(value);
}
