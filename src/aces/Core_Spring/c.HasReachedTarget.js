export const config = {
  isDeprecated: true,
  listName: "Has reached target",
  displayText: "(DEPRECATED) Has reached target",
  description: "Deprecated. Use 'Has spring reached target' in the Multi Spring category instead.",
  isInvertible: true,
  params: [],
};

export default function () {
  return this._hasReachedTarget();
}
