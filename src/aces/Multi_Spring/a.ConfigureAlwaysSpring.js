export const config = {
  listName: "Configure always spring",
  displayText: "Configure always spring {0}: {1}, target {2}, mode {3}",
  description: "Combined always-spring action for enable/disable and target updates.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for the spring.", type: "string", initialValue: '"main"' },
    {
      id: "operation",
      name: "Operation",
      desc: "Enable or disable always spring, or update only the target.",
      type: "combo",
      initialValue: "enable",
      items: [
        { enable: "Enable" },
        { disable: "Disable" },
        { update_target_only: "Update target only" },
      ],
    },
    { id: "target", name: "Target", desc: "Target value.", type: "number", initialValue: "0" },
    {
      id: "mode",
      name: "Mode",
      desc: "Value or angle mode when enabling/disabling always spring.",
      type: "combo",
      initialValue: "value",
      items: [
        { value: "Value" },
        { angle: "Angle" },
      ],
    },
  ],
};

export default function (springId, operation, target, mode) {
  if (operation === 2) {
    this._setAlwaysSpringTargetId(springId, target);
    return;
  }

  this._setAlwaysSpringId(springId, operation === 0, target, mode);
}
