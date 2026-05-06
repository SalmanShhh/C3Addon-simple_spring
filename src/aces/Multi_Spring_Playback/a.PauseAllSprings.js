export const config = {
  listName: "Pause: All springs",
  displayText: "Pause all springs",
  description: "Pause all active springs.",
};

export default function () {
  this._pauseAllSprings();
}
