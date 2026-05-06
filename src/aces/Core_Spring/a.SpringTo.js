export const expose = false;

export const config = {
  isDeprecated: true,
  isAsync: true,
  listName: "Spring to",
  displayText: "(DEPRECATED) Spring to {0} (mode: {1})",
  description: "Deprecated. Use 'Start: Named spring' in the Multi Spring category instead.",
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

export default async function (to, mode) {
  await this._runSpringActionWithOptionalWait(this._defaultSpringId, true, () => {
    this._springTo(to, mode);
  });
}
