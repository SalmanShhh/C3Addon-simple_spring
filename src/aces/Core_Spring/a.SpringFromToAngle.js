export const config = {
  deprecated: true,
  listName: "Spring from/to angle (deprecated)",
  displayText: "Spring angle from {0} to {1}",
  description: "Deprecated: use 'Spring to' with Angle mode instead. Spring angle value from start to target, taking the shortest path.",
  params: [
    { id: "from", name: "From", desc: "Starting angle in degrees.", type: "number", initialValue: "0" },
    { id: "to", name: "To", desc: "Target angle in degrees.", type: "number", initialValue: "90" },
  ],
};

export default function (from, to) {
  this._springFromToAngle(from, to);
}
