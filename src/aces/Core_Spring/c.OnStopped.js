export const config = {
  listName: "On stopped",
  displayText: "On stopped",
  description: "Triggered when the spring is manually stopped via Stop or Snap to target.",
  isTrigger: true,
  params: [],
};

export default function () {
  return true;
}
