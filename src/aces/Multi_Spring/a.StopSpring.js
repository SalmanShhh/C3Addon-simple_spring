export const config = {
  listName: "Stop spring",
  displayText: "Stop spring {0} at current value",
  description: "Stop a named spring immediately at its current value.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for the spring to stop.", type: "string", initialValue: '"main"' },
  ],
};

export default function (springId) {
  this._stopAtCurrentValueId(springId);
}