export const config = {
  listName: "Spring from/to",
  displayText: "Spring from {0} to {1}",
  description: "Spring numeric value from start to target. Inherits velocity if already animating.",
  params: [
    { id: "from", name: "From", desc: "Starting value.", type: "number", initialValue: "0" },
    { id: "to", name: "To", desc: "Target value.", type: "number", initialValue: "100" },
  ],
};

export default function (from, to) {
  this._springFromTo(from, to);
}
