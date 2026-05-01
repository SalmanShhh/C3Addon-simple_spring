export const config = {
  listName: "Create grid",
  displayText: "Create mesh grid {0}x{1}",
  description: "Create or replace a mesh grid on the instance and initialize mesh spring state.",
  params: [
    { id: "cols", name: "Columns", desc: "Number of mesh columns (minimum 2).", type: "number", initialValue: "5" },
    { id: "rows", name: "Rows", desc: "Number of mesh rows (minimum 2).", type: "number", initialValue: "5" },
  ],
};

export default function (cols, rows) {
  this._createMeshGrid(cols, rows);
}
