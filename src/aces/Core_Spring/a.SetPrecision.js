export const config = {
  listName: "Set precision",
  displayText: "Set precision to {0}",
  description: "Set spring precision threshold (0.0001-1).",
  params: [{ id: "value", name: "Precision", desc: "Precision threshold (0.0001-1).", type: "number", initialValue: "0.01" }],
};

export default function (value) {
  this._setPrecision(value);
}
