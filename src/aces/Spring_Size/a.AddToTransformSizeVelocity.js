export const config = {
  listName: "Velocity: Add to size spring",
  displayText: "Add ({1}, {2}) to transform size spring {0} velocity",
  description: "Add a velocity impulse to a transform size spring.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for this transform spring.", type: "string", initialValue: '"main"' },
    { id: "width", name: "Velocity Width", desc: "Velocity to add on the width axis.", type: "number", initialValue: "0" },
    { id: "height", name: "Velocity Height", desc: "Velocity to add on the height axis.", type: "number", initialValue: "0" },
  ],
};

export default function (springId, width, height) {
  this._addToTransformSpringVelocityId(1, springId, width, height);
}