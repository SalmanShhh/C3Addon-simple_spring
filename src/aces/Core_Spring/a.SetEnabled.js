export const config = {
  isDeprecated: true,
  listName: "Set enabled",
  displayText: "(DEPRECATED) Set enabled: {0}",
  description: "Deprecated. Enables or disables the entire behavior. There is no direct Multi Spring equivalent; use this only when you need to pause all springs on an object.",
  params: [{ id: "state", name: "State", desc: "Enable or disable the behavior.", type: "boolean", initialValue: "true" }],
};

export default function (state) {
  this._setEnabled(state);
}
