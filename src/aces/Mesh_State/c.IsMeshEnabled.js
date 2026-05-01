export const config = {
  listName: "Is enabled",
  displayText: "Mesh is enabled",
  description: "True if mesh spring simulation is enabled.",
  isInvertible: true,
  params: [],
};

export default function () {
  return this._isMeshEnabled();
}
