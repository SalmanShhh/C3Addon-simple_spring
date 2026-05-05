export const config = {
  listName: "Apply spring colour to object",
  displayText: "Apply spring colour {0} to object",
  description: "One-shot apply of the current sprung colour to the host object using supported runtime colour APIs. For fewer actions, use Spring/Reset colour ACEs with Apply To Object = Yes.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for the colour spring.", type: "string", initialValue: '"main"' },
  ],
};

export default function (springId) {
  this._applySprungColourToObject(springId);
}
