export const config = {
  listName: "Start: Transform angle spring to properties",
  displayText: "Spring angle {0} to properties from {1} to {2}",
  description: "Combined angle spring action using explicit start and end values, applying the sprung angle to the instance properties.",
  isAsync: true,
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for this transform spring.", type: "string", initialValue: '"main"' },
    { id: "fromAngle", name: "From Angle", desc: "Start angle in degrees.", type: "number", initialValue: "0" },
    { id: "toAngle", name: "To Angle", desc: "Target angle in degrees.", type: "number", initialValue: "0" },
  ],
};

export default async function (springId, fromAngle, toAngle) {
  await this._runSpringActionWithOptionalWait(springId, true, () => {
    this._springAngleFromToId(springId, fromAngle, toAngle, true);
  });
}
