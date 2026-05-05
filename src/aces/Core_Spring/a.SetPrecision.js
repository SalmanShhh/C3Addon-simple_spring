export const config = {
  deprecated: true,
  listName: "Set precision",
  displayText: "Set precision to {0}",
  description: "Deprecated. Use 'Set spring settings' in the Multi Spring category instead.",
  params: [{ id: "value", name: "Precision", desc: "Precision threshold (0.0001-1).", type: "number", initialValue: "0.01" }],
};

export default function (value) {
  this._setPrecision(value);
}
