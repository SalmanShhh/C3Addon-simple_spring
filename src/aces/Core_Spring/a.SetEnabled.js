export const config = {
  deprecated: true,
  listName: "Set enabled",
  displayText: "Set enabled: {0}",
  description: "Deprecated. Enables or disables the entire behavior. There is no Multi Spring equivalent — use this if you need to pause all springs on an object.",
  params: [{ id: "state", name: "State", desc: "Enable or disable the behavior.", type: "boolean", initialValue: "true" }],
};

export default function (state) {
  this._setEnabled(state);
}
