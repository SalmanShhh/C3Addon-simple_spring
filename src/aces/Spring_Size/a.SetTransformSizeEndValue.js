export const config = {
  listName: "End Value: Transform size spring",
  displayText: "Set transform size spring {0} end value to ({1}, {2})",
  description: "Overwrite the end value of a transform size spring.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for this transform spring.", type: "string", initialValue: '"main"' },
    { id: "width", name: "End Width", desc: "End width value.", type: "number", initialValue: "0" },
    { id: "height", name: "End Height", desc: "End height value.", type: "number", initialValue: "0" },
  ],
};

export default function (springId, width, height) {
  this._setTransformSizeEndValueId(springId, width, height);
}
