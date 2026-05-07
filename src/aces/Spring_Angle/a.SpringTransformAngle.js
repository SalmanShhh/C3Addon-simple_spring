export const config = {
  listName: "Apply Angle spring",
  displayText: "Spring angle \"{0}\" from {1} to {2}, Apply to Property ({3})",
  description: "Combined angle spring action using explicit start and end values, with optional apply-to-properties.",
  isAsync: true,
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for this transform spring.", type: "string", initialValue: '"main"' },
    { id: "fromAngle", name: "From Angle", desc: "Start angle in degrees.", type: "number", initialValue: "0" },
    { id: "toAngle", name: "To Angle", desc: "Target angle in degrees.", type: "number", initialValue: "0" },
    { id: "applyToProperties", name: "Apply To Properties", desc: "Apply the sprung result to the instance properties.", type: "boolean", initialValue: "false" },
  ],
};

export default async function (springId, fromAngle, toAngle, applyToProperties) {
  await this._runSpringActionWithOptionalWait(springId, true, () => {
    this._springAngleFromToId(springId, fromAngle, toAngle, !!applyToProperties);
  });
}
