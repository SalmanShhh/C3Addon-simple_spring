export const config = {
  listName: "Spring named",
  displayText: "Spring {0} ({1}) from {2} to {3} (mode: {4})",
  description: "Combined spring action for from-to and current-to-target workflows.",
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
};

export default function (springId, startMode, from, to, mode) {
  if (startMode === 1) {
    if (mode === 1) {
      this._springFromToAngleId(springId, from, to);
      return;
    }
    this._springFromToId(springId, from, to);
    return;
  }

  this._springToId(springId, to, mode);
}
