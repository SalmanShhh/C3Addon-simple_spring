export const config = {
  listName: "Reset spring",
  displayText: "Reset spring {0} to {1}",
  description: "Reset a named spring to a specific value without animating.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for the spring to reset.", type: "string", initialValue: '"main"' },
    { id: "value", name: "Value", desc: "Value to reset the spring to.", type: "number", initialValue: "0" },
  ],
};

export default function (springId, value) {
  this._resetToValueId(springId, value);
}