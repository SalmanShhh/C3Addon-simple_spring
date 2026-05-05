export const config = {
  listName: "Stop colour spring",
  displayText: "Stop colour spring {0}",
  description: "Stop all channels of a named colour spring at their current values.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for the colour spring.", type: "string", initialValue: '"main"' },
  ],
};

export default function (springId) {
  this._stopColourSpringId(springId);
}
