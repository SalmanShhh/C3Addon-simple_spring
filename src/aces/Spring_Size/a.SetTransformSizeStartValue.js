export const config = {
  listName: "Start Value: Transform size spring",
  displayText: "Set transform size spring \"{0}\" start value to ({1}, {2})",
  description: "Overwrite the start value of a transform size spring.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for this transform spring.", type: "string", initialValue: '"main"' },
    { id: "width", name: "Start Width", desc: "Start width value.", type: "number", initialValue: "0" },
    { id: "height", name: "Start Height", desc: "Start height value.", type: "number", initialValue: "0" },
  ],
};

export default function (springId, width, height) {
  this._setTransformSizeStartValueId(springId, width, height);
}
