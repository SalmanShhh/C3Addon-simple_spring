export const config = {
  isDeprecated: true,
  listName: "Is animating",
  displayText: "(DEPRECATED) Is animating",
  description: "Deprecated. Use 'Is spring animating' in the Multi Spring category instead.",
  isInvertible: true,
  params: [],
};

export default function () {
  return this._isSpringAnimating();
}
