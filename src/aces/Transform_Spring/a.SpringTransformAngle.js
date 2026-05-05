export const config = {
  listName: "Spring transform angle",
  displayText: "Spring angle {0} ({1}) from {2} to {3} (mode: {4}, use for instance: {5})",
  description: "Combined angle spring action using current-to-target or from-to with value/angle mode, plus instance toggle.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for this transform spring.", type: "string", initialValue: '"main"' },
    {
      id: "startMode",
      name: "Start Mode",
      desc: "Current value uses object's current angle. From value uses explicit from angle.",
      type: "combo",
      initialValue: "current",
      items: [
        { current: "Current value" },
        { from_value: "From value" },
      ],
    },
    { id: "fromAngle", name: "From Angle", desc: "Used when Start Mode is From value.", type: "number", initialValue: "0" },
    { id: "toAngle", name: "To Angle", desc: "Target angle in degrees.", type: "number", initialValue: "0" },
    {
      id: "angleMode",
      name: "Angle Mode",
      desc: "Value springs numerically. Angle uses shortest rotational path.",
      type: "combo",
      initialValue: "angle",
      items: [
        { value: "Value" },
        { angle: "Angle" },
      ],
    },
    {
      id: "useForInstance",
      name: "Use For Instance",
      desc: "Yes applies the sprung angle to the object each tick. No keeps it expression-only.",
      type: "combo",
      initialValue: "yes",
      items: [
        { no: "No" },
        { yes: "Yes" },
      ],
    },
  ],
};

export default function (springId, startMode, fromAngle, toAngle, angleMode, useForInstance) {
  const applyToInstance = useForInstance === 1;
  if (startMode === 1) {
    this._springAngleFromToId(springId, fromAngle, toAngle, applyToInstance);
    return;
  }
  this._springAngleToId(springId, toAngle, angleMode, applyToInstance);
}
