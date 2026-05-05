export const config = {
  returnType: "string",
  description: "Get a spring id by zero-based index.",
  params: [
    { id: "index", name: "Index", desc: "Zero-based spring index.", type: "number" },
  ],
};

export default function (index) {
  return this._getSpringIdAt(index);
}