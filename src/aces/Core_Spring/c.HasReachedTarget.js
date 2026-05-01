export const config = {
  listName: "Has reached target",
  displayText: "Has reached target",
  description: "True if the spring has reached its target.",
  isInvertible: true,
  params: [],
};

export default function () {
  return this._hasReachedTarget();
}
