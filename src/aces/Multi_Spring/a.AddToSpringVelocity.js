export const config = {
  listName: "Velocity: Add to named spring",
  displayText: "Add {1} to spring {0} velocity",
  description: "Add an impulse to a named spring's current velocity.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for the spring to update.", type: "string", initialValue: '"main"' },
    { id: "value", name: "Velocity", desc: "Velocity delta.", type: "number", initialValue: "10" },
  ],
};

export default function (springId, value) {
  this._addToVelocityId(springId, value);
}