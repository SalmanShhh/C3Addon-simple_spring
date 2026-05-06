export const config = {
  listName: "Constant: Set colour spring",
  displayText: "Set constant colour spring {0} target to ({2}, {3}, {4}) in {1}, apply to properties: {5}",
  description: "Enable or update a constant colour spring, springing toward the given target each tick. New springs inherit the behavior's default stiffness, damping, and precision. Use the Settings ACE to override per spring. Use Pause/Stop playback ACEs to deactivate.",
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
    { id: "to1", name: "Target Channel 1", desc: "RGB: Red, HSL/HSV: Hue.", type: "number", initialValue: "255" },
    { id: "to2", name: "Target Channel 2", desc: "RGB: Green, HSL/HSV: Saturation.", type: "number", initialValue: "255" },
    { id: "to3", name: "Target Channel 3", desc: "RGB: Blue, HSL: Lightness, HSV: Value.", type: "number", initialValue: "255" },
    { id: "applyToProperties", name: "Apply To Properties", desc: "Apply the sprung colour to the instance properties.", type: "boolean", initialValue: "false" },
  ],
};

export default function (springId, colourSpace, to1, to2, to3, applyToProperties) {
  this._configureColourAlwaysSpringId(springId, 0, colourSpace, to1, to2, to3, !!applyToProperties);
}
