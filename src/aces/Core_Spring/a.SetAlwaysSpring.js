export const config = {
  listName: "Set always spring to target",
  displayText: "Set always spring to target: {0} to {1} (mode: {2})",
  description: "When enabled, the spring will continuously spring towards the target value even after reaching it. Useful for following a changing target.",
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
