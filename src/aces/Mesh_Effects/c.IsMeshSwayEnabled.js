export const config = {
  listName: "Is mesh sway enabled",
  displayText: "Mesh sway is enabled",
  description: "True while constant sway is running. Use this to check whether sway was started before starting it again, or to branch logic when sway is active.",
  isTrigger: false,
  isInvertible: true,
  params: [],
};

export default function () {
  return this._meshSwayEnabled;
}
