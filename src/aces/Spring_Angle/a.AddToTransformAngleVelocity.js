export const config = {
  listName: "Velocity: Add to angle spring",
  displayText: "Add {1} to transform angle spring {0} velocity",
  description: "Add angular velocity to a transform angle spring.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for this transform spring.", type: "string", initialValue: '"main"' },
    { id: "velocity", name: "Angular Velocity", desc: "Angular velocity to add in degrees per step.", type: "number", initialValue: "0" },
  ],
};

export default function (springId, velocity) {
  this._addToTransformSpringVelocityId(2, springId, velocity);
}