export const config = {
  listName: "Stop: Spring by ID",
  displayText: "Stop spring \"{0}\"",
  description: "Clear a spring by ID.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for the spring to clear.", type: "string", initialValue: '"main"' },
  ],
};

export default function (springId) {
  this._clearSpringById(springId);
}