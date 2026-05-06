export const config = {
  listName: "Start: Named spring",
  displayText: "Spring {0} ({1}) from {2} to {3} (mode: {4})",
  description: "Spring a named value from a start point to a target. New springs inherit the behavior's default stiffness, damping, and precision. Use the Settings ACE to override per spring.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for the spring.", type: "string", initialValue: '"main"' },
    {
      id: "startMode",
      name: "Start Mode",
      desc: "From value uses explicit from value. Current value ignores From and uses current spring value.",
      type: "combo",
      initialValue: "current",
      items: [
        { current: "Current value" },
        { from_value: "From value" },
      ],
    },
    { id: "from", name: "From", desc: "Used when Start Mode is From value.", type: "number", initialValue: "0" },
    { id: "to", name: "To", desc: "Target value.", type: "number", initialValue: "100" },
    {
      id: "mode",
      name: "Mode",
      desc: "Value springs numerically. Angle uses shortest rotational path.",
      type: "combo",
      initialValue: "value",
      items: [
        { value: "Value" },
        { angle: "Angle" },
      ],
    },
  ],
  isAsync: true,
};

export default async function (springId, startMode, from, to, mode) {
  await this._runSpringActionWithOptionalWait(springId, true, () => {
    if (startMode === 1) {
      if (mode === 1) {
        this._springFromToAngleId(springId, from, to);
        return;
      }
      this._springFromToId(springId, from, to);
      return;
    }
    this._springToId(springId, to, mode);
  });
}
