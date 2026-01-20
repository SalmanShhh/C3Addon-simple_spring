import { action, condition, expression } from "../template/aceDefine.js";

// ============================================================
// ACTIONS
// ============================================================
const catActions = "Spring";

action(
  catActions,
  "SpringFromTo",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Spring from/to",
    displayText: "Spring from {0} to {1}",
    description: "Spring numeric value from start to target. Inherits velocity if already animating.",
    params: [
      {
        id: "from",
        name: "From",
        desc: "Starting value.",
        type: "number",
        initialValue: "0",
      },
      {
        id: "to",
        name: "To",
        desc: "Target value.",
        type: "number",
        initialValue: "100",
      },
    ],
  },
  function (from, to) {
    this._springFromTo(from, to);
  }
);

action(
  catActions,
  "SpringFromToAngle",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Spring from/to angle",
    displayText: "Spring angle from {0} to {1}",
    description: "Spring angle value from start to target. Handles angle wrapping to take shortest path.",
    params: [
      {
        id: "from",
        name: "From",
        desc: "Starting angle in degrees.",
        type: "number",
        initialValue: "0",
      },
      {
        id: "to",
        name: "To",
        desc: "Target angle in degrees.",
        type: "number",
        initialValue: "90",
      },
    ],
  },
  function (from, to) {
    this._springFromToAngle(from, to);
  }
);

action(
  catActions,
  "SetStiffness",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Set stiffness",
    displayText: "Set stiffness to {0}",
    description: "Set spring stiffness (0-1). Higher = faster response.",
    params: [
      {
        id: "value",
        name: "Stiffness",
        desc: "Stiffness value (0-1).",
        type: "number",
        initialValue: "0.15",
      },
    ],
  },
  function (value) {
    this._setStiffness(value);
  }
);

action(
  catActions,
  "SetDamping",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Set damping",
    displayText: "Set damping to {0}",
    description: "Set spring damping (0-1). Higher = less oscillation.",
    params: [
      {
        id: "value",
        name: "Damping",
        desc: "Damping value (0-1).",
        type: "number",
        initialValue: "0.8",
      },
    ],
  },
  function (value) {
    this._setDamping(value);
  }
);

action(
  catActions,
  "Stop",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Stop at current value",
    displayText: "Stop spring at current value",
    description: "Stop the spring animation and keep the current value.",
    params: [],
  },
  function () {
    this._stopAtCurrentValue();
  }
);

action(
  catActions,
  "SnapToTarget",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Snap to target",
    displayText: "Snap to target",
    description: "Instantly jump to the target value.",
    params: [],
  },
  function () {
    this._snapToTarget();
  }
);

action(
  catActions,
  "SetVelocity",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Set velocity",
    displayText: "Set velocity to {0}",
    description: "Set the spring's current velocity.",
    params: [
      {
        id: "value",
        name: "Velocity",
        desc: "Velocity value.",
        type: "number",
        initialValue: "0",
      },
    ],
  },
  function (value) {
    this._setVelocity(value);
  }
);

action(
  catActions,
  "AddToVelocity",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Add to velocity",
    displayText: "Add {0} to velocity",
    description: "Add a value to the spring's current velocity.",
    params: [
      {
        id: "value",
        name: "Value",
        desc: "Value to add to velocity.",
        type: "number",
        initialValue: "0",
      },
    ],
  },
  function (value) {
    this._addToVelocity(value);
  }
);

action(
  catActions,
  "SetAlwaysSpring",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Set always spring to target",
    displayText: "Set always spring to target: {0} to {1} (mode: {2})",
    description: "When enabled, the spring will continuously spring towards the target value even after reaching it. Useful for following a changing target.",
    params: [
      {
        id: "enabled",
        name: "Enabled",
        desc: "Enable or disable always spring mode.",
        type: "combo",
        initialValue: "enabled",
        items: [
          { enabled: "Enabled" },
          { disabled: "Disabled" },
        ],
      },
      {
        id: "target",
        name: "Target",
        desc: "The target value to spring towards.",
        type: "number",
        initialValue: "0",
      },
      {
        id: "mode",
        name: "Mode",
        desc: "Whether to spring as a value or angle.",
        type: "combo",
        initialValue: "value",
        items: [
          { value: "Value" },
          { angle: "Angle" },
        ],
      },
    ],
  },
  function (enabled, target, mode) {
    this._setAlwaysSpring(enabled === "enabled", target, mode === "angle" ? 1 : 0);
  }
);

// ============================================================
// CONDITIONS
// ============================================================
const catConditions = "Spring";

condition(
  catConditions,
  "IsAnimating",
  {
    highlight: false,
    deprecated: false,
    isInvertible: true,
    listName: "Is animating",
    displayText: "Is animating",
    description: "True if the spring is currently animating.",
    params: [],
  },
  function () {
    return this._isSpringAnimating();
  }
);

condition(
  catConditions,
  "HasReachedTarget",
  {
    highlight: false,
    deprecated: false,
    isInvertible: true,
    listName: "Has reached target",
    displayText: "Has reached target",
    description: "True if the spring has reached its target.",
    params: [],
  },
  function () {
    return this._hasReachedTarget();
  }
);

// ============================================================
// TRIGGER
// ============================================================
const catTriggers = "Spring";

condition(
  catTriggers,
  "OnReachedTarget",
  {
    highlight: false,
    deprecated: false,
    isTrigger: true,
    listName: "On reached target",
    displayText: "On reached target",
    description: "Triggered when the spring reaches its target.",
    params: [],
  },
  function () {
    return true;
  }
);

// ============================================================
// EXPRESSIONS
// ============================================================
const catExpressions = "Spring";

expression(
  catExpressions,
  "Value",
  {
    highlight: false,
    deprecated: false,
    returnType: "number",
    description: "Get the current spring value.",
    params: [],
  },
  function () {
    return this._getValue();
  }
);

expression(
  catExpressions,
  "From",
  {
    highlight: false,
    deprecated: false,
    returnType: "number",
    description: "Get the from (start) value.",
    params: [],
  },
  function () {
    return this._getFromValue();
  }
);

expression(
  catExpressions,
  "To",
  {
    highlight: false,
    deprecated: false,
    returnType: "number",
    description: "Get the to (target) value.",
    params: [],
  },
  function () {
    return this._getToValue();
  }
);

expression(
  catExpressions,
  "Velocity",
  {
    highlight: false,
    deprecated: false,
    returnType: "number",
    description: "Get the current velocity.",
    params: [],
  },
  function () {
    return this._getVelocity();
  }
);

expression(
  catExpressions,
  "Stiffness",
  {
    highlight: false,
    deprecated: false,
    returnType: "number",
    description: "Get the current stiffness.",
    params: [],
  },
  function () {
    return this._getStiffness();
  }
);

expression(
  catExpressions,
  "Damping",
  {
    highlight: false,
    deprecated: false,
    returnType: "number",
    description: "Get the current damping.",
    params: [],
  },
  function () {
    return this._getDamping();
  }
);
