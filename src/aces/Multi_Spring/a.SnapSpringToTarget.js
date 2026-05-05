export const config = {
  listName: "Snap spring to target",
  displayText: "Snap spring {0} to target",
  description: "Finish a named spring immediately at its target value.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for the spring to snap.", type: "string", initialValue: '"main"' },
  ],
};

export default function (springId) {
  this._snapToTargetId(springId);
}