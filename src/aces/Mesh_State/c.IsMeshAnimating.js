export const config = {
  listName: "Is animating",
  displayText: "Mesh is animating",
  description: "True if mesh points are currently animating.",
  isInvertible: true,
  params: [],
};

export default function () {
  return this._isMeshAnimating();
}
