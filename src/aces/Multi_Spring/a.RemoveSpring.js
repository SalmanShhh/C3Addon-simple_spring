export const config = {
  listName: "Manage: Remove spring",
  displayText: "Remove spring {0}",
  description: "Remove a named spring and its state. The legacy default spring is reset instead of removed.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for the spring to remove.", type: "string", initialValue: '"main"' },
  ],
};

export default function (springId) {
  this._removeSpring(springId);
}