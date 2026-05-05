export const config = {
  returnType: "number",
  description: "Get the current red channel (0-255) of a named colour spring.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id of the colour spring to query.", type: "string" },
  ],
};

export default function (springId) {
  return this._getColourRed(springId);
}
