export const config = {
  returnType: "number",
  description: "Estimate how long in seconds a named spring will take to settle at its target from its current state. Returns 0 if already settled or spring missing, or -1 if not settled within the simulation window.",
  params: [
    { id: "springId", name: "Spring ID", desc: "ID of the spring to query.", type: "string" },
  ],
};

export default function (springId) {
  return this._estimateSpringTimeToTargetSeconds(springId);
}
