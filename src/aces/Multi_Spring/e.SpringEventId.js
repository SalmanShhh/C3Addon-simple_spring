export const config = {
  returnType: "string",
  description: "Get recent spring event ids.",
  params: [
    {
      id: "eventType",
      name: "Event Type",
      desc: "Last triggered spring id or last completed spring id.",
      type: "string",
    },
  ],
};

export default function (eventType) {
  const key = String(eventType ?? "").trim().toLowerCase();
  if (key === "1" || key === "last_completed" || key === "completed") {
    return this._getLastCompletedSpringId();
  }
  return this._getLastSpringId();
}
