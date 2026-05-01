export const config = {
  listName: "Set precision",
  displayText: "Set mesh precision to {0}",
  description: "Set mesh settle precision.",
  params: [{ id: "value", name: "Precision", desc: "Mesh precision threshold.", type: "number", initialValue: "0.01" }],
};

export default function (value) {
  this._setMeshPrecision(value);
}
