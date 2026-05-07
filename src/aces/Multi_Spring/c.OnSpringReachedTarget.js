export const config = {
  listName: "On spring reached target",
  displayText: "On spring \"{0}\" reached target",
  description: "Triggered when a named spring settles at its target. Leave the id empty to catch any spring.",
  isTrigger: true,
  params: [
    { id: "springId", name: "Spring ID", desc: "Specific spring id to filter, or leave empty for any spring.", type: "string", initialValue: '""' },
  ],
};

export default function (springId) {
  const value = String(springId ?? "").trim();
  return !value || this._lastCompletedSpringId === value;
}