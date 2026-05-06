export const config = {
  isDeprecated: true,
  isAsync: true,
  listName: "Spring from/to angle (deprecated)",
  displayText: "(DEPRECATED) Spring angle from {0} to {1}",
  description: "Deprecated. Use 'Start: Named spring' in the Multi Spring category with Angle mode instead.",
  params: [
    { id: "from", name: "From", desc: "Starting angle in degrees.", type: "number", initialValue: "0" },
    { id: "to", name: "To", desc: "Target angle in degrees.", type: "number", initialValue: "90" },
  ],
};

export default async function (from, to) {
  await this._runSpringActionWithOptionalWait(this._defaultSpringId, true, () => {
    this._springFromToAngle(from, to);
  });
}
