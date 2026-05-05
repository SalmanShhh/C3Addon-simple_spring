export const expose = false;

export const config = {
  deprecated: true,
  listName: "Spring to",
  displayText: "Spring to {0} (mode: {1})",
  description: "Deprecated. Use 'Spring to' in the Multi Spring category instead.",
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
