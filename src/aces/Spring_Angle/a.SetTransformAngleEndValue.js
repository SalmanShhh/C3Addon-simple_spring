export const config = {
  listName: "End Value: Transform angle spring",
  displayText: "Set transform angle spring \"{0}\" end value to {1}",
  description: "Overwrite the end value of a transform angle spring.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for this transform spring.", type: "string", initialValue: '"main"' },
    { id: "angle", name: "End Angle", desc: "End angle value in degrees.", type: "number", initialValue: "0" },
  ],
};

export default function (springId, angle) {
  this._setTransformAngleEndValueId(springId, angle);
}
