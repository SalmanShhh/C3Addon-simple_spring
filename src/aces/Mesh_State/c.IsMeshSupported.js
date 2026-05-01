export const config = {
  listName: "Is supported",
  displayText: "Mesh is supported",
  description: "True if the attached instance supports mesh API operations.",
  isInvertible: true,
  params: [],
};

export default function () {
  return this._isMeshSupported();
}
