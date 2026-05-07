export const config = {
  listName: "Velocity: Add to position spring",
  displayText: "Add ({1}, {2}, {3}) to transform position spring \"{0}\" velocity",
  description: "Add a velocity impulse to a transform position spring.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for this transform spring.", type: "string", initialValue: '"main"' },
    { id: "x", name: "Velocity X", desc: "Velocity to add on the X axis.", type: "number", initialValue: "0" },
    { id: "y", name: "Velocity Y", desc: "Velocity to add on the Y axis.", type: "number", initialValue: "0" },
    { id: "z", name: "Velocity Z", desc: "Velocity to add on the Z axis.", type: "number", initialValue: "0" },
  ],
};

export default function (springId, x, y, z) {
  this._addToTransformSpringVelocityId(0, springId, x, y, z);
}