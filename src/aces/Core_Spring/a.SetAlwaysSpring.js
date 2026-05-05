export const config = {
  deprecated: true,
  listName: "Set always spring to target",
  displayText: "Set always spring to target: {0} to {1} (mode: {2})",
  description: "Deprecated. Use 'Set always spring' in the Multi Spring category instead.",
  params: [
    {
      id: "enabled",
      name: "Enabled",
      desc: "Enable or disable always spring mode.",
      type: "combo",
      initialValue: "enabled",
      items: [{ enabled: "Enabled" }, { disabled: "Disabled" }],
    },
    { id: "target", name: "Target", desc: "The target value to spring towards.", type: "number", initialValue: "0" },
    {
      id: "mode",
      name: "Mode",
      desc: "Whether to spring as a value or angle.",
      type: "combo",
      initialValue: "value",
      items: [{ value: "Value" }, { angle: "Angle" }],
    },
  ],
};

export default function (enabled, target, mode) {
  this._setAlwaysSpring(enabled === 0, target, mode);
}
