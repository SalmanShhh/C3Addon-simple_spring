export const config = {
  listName: "Constant: Set position spring",
  displayText: "Set constant position spring {0} target to ({1}, {2}, {3}), apply to properties: {4}",
  description: "Enable or update a constant position spring, springing toward the given target each tick. New springs inherit the behavior's default stiffness, damping, and precision. Use the Settings ACE to override per spring. Use Pause/Stop playback ACEs to deactivate.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for this transform spring.", type: "string", initialValue: '"main"' },
    { id: "targetX", name: "Target X", desc: "Position X target.", type: "number", initialValue: "0" },
    { id: "targetY", name: "Target Y", desc: "Position Y target.", type: "number", initialValue: "0" },
    { id: "targetZ", name: "Target Z", desc: "Position Z target.", type: "number", initialValue: "0" },
    { id: "applyToProperties", name: "Apply To Properties", desc: "Apply the sprung result to the instance properties.", type: "boolean", initialValue: "false" },
  ],
};

export default function (springId, targetX, targetY, targetZ, applyToProperties) {
  this._configureTransformAlwaysSpringId(0, springId, 0, targetX, targetY, targetZ, 0, !!applyToProperties);
}
