export const config = {
  deprecated: true,
  listName: "Spring from/to angle (deprecated)",
  displayText: "Spring angle from {0} to {1}",
  description: "Deprecated. Use 'Spring to' in the Multi Spring category with Angle mode instead.",
  params: [
    { id: "from", name: "From", desc: "Starting angle in degrees.", type: "number", initialValue: "0" },
    { id: "to", name: "To", desc: "Target angle in degrees.", type: "number", initialValue: "90" },
  ],
};

export default function (from, to) {
  this._springFromToAngle(from, to);
}
