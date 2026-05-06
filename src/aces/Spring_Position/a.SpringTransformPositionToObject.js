export const config = {
  listName: "Start: Transform position XYZ spring to properties",
  displayText: "Spring position {0} to properties from ({1}, {2}, {3}) to ({4}, {5}, {6})",
  description: "Position spring action using explicit start and end values, including optional Z channel, and applying the sprung transform to the instance properties.",
  isAsync: true,
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for this transform spring.", type: "string", initialValue: '"main"' },
    { id: "fromA", name: "From X", desc: "From X.", type: "number", initialValue: "0" },
    { id: "fromB", name: "From Y", desc: "From Y.", type: "number", initialValue: "0" },
    { id: "fromC", name: "From Z", desc: "From Z.", type: "number", initialValue: "0" },
    { id: "toA", name: "To X", desc: "To X.", type: "number", initialValue: "0" },
    { id: "toB", name: "To Y", desc: "To Y.", type: "number", initialValue: "0" },
    { id: "toC", name: "To Z", desc: "To Z.", type: "number", initialValue: "0" },
  ],
};

export default async function (springId, fromA, fromB, fromC, toA, toB, toC) {
  await this._runSpringActionWithOptionalWait(springId, true, () => {
    this._springPositionFromToId(springId, fromA, fromB, fromC, toA, toB, toC, true);
  });
}
