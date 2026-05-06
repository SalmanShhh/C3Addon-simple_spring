export const config = {
  listName: "Pause: Spring by ID",
  displayText: "Pause spring {0}",
  description: "Pause a spring by ID if it is active.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for the spring to pause.", type: "string", initialValue: '"main"' },
  ],
};

export default function (springId) {
  this._pauseSpringById(springId);
}
