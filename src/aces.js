import { action, condition, expression } from "../template/aceDefine.js";

// ============================================================
// ACTIONS
// ============================================================
const catActions = "Spring";

action(
  catActions,
  "SpringTo",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Spring to",
    displayText: "Spring to {0} (mode: {1})",
    description: "Spring to a target value from the current value. Inherits velocity if already animating. Use Angle mode to take the shortest rotational path.",
    params: [
      {
        id: "to",
        name: "To",
        desc: "Target value.",
        type: "number",
        initialValue: "100",
      },
      {
        id: "mode",
        name: "Mode",
        desc: "Value: spring a plain number. Angle: take the shortest rotational path (handles 360° wrapping).",
        type: "combo",
        initialValue: "value",
        items: [
          { value: "Value" },
          { angle: "Angle" },
        ],
      },
    ],
  },
  function (to, mode) {
    this._springTo(to, mode);
  }
);

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
    deprecated: true,
    isAsync: false,
    listName: "Spring from/to angle (deprecated)",
    displayText: "Spring angle from {0} to {1}",
    description: "Deprecated: use 'Spring to' with Angle mode instead. Spring angle value from start to target, taking the shortest path.",
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
    this._setAlwaysSpring(enabled === 0, target, mode);
  }
);

action(
  catActions,
  "SetAlwaysSpringTarget",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Set always spring target",
    displayText: "Set always spring target to {0}",
    description: "Update the target for always spring mode without changing other settings. Only has an effect when always spring is enabled.",
    params: [
      {
        id: "target",
        name: "Target",
        desc: "The new target value to spring towards.",
        type: "number",
        initialValue: "0",
      },
    ],
  },
  function (target) {
    this._setAlwaysSpringTarget(target);
  }
);

action(
  catActions,
  "SetEnabled",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Set enabled",
    displayText: "Set enabled: {0}",
    description: "Enable or disable the spring behavior.",
    params: [
      {
        id: "state",
        name: "State",
        desc: "Enable or disable the behavior.",
        type: "boolean",
        initialValue: "true",
      },
    ],
  },
  function (state) {
    this._setEnabled(state);
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
  "SetPrecision",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Set precision",
    displayText: "Set precision to {0}",
    description: "Set spring precision threshold (0.0001-1). Lower values require the value to be closer to the target before the animation is considered complete.",
    params: [
      {
        id: "value",
        name: "Precision",
        desc: "Precision threshold (0.0001-1).",
        type: "number",
        initialValue: "0.01",
      },
    ],
  },
  function (value) {
    this._setPrecision(value);
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
  "Reset",
  {
    highlight: false,
    deprecated: false,
    isAsync: false,
    listName: "Reset to value",
    displayText: "Reset spring to {0}",
    description: "Instantly reset the spring value and clear velocity. Stops any active animation. Use this to initialize the spring before the first Spring To call.",
    params: [
      {
        id: "value",
        name: "Value",
        desc: "Value to reset to.",
        type: "number",
        initialValue: "0",
      },
    ],
  },
  function (value) {
    this._resetToValue(value);
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
  "IsEnabled",
  {
    highlight: false,
    deprecated: false,
    isInvertible: true,
    listName: "Is enabled",
    displayText: "Is enabled",
    description: "True if the spring behavior is enabled.",
    params: [],
  },
  function () {
    return this._isSpringEnabled();
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

condition(
  catConditions,
  "IsAlwaysSpringEnabled",
  {
    highlight: false,
    deprecated: false,
    isInvertible: true,
    listName: "Is always spring enabled",
    displayText: "Is always spring enabled",
    description: "True if always spring mode is currently enabled.",
    params: [],
  },
  function () {
    return this._isAlwaysSpringEnabled();
  }
);

// ============================================================
// TRIGGERS
// ============================================================
const catTriggers = "Spring";

condition(
  catTriggers,
  "OnStarted",
  {
    highlight: false,
    deprecated: false,
    isTrigger: true,
    listName: "On started",
    displayText: "On started",
    description: "Triggered when the spring begins a new animation.",
    params: [],
  },
  function () {
    return true;
  }
);

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

condition(
  catTriggers,
  "OnStopped",
  {
    highlight: false,
    deprecated: false,
    isTrigger: true,
    listName: "On stopped",
    displayText: "On stopped",
    description: "Triggered when the spring is manually stopped via Stop or Snap to target.",
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
  "Progress",
  {
    highlight: false,
    deprecated: false,
    returnType: "number",
    description: "Get the animation progress from 0 (at start) to 1 (at target).",
    params: [],
  },
  function () {
    return this._getProgress();
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

expression(
  catExpressions,
  "Precision",
  {
    highlight: false,
    deprecated: false,
    returnType: "number",
    description: "Get the current precision threshold.",
    params: [],
  },
  function () {
    return this._getPrecision();
  }
);

expression(
  catExpressions,
  "AlwaysSpringTarget",
  {
    highlight: false,
    deprecated: false,
    returnType: "number",
    description: "Get the current always spring target value.",
    params: [],
  },
  function () {
    return this._getAlwaysSpringTarget();
  }
);
