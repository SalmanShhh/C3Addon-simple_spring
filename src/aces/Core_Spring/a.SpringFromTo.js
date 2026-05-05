export const config = {
  deprecated: true,
  listName: "Spring from/to",
  displayText: "Spring from {0} to {1}",
  description: "Deprecated. Use 'Spring from/to' in the Multi Spring category instead.",
  params: [
    { id: "from", name: "From", desc: "Starting value.", type: "number", initialValue: "0" },
    { id: "to", name: "To", desc: "Target value.", type: "number", initialValue: "100" },
  ],
};

export default function (from, to) {
  this._springFromTo(from, to);
}
