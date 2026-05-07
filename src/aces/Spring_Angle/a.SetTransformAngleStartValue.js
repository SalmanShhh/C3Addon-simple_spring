export const config = {
  listName: "Start Value: Transform angle spring",
  displayText: "Set transform angle spring \"{0}\" start value to {1}",
  description: "Overwrite the start value of a transform angle spring.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for this transform spring.", type: "string", initialValue: '"main"' },
    { id: "angle", name: "Start Angle", desc: "Start angle value in degrees.", type: "number", initialValue: "0" },
  ],
};

export default function (springId, angle) {
  this._setTransformAngleStartValueId(springId, angle);
}
