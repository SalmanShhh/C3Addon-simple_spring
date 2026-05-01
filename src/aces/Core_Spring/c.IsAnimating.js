export const config = {
  listName: "Is animating",
  displayText: "Is animating",
  description: "True if the spring is currently animating.",
  isInvertible: true,
  params: [],
};

export default function () {
  return this._isSpringAnimating();
}
