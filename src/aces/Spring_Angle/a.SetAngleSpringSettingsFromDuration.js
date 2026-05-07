export const config = {
  listName: "Settings: Set angle spring from duration",
  displayText: "Set angle spring \"{0}\" settings from duration {1}s, precision {2}, bounce profile {3}",
  description: "Compute stiffness and damping so an angle spring settles in about the requested duration, with a selectable bounce profile.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for this transform spring.", type: "string", initialValue: '"main"' },
    { id: "duration", name: "Duration", desc: "Approximate time in seconds for the spring to settle.", type: "number", initialValue: "0.5" },
    { id: "precision", name: "Precision", desc: "Completion threshold in range 0.0001-1.", type: "number", initialValue: "0.01" },
    {
      id: "bounceProfile",
      name: "Bounce Profile",
      desc: "How bouncy the duration fit should be.",
      type: "combo",
      initialValue: "balanced",
      items: [
        { no_bounce: "No bounce" },
        { balanced: "Balanced" },
        { bouncy: "Bouncy" },
        { very_bouncy: "Very bouncy" },
      ],
    },
  ],
};

export default function (springId, duration, precision, bounceProfile) {
  this._setTransformSpringSettingsFromDurationId(2, springId, duration, precision, bounceProfile);
}