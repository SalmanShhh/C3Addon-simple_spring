export const config = {
  listName: "Mesh: Set auto mesh resolution",
  displayText: "Set auto mesh resolution to {0} × {1}",
  description: "Set the number of columns and rows used when Auto Mesh = Yes automatically creates a mesh. Higher values produce smoother, more detailed deformation at the cost of CPU. Default is 5×5. For subtle UI effects 4×4 is fine. For smooth squash/stretch on large sprites use 8×8 or higher.",
  params: [
    {
      id: "cols",
      name: "Columns",
      desc: "Number of mesh columns (2\u201332). More columns = smoother horizontal deformation. 5 is the default. Use 8\u201310 for smooth results on large sprites.",
      type: "number",
      initialValue: "5",
    },
    {
      id: "rows",
      name: "Rows",
      desc: "Number of mesh rows (2\u201332). More rows = smoother vertical deformation. 5 is the default. Use 8\u201310 for smooth results on large sprites.",
      type: "number",
      initialValue: "5",
    },
  ],
};

export default function (cols, rows) {
  this._setAutoGridResolution(cols, rows);
}
