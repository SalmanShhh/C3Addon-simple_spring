export const config = {
  listName: "On unsupported",
  displayText: "On mesh unsupported",
  description: "Triggered when a mesh action is called on an instance that does not support mesh.",
  isTrigger: true,
  params: [],
};

export default function () {
  return true;
}
