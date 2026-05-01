export const config = {
  listName: "Mesh: Stop constant sway",
  displayText: "Stop constant sway",
  description: "Stop the continuous sway. The mesh vertices spring back to rest naturally — OnMeshSettled fires when they come to a stop.",
  params: [],
};

export default function () {
  this._stopMeshSway();
}
