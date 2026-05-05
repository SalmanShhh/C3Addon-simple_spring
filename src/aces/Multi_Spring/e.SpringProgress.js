export const config = {
  returnType: "number",
  description: "Get progress from 0 to 1 for a named spring.",
  params: [
    { id: "springId", name: "Spring ID", desc: "ID of the spring to query.", type: "string" },
  ],
};

export default function (springId) {
  return this._getSpringProgress(springId);
}