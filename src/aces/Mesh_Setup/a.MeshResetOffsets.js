export const config = {
  listName: "Reset offsets",
  displayText: "Reset mesh offsets",
  description: "Reset all mesh point offsets and velocities back to rest.",
  params: [],
};

export default function () {
  this._resetMeshOffsets();
}
