export const config = {
  returnType: "string",
  description: "Get the current colour space used by a named colour spring (rgb, hsl, or hsv).",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id of the colour spring to query.", type: "string" },
  ],
};

export default function (springId) {
  return this._getColourSpace(springId);
}
