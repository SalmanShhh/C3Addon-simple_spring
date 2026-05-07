export const config = {
  listName: "Apply Constant: Set angle spring",
  displayText: "Constant Spring angle \"{0}\" property Angle to ({1}), (Apply to Property: {2})",
  description: "Enable or update a constant angle spring, springing toward the given target each tick. New springs inherit the behavior's default stiffness, damping, and precision. Use the Settings ACE to override per spring. Use Pause/Stop playback ACEs to deactivate.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for this transform angle spring.", type: "string", initialValue: '"main"' },
    { id: "targetAngle", name: "Target Angle", desc: "Target angle in degrees.", type: "number", initialValue: "0" },
    { id: "applyToProperties", name: "Apply To Properties", desc: "Apply the sprung result to the instance properties.", type: "boolean", initialValue: "false" },
  ],
};

export default function (springId, targetAngle, applyToProperties) {
  this._configureTransformAlwaysSpringId(2, springId, 0, targetAngle, 0, 0, 1, !!applyToProperties);
}
