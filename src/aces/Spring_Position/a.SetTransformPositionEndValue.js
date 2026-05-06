export const config = {
  listName: "End Value: Transform position spring",
  displayText: "Set transform position spring {0} end value to ({1}, {2}, {3})",
  description: "Overwrite the end value of a transform position spring.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for this transform spring.", type: "string", initialValue: '"main"' },
    { id: "x", name: "End X", desc: "End X value.", type: "number", initialValue: "0" },
    { id: "y", name: "End Y", desc: "End Y value.", type: "number", initialValue: "0" },
    { id: "z", name: "End Z", desc: "End Z value.", type: "number", initialValue: "0" },
  ],
};

export default function (springId, x, y, z) {
  this._setTransformPositionEndValueId(springId, x, y, z);
}
