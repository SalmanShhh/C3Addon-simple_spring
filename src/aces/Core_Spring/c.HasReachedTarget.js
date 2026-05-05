export const config = {
  deprecated: true,
  listName: "Has reached target",
  displayText: "Has reached target",
  description: "Deprecated. Use 'Has spring reached target' in the Multi Spring category instead.",
  isInvertible: true,
  params: [],
};

export default function () {
  return this._hasReachedTarget();
}
