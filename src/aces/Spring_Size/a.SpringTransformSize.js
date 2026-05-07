export const config = {
  listName: "Apply Size spring",
  displayText: "Spring size \"{0}\" from ({1}, {2}) to ({3}, {4}), Apply to Property ({5})",
  description: "Size spring action using explicit start and end values, with optional apply-to-properties.",
  isAsync: true,
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for this transform spring.", type: "string", initialValue: '"main"' },
    { id: "fromA", name: "From Width", desc: "From width.", type: "number", initialValue: "0" },
    { id: "fromB", name: "From Height", desc: "From height.", type: "number", initialValue: "0" },
    { id: "toA", name: "To Width", desc: "To width.", type: "number", initialValue: "0" },
    { id: "toB", name: "To Height", desc: "To height.", type: "number", initialValue: "0" },
    { id: "applyToProperties", name: "Apply To Properties", desc: "Apply the sprung transform to the instance properties.", type: "boolean", initialValue: "false" },
  ],
};

export default async function (springId, fromA, fromB, toA, toB, applyToProperties) {
  await this._runSpringActionWithOptionalWait(springId, true, () => {
    this._springSizeFromToId(springId, fromA, fromB, 0, toA, toB, 0, !!applyToProperties);
  });
}
