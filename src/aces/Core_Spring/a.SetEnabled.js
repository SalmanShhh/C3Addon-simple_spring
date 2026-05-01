export const config = {
  listName: "Set enabled",
  displayText: "Set enabled: {0}",
  description: "Enable or disable the spring behavior.",
  params: [{ id: "state", name: "State", desc: "Enable or disable the behavior.", type: "boolean", initialValue: "true" }],
};

export default function (state) {
  this._setEnabled(state);
}
