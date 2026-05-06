export const config = {
  listName: "Start: Transform size spring to properties",
  displayText: "Spring size {0} to properties from ({1}, {2}) to ({3}, {4})",
  description: "Size spring action using explicit start and end values, applying the sprung transform to the instance properties.",
  isAsync: true,
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for this transform spring.", type: "string", initialValue: '"main"' },
    { id: "fromA", name: "From Width", desc: "From width.", type: "number", initialValue: "0" },
    { id: "fromB", name: "From Height", desc: "From height.", type: "number", initialValue: "0" },
    { id: "toA", name: "To Width", desc: "To width.", type: "number", initialValue: "0" },
    { id: "toB", name: "To Height", desc: "To height.", type: "number", initialValue: "0" },
  ],
};

export default async function (springId, fromA, fromB, toA, toB) {
  await this._runSpringActionWithOptionalWait(springId, true, () => {
    this._springSizeFromToId(springId, fromA, fromB, 0, toA, toB, 0, true);
  });
}
