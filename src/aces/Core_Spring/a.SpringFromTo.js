export const config = {
  isDeprecated: true,
  isAsync: true,
  listName: "Spring from/to",
  displayText: "(DEPRECATED) Spring from {0} to {1}",
  description: "Deprecated. Use 'Start: Named spring' in the Multi Spring category instead.",
  params: [
    { id: "from", name: "From", desc: "Starting value.", type: "number", initialValue: "0" },
    { id: "to", name: "To", desc: "Target value.", type: "number", initialValue: "100" },
  ],
};

export default async function (from, to) {
  await this._runSpringActionWithOptionalWait(this._defaultSpringId, true, () => {
    this._springFromTo(from, to);
  });
}
