export const config = {
  listName: "Set spring velocity",
  displayText: "Set spring {0} velocity to {1}",
  description: "Directly set the current velocity of a named spring.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for the spring to update.", type: "string", initialValue: '"main"' },
    { id: "value", name: "Velocity", desc: "Velocity value.", type: "number", initialValue: "0" },
  ],
};

export default function (springId, value) {
  this._setVelocityId(springId, value);
}