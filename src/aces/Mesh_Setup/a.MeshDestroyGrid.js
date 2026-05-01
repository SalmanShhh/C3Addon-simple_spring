export const config = {
  listName: "Destroy grid",
  displayText: "Destroy mesh grid",
  description: "Destroy the mesh and clear all mesh spring state.",
  params: [],
};

export default function () {
  this._destroyMeshGrid();
}
