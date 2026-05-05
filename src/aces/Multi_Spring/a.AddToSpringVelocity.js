export const config = {
  listName: "Add to spring velocity",
  displayText: "Add {1} to spring {0} velocity",
  description: "Add velocity to a named spring.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for the spring to update.", type: "string", initialValue: '"main"' },
    { id: "value", name: "Velocity", desc: "Velocity delta.", type: "number", initialValue: "10" },
  ],
};

export default function (springId, value) {
  this._addToVelocityId(springId, value);
}