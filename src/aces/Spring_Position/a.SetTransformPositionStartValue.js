export const config = {
  listName: "Start Value: Transform position spring",
  displayText: "Set transform position spring {0} start value to ({1}, {2}, {3})",
  description: "Overwrite the start value of a transform position spring.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for this transform spring.", type: "string", initialValue: '"main"' },
    { id: "x", name: "Start X", desc: "Start X value.", type: "number", initialValue: "0" },
    { id: "y", name: "Start Y", desc: "Start Y value.", type: "number", initialValue: "0" },
    { id: "z", name: "Start Z", desc: "Start Z value.", type: "number", initialValue: "0" },
  ],
};

export default function (springId, x, y, z) {
  this._setTransformPositionStartValueId(springId, x, y, z);
}
