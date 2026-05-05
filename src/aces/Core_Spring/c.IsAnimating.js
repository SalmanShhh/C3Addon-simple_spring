export const config = {
  deprecated: true,
  listName: "Is animating",
  displayText: "Is animating",
  description: "Deprecated. Use 'Is spring animating' in the Multi Spring category instead.",
  isInvertible: true,
  params: [],
};

export default function () {
  return this._isSpringAnimating();
}
