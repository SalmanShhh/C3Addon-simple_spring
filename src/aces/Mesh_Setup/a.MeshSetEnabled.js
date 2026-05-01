export const config = {
  listName: "Set enabled",
  displayText: "Set mesh enabled to {0}",
  description: "Enable or disable mesh spring simulation.",
  params: [{ id: "enabled", name: "Enabled", desc: "Enable or disable mesh spring simulation.", type: "boolean", initialValue: "true" }],
};

export default function (enabled) {
  this._setMeshEnabled(enabled);
}
