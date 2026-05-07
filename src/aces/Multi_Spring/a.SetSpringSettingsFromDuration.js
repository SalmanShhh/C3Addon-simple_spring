export const config = {
  listName: "Settings: Set spring from duration",
  displayText: "Set spring \"{0}\" settings from duration {1}s, precision {2}, bounce profile {3}",
  description: "Compute stiffness and damping so a named spring settles in about the requested duration, with a selectable bounce profile.",
  params: [
    { id: "springId", name: "Spring ID", desc: "Unique id for the spring to configure.", type: "string", initialValue: '"main"' },
    { id: "duration", name: "Duration", desc: "Approximate time in seconds for the spring to settle.", type: "number", initialValue: "0.5" },
    { id: "precision", name: "Precision", desc: "Settle threshold (0.0001-1). Lower values require closer proximity to target.", type: "number", initialValue: "0.01" },
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
  this._setSpringSettingsFromDurationId(springId, duration, precision, bounceProfile);
}