export const config = {
  listName: "Spring transform XY",
  displayText: "Spring {1} {0} ({2}) from ({3}, {4}) to ({5}, {6}) (use for instance: {7})",
  description: "Combined spring action for Position/Size using current-to-target or from-to, with instance toggle.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for this transform spring.", type: "string", initialValue: '"main"' },
    {
      id: "transformType",
      name: "Transform Type",
      desc: "Choose position or size springing.",
      type: "combo",
      initialValue: "position",
      items: [
        { position: "Position" },
        { size: "Size" },
      ],
    },
    {
      id: "startMode",
      name: "Start Mode",
      desc: "Current value uses object's current value. From value uses explicit from coordinates/dimensions.",
      type: "combo",
      initialValue: "current",
      items: [
        { current: "Current value" },
        { from_value: "From value" },
      ],
    },
    { id: "fromA", name: "From A", desc: "Position: From X. Size: From Width.", type: "number", initialValue: "0" },
    { id: "fromB", name: "From B", desc: "Position: From Y. Size: From Height.", type: "number", initialValue: "0" },
    { id: "toA", name: "To A", desc: "Position: To X. Size: To Width.", type: "number", initialValue: "0" },
    { id: "toB", name: "To B", desc: "Position: To Y. Size: To Height.", type: "number", initialValue: "0" },
    {
      id: "useForInstance",
      name: "Use For Instance",
      desc: "Yes applies the sprung transform to the object each tick. No keeps it expression-only.",
      type: "combo",
      initialValue: "yes",
      items: [
        { no: "No" },
        { yes: "Yes" },
      ],
    },
  ],
};

export default function (springId, transformType, startMode, fromA, fromB, toA, toB, useForInstance) {
  const applyToInstance = useForInstance === 1;
  if (transformType === 1) {
    if (startMode === 1) {
      this._springSizeFromToId(springId, fromA, fromB, toA, toB, applyToInstance);
      return;
    }
    this._springSizeToId(springId, toA, toB, applyToInstance);
    return;
  }

  if (startMode === 1) {
    this._springPositionFromToId(springId, fromA, fromB, toA, toB, applyToInstance);
    return;
  }
  this._springPositionToId(springId, toA, toB, applyToInstance);
}
