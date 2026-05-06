export const config = {
  listName: "Constant: Set size spring",
  displayText: "Set constant size spring {0} target to ({1}, {2}), apply to properties: {3}",
  description: "Enable or update a constant size spring, springing toward the given target each tick. New springs inherit the behavior's default stiffness, damping, and precision. Use the Settings ACE to override per spring. Use Pause/Stop playback ACEs to deactivate.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for this transform spring.", type: "string", initialValue: '"main"' },
    { id: "targetW", name: "Target Width", desc: "Target width.", type: "number", initialValue: "0" },
    { id: "targetH", name: "Target Height", desc: "Target height.", type: "number", initialValue: "0" },
    { id: "applyToProperties", name: "Apply To Properties", desc: "Apply the spring results to the instance properties.", type: "boolean", initialValue: "false" },
  ],
};

export default function (springId, targetW, targetH, applyToProperties) {
  this._configureTransformAlwaysSpringId(1, springId, 0, targetW, targetH, 0, 0, !!applyToProperties);
}
