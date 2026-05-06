export const config = {
  listName: "Stop: All springs",
  displayText: "Stop all springs",
  description: "Stop and clear all springs.",
};

export default function () {
  this._clearAllSprings();
}
