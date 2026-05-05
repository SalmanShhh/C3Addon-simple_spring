export const config = {
  returnType: "number",
  description: "Get stiffness, damping, or precision of a named spring.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id of the spring to query.", type: "string" },
    {
      id: "property",
      name: "Property",
      desc: "Which spring property to read.",
      type: "string",
    },
  ],
};

export default function (springId, property) {
  const key = String(property ?? "").trim().toLowerCase();
  if (key === "1" || key === "damping") {
    return this._getSpringDamping(springId);
  }
  if (key === "2" || key === "precision") {
    return this._getSpringPrecision(springId);
  }
  return this._getSpringStiffness(springId);
}
