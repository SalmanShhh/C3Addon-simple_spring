export const config = {
  listName: "Has settled",
  displayText: "Mesh has settled",
  description: "True if mesh motion is currently settled.",
  isInvertible: true,
  params: [],
};

export default function () {
  return this._hasMeshSettled();
}
