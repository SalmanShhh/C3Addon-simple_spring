export const config = {
  returnType: "number",
  description: "Get mesh point Y offset at index.",
  params: [{ id: "index", name: "Index", desc: "Flat mesh point index (0 to MeshPointCount - 1).", type: "number" }],
};

export default function (index) {
  return this._getMeshOffsetYAtIndex(index);
}
