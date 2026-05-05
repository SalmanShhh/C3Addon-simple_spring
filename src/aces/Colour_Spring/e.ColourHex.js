export const config = {
  returnType: "string",
  description: "Get the current colour of a named spring as a #RRGGBB string.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id of the colour spring to query.", type: "string" },
  ],
};

export default function (springId) {
  return this._getColourHex(springId);
}
