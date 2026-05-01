export const config = {
  listName: "Spring to",
  displayText: "Spring to {0} (mode: {1})",
  description: "Spring to a target value from the current value. Inherits velocity if already animating. Use Angle mode to take the shortest rotational path.",
  params: [
    { id: "to", name: "To", desc: "Target value.", type: "number", initialValue: "100" },
    {
      id: "mode",
      name: "Mode",
      desc: "Value: spring a plain number. Angle: take the shortest rotational path (handles 360° wrapping).",
      type: "combo",
      initialValue: "value",
      items: [{ value: "Value" }, { angle: "Angle" }],
    },
  ],
};

export default function (to, mode) {
  this._springTo(to, mode);
}
