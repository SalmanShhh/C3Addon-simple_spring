export const config = {
  listName: "Reset colour spring",
  displayText: "Reset colour spring {0} to ({2}, {3}, {4}) in {1} and apply to object: {5}",
  description: "Instantly reset all channels of a named colour spring to a value using the selected colour space, with optional object apply.",
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
    { id: "c1", name: "Channel 1", desc: "RGB: Red, HSL/HSV: Hue.", type: "number", initialValue: "0" },
    { id: "c2", name: "Channel 2", desc: "RGB: Green, HSL: Saturation, HSV: Saturation.", type: "number", initialValue: "0" },
    { id: "c3", name: "Channel 3", desc: "RGB: Blue, HSL: Lightness, HSV: Value.", type: "number", initialValue: "0" },
    {
      id: "applyToObject",
      name: "Use For Instance",
      desc: "Yes applies the reset colour to the object now and keeps auto-apply on. No keeps it expression-only.",
      type: "combo",
      initialValue: "no",
      items: [
        { no: "No" },
        { yes: "Yes" },
      ],
    },
  ],
};

export default function (springId, colourSpace, c1, c2, c3, applyToObject) {
  this._resetColourSpringId(springId, colourSpace, c1, c2, c3, applyToObject === 1);
}
