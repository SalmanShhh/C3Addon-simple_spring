export const config = {
  returnType: "number",
  description: "Get the target value of a named spring.",
  params: [
    { id: "springId", name: "Spring ID", desc: "ID of the spring to query.", type: "string" },
  ],
};

export default function (springId) {
  return this._getSpringTo(springId);
}