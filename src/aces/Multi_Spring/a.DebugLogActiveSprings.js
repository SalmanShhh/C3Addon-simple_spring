export const config = {
  listName: "Debug: Log active springs",
  displayText: "Debug: Log active springs to console",
  description: "Output a table of currently active springs and state values to the browser console.",
  params: [],
};

export default function () {
  this._debugLogActiveSprings();
}
