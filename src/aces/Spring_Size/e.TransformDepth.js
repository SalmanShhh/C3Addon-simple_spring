export const config = {
  returnType: "number",
  description: "Get the current sprung depth value for a transform size spring.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id of the transform spring to query.", type: "string" },
  ],
};

export default function (springId) {
  return this._getSprungDepth(springId);
}
