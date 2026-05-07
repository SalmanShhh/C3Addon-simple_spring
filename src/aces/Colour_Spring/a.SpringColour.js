export const config = {
  listName: "Apply Colour spring",
  displayText: "Spring colour \"{0}\" ({2}) from ({3}, {4}, {5}) to ({6}, {7}, {8}) in {1}, Apply to Property ({9})",
  description: "Combined colour spring action for current-to-target or from-to workflows with optional apply-to-properties.",
  isAsync: true,
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for the colour spring.", type: "string", initialValue: '"main"' },
    {
      id: "colourSpace",
      name: "Colour Space",
      desc: "How to interpret the channel values.",
      type: "combo",
      initialValue: "rgb",
      items: [
        { rgb: "RGB (R,G,B in 0-255)" },
        { hsl: "HSL (H 0-360, S/L 0-100)" },
        { hsv: "HSV (H 0-360, S/V 0-100)" },
      ],
    },
    {
      id: "startMode",
      name: "Start Mode",
      desc: "Current value uses the spring's current value. From value uses explicit from channels.",
      type: "combo",
      initialValue: "current",
      items: [
        { current: "Current value" },
        { from_value: "From value" },
      ],
    },
    { id: "from1", name: "From Channel 1", desc: "Used when Start Mode is From value. RGB: Red, HSL/HSV: Hue.", type: "number", initialValue: "0" },
    { id: "from2", name: "From Channel 2", desc: "Used when Start Mode is From value. RGB: Green, HSL/HSV: Saturation.", type: "number", initialValue: "0" },
    { id: "from3", name: "From Channel 3", desc: "Used when Start Mode is From value. RGB: Blue, HSL: Lightness, HSV: Value.", type: "number", initialValue: "0" },
    { id: "to1", name: "To Channel 1", desc: "RGB: Red, HSL/HSV: Hue.", type: "number", initialValue: "255" },
    { id: "to2", name: "To Channel 2", desc: "RGB: Green, HSL/HSV: Saturation.", type: "number", initialValue: "255" },
    { id: "to3", name: "To Channel 3", desc: "RGB: Blue, HSL: Lightness, HSV: Value.", type: "number", initialValue: "255" },
    { id: "applyToProperties", name: "Apply To Properties", desc: "Apply the sprung colour to the instance properties.", type: "boolean", initialValue: "false" },
  ],
};

export default async function (springId, colourSpace, startMode, from1, from2, from3, to1, to2, to3, applyToProperties) {
  await this._runSpringActionWithOptionalWait(springId, true, () => {
    if (startMode === 1) {
      this._springColourFromToId(springId, colourSpace, from1, from2, from3, to1, to2, to3, !!applyToProperties);
      return;
    }
    this._springColourToId(springId, colourSpace, to1, to2, to3, !!applyToProperties);
  });
}
