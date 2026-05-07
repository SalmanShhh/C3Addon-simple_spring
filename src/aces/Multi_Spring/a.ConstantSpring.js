export const config = {
  listName: "Apply Constant: Set spring",
  displayText: "Constant Spring \"{0}\" property Value to ({1})",
  description: "Enable or update a constant named spring, springing toward the given target each tick. New springs inherit the behavior's default stiffness, damping, and precision. Use the Settings ACE to override per spring. Use Pause/Stop playback ACEs to deactivate.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for the spring.", type: "string", initialValue: '"main"' },
    { id: "target", name: "Target", desc: "Target value to spring toward.", type: "number", initialValue: "0" },
  ],
};

export default function (springId, target) {
  this._setAlwaysSpringId(springId, true, target, "value");
}
