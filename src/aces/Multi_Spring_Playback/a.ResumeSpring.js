export const config = {
  listName: "Resume: Spring by ID",
  displayText: "Resume spring \"{0}\"",
  description: "Resume a previously paused spring by ID.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for the spring to resume.", type: "string", initialValue: '"main"' },
  ],
};

export default function (springId) {
  this._resumeSpringById(springId);
}
