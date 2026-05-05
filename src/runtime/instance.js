import { id, addonType, name } from "../../config.caw.js";
import AddonTypeMap from "../../template/addonTypeMap.js";

export default function (parentClass) {
  return class extends parentClass {
    constructor() {
      super();
      const props = this._getInitProperties() || [];

      this._defaultSpringId = "default";
      this._lastTriggeredSpringId = this._defaultSpringId;
      this._lastCompletedSpringId = this._defaultSpringId;
      this._lastStartedSpringId = this._defaultSpringId;
      this._springs = new Map();
      this._autoApplyColourSpringIds = new Set();
      this._autoApplyTransformPositionSpringIds = new Set();
      this._autoApplyTransformSizeSpringIds = new Set();
      this._autoApplyTransformAngleSpringIds = new Set();

      // Settings
      this._stiffness = Number(props[0]) || 0.15;
      this._damping = Number(props[1]) || 0.8;
      this._precision = Number(props[2]) || 0.01;
      this._isEnabled = props[3] !== undefined ? !!props[3] : true;
      this._createSpring(this._defaultSpringId);

      // Mesh spring state
      this._meshUnsupportedReported = false;
      this._meshApi = null;
      this._meshEnabled = false;
      this._meshAnimating = false;
      this._meshCols = 0;
      this._meshRows = 0;
      this._meshPoints = [];
      this._meshStiffness = this._stiffness;
      this._meshDamping = this._damping;
      this._meshPrecision = this._precision;
      this._meshEnergy = 0;

      // Auto-grid resolution (used when Auto Grid = Yes in effect actions)
      this._meshAutoGridCols = 5;
      this._meshAutoGridRows = 5;

      // Mesh sway state
      this._meshSwayEnabled = false;
      this._meshSwayAngle = 0;
      this._meshSwayStrength = 0.08;
      this._meshSwayWavelength = 0.5;
      this._meshSwaySpeed = 1;
      this._meshSwayPhase = 0;

      this._setTicking(true);
    }

    _tick() {
      if (!this._isEnabled) return;

      const dt = Math.min(this.instance.runtime.dt, 0.067); // Cap at ~15fps

      for (const spring of this._springs.values()) {
        this._tickSpring(spring, dt);
      }

      const activeColourSpringId = this._getSingleActiveSpringId(this._autoApplyColourSpringIds);
      if (activeColourSpringId) {
        this._applySprungColourToObject(activeColourSpringId);
      }

      const activePositionSpringId = this._getSingleActiveSpringId(this._autoApplyTransformPositionSpringIds);
      if (activePositionSpringId) {
        this._applySprungPositionToObject(activePositionSpringId);
      }

      const activeSizeSpringId = this._getSingleActiveSpringId(this._autoApplyTransformSizeSpringIds);
      if (activeSizeSpringId) {
        this._applySprungSizeToObject(activeSizeSpringId);
      }

      const activeAngleSpringId = this._getSingleActiveSpringId(this._autoApplyTransformAngleSpringIds);
      if (activeAngleSpringId) {
        this._applySprungAngleToObject(activeAngleSpringId);
      }

      if (this._meshEnabled && (this._meshAnimating || this._meshSwayEnabled)) {
        this._tickMesh(dt);
      }
    }

    _createSpring(id) {
      const springId = this._normalizeSpringId(id);
      const spring = {
        id: springId,
        from: 0,
        to: 0,
        value: 0,
        velocity: 0,
        isAnimating: false,
        smoothValue: 0,
        time: 0,
        steps: 0,
        prevValue: 0,
        alwaysSpringEnabled: false,
        alwaysSpringMode: 0,
        stiffness: this._stiffness,
        damping: this._damping,
        precision: this._precision,
      };

      this._springs.set(springId, spring);
      return spring;
    }

    _normalizeSpringId(id) {
      const value = String(id ?? "").trim();
      return value || this._defaultSpringId;
    }

    _getSpring(id, createIfMissing = true) {
      const springId = this._normalizeSpringId(id);
      let spring = this._springs.get(springId);
      if (!spring && createIfMissing) {
        spring = this._createSpring(springId);
      }
      return spring || null;
    }

    _removeSpring(id) {
      const springId = this._normalizeSpringId(id);
      if (springId === this._defaultSpringId) {
        const spring = this._getSpring(springId, true);
        this._resetSpringState(spring, 0);
        spring.from = 0;
        spring.to = 0;
        spring.alwaysSpringEnabled = false;
        spring.alwaysSpringMode = 0;
        spring.stiffness = this._stiffness;
        spring.damping = this._damping;
        spring.precision = this._precision;
        return false;
      }
      return this._springs.delete(springId);
    }

    _resetSpringState(spring, startValue) {
      spring.value = startValue;
      spring.prevValue = startValue;
      spring.smoothValue = startValue;
      spring.velocity = 0;
      spring.time = 0;
      spring.steps = 0;
      spring.isAnimating = false;
    }

    _finishSpring(spring) {
      spring.value = spring.to;
      spring.smoothValue = spring.to;
      spring.velocity = 0;
      spring.isAnimating = false;
      spring.time = 0;
      spring.steps = 0;
    }

    _stepSpringPhysics(spring) {
      let targetValue = spring.to;

      if (spring.alwaysSpringEnabled && spring.alwaysSpringMode === 1) {
        let diff = spring.to - spring.value;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        targetValue = spring.value + diff;
      }

      const displacement = targetValue - spring.value;
      spring.velocity += displacement * spring.stiffness;
      spring.velocity *= spring.damping;
      spring.value += spring.velocity;
    }

    _tickSpring(spring, dt) {
      if (spring.alwaysSpringEnabled && !spring.isAnimating) {
        const dist = Math.abs(spring.to - spring.value);
        const speed = Math.abs(spring.velocity);
        if (dist >= spring.precision || speed >= spring.precision) {
          spring.isAnimating = true;
        }
      }

      if (!spring.isAnimating) {
        return;
      }

      spring.time += dt;

      const targetSteps = Math.floor(spring.time * 60);
      while (spring.steps < targetSteps) {
        spring.prevValue = spring.value;
        this._stepSpringPhysics(spring);
        spring.steps++;
      }

      const t = (spring.time * 60) - spring.steps;
      spring.smoothValue = spring.prevValue + (spring.value - spring.prevValue) * t;

      const dist = Math.abs(spring.to - spring.value);
      const speed = Math.abs(spring.velocity);

      if (dist < spring.precision && speed < spring.precision) {
        this._finishSpring(spring);
        this._lastCompletedSpringId = spring.id;
        this._triggerSpringEvent("OnReachedTarget", "OnSpringReachedTarget", spring.id);
      }

      if (!isFinite(spring.value)) {
        this._finishSpring(spring);
      }
    }

    _trigger(method) {
      this.dispatch(method);
      super._trigger(self.C3[AddonTypeMap[addonType]][id].Cnds[method]);
    }

    _triggerSpringEvent(legacyMethod, multiMethod, springId) {
      this._lastTriggeredSpringId = springId;
      this._trigger(legacyMethod);
      this._trigger(multiMethod);
    }

    on(tag, callback, options) {
      if (!this.events[tag]) {
        this.events[tag] = [];
      }
      this.events[tag].push({ callback, options });
    }

    off(tag, callback) {
      if (this.events[tag]) {
        this.events[tag] = this.events[tag].filter(
          (event) => event.callback !== callback
        );
      }
    }

    dispatch(tag) {
      if (this.events[tag]) {
        this.events[tag].forEach((event) => {
          if (event.options && event.options.params) {
            const fn = self.C3[AddonTypeMap[addonType]][id].Cnds[tag];
            if (fn && !fn.call(this, ...event.options.params)) {
              return;
            }
          }
          event.callback();
          if (event.options && event.options.once) {
            this.off(tag, event.callback);
          }
        });
      }
    }

    _release() {
      super._release();
    }


    // --- ACE Methods ---

    _springFromToId(id, from, to) {
      const spring = this._getSpring(id, true);
      from = Number(from);
      to = Number(to);

      const wasAnimating = spring.isAnimating;

      if (!spring.isAnimating) {
        this._resetSpringState(spring, from);
      }

      spring.from = from;
      spring.to = to;
      spring.isAnimating = true;

      if (!wasAnimating) {
        this._lastStartedSpringId = spring.id;
        this._triggerSpringEvent("OnStarted", "OnSpringStarted", spring.id);
      }
    }

    _springFromTo(from, to) {
      this._springFromToId(this._defaultSpringId, from, to);
    }

    _springToId(id, to, mode) {
      const spring = this._getSpring(id, true);
      to = Number(to);
      mode = Number(mode) || 0;

      let targetTo = to;

      if (mode === 1) {
        let normalizedTo = to % 360;
        if (normalizedTo < 0) normalizedTo += 360;

        let normalizedCurrent = spring.smoothValue % 360;
        if (normalizedCurrent < 0) normalizedCurrent += 360;

        let diff = normalizedTo - normalizedCurrent;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;

        targetTo = spring.smoothValue + diff;
      }

      const wasAnimating = spring.isAnimating;

      if (!spring.isAnimating) {
        this._resetSpringState(spring, spring.smoothValue);
      }

      spring.from = spring.smoothValue;
      spring.to = targetTo;
      spring.isAnimating = true;

      if (!wasAnimating) {
        this._lastStartedSpringId = spring.id;
        this._triggerSpringEvent("OnStarted", "OnSpringStarted", spring.id);
      }
    }

    _springTo(to, mode) {
      this._springToId(this._defaultSpringId, to, mode);
    }

    _springFromToAngleId(id, from, to) {
      const spring = this._getSpring(id, true);
      from = Number(from) % 360;
      to = Number(to) % 360;

      if (from < 0) from += 360;
      if (to < 0) to += 360;

      let diff = to - from;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      const wasAnimating = spring.isAnimating;

      if (!spring.isAnimating) {
        this._resetSpringState(spring, from);
      }

      spring.from = spring.value;
      spring.to = spring.value + diff;
      spring.isAnimating = true;

      if (!wasAnimating) {
        this._lastStartedSpringId = spring.id;
        this._triggerSpringEvent("OnStarted", "OnSpringStarted", spring.id);
      }
    }

    _springFromToAngle(from, to) {
      this._springFromToAngleId(this._defaultSpringId, from, to);
    }

    _setStiffness(v, id = null) {
      const value = Math.max(0.001, Number(v));
      if (id === null || id === undefined) {
        this._stiffness = value;
        return;
      }

      this._getSpring(id, true).stiffness = value;
    }

    _setDamping(v, id = null) {
      const value = Math.max(0, Math.min(1, Number(v)));
      if (id === null || id === undefined) {
        this._damping = value;
        return;
      }

      this._getSpring(id, true).damping = value;
    }

    _setPrecision(v, id = null) {
      const value = Math.max(0.0001, Math.min(1, Number(v)));
      if (id === null || id === undefined) {
        this._precision = value;
        return;
      }

      this._getSpring(id, true).precision = value;
    }

    _setEnabled(v) {
      this._isEnabled = !!v;
    }

    _stopAtCurrentValueId(id) {
      const spring = this._getSpring(id, false);
      if (!spring) return;

      spring.to = spring.value;
      spring.smoothValue = spring.value;
      spring.velocity = 0;
      spring.isAnimating = false;
      spring.time = 0;
      spring.steps = 0;
      this._triggerSpringEvent("OnStopped", "OnSpringStopped", spring.id);
    }

    _stopAtCurrentValue() {
      this._stopAtCurrentValueId(this._defaultSpringId);
    }

    _snapToTargetId(id) {
      const spring = this._getSpring(id, false);
      if (!spring) return;

      this._finishSpring(spring);
      this._triggerSpringEvent("OnStopped", "OnSpringStopped", spring.id);
    }

    _snapToTarget() {
      this._snapToTargetId(this._defaultSpringId);
    }

    _resetToValueId(id, v) {
      const spring = this._getSpring(id, true);
      v = Number(v);
      spring.from = v;
      spring.to = v;
      this._resetSpringState(spring, v);
    }

    _resetToValue(v) {
      this._resetToValueId(this._defaultSpringId, v);
    }

    _setVelocityId(id, v) {
      const spring = this._getSpring(id, true);
      spring.velocity = Number(v);
      spring.isAnimating = true;
    }

    _setVelocity(v) {
      this._setVelocityId(this._defaultSpringId, v);
    }

    _addToVelocityId(id, v) {
      const spring = this._getSpring(id, true);
      spring.velocity += Number(v);
      spring.isAnimating = true;
    }

    _addToVelocity(v) {
      this._addToVelocityId(this._defaultSpringId, v);
    }

    _setAlwaysSpringId(id, enabled, target, mode) {
      const spring = this._getSpring(id, true);
      spring.alwaysSpringEnabled = !!enabled;
      spring.to = Number(target);
      spring.alwaysSpringMode = Number(mode);

      if (enabled && !spring.isAnimating) {
        spring.value = spring.to;
        spring.smoothValue = spring.to;
        spring.prevValue = spring.to;
        spring.time = 0;
        spring.steps = 0;
      }
    }

    _setAlwaysSpring(enabled, target, mode) {
      this._setAlwaysSpringId(this._defaultSpringId, enabled, target, mode);
    }

    _setAlwaysSpringTargetId(id, target) {
      const spring = this._getSpring(id, true);
      spring.to = Number(target);
      if (spring.alwaysSpringEnabled) {
        spring.isAnimating = true;
      }
    }

    _setAlwaysSpringTarget(target) {
      this._setAlwaysSpringTargetId(this._defaultSpringId, target);
    }

    _isAlwaysSpringEnabledId(id) {
      return !!this._getSpring(id, false)?.alwaysSpringEnabled;
    }

    _isAlwaysSpringEnabled() {
      return this._isAlwaysSpringEnabledId(this._defaultSpringId);
    }

    _getAlwaysSpringTargetId(id) {
      return this._getSpring(id, false)?.to ?? 0;
    }

    _getAlwaysSpringTarget() {
      return this._getAlwaysSpringTargetId(this._defaultSpringId);
    }

    _colourSpringChannelId(id, channel) {
      const springId = this._normalizeSpringId(id);
      return `__colour__:${springId}:${channel}`;
    }

    _parseColourSpace(space) {
      if (typeof space === "string") {
        const value = space.trim().toLowerCase();
        if (value === "0" || value === "rgb") return "rgb";
        if (value === "1" || value === "hsl") return "hsl";
        if (value === "2" || value === "hsv") return "hsv";
      }

      const n = Math.floor(Number(space));
      if (n === 1) return "hsl";
      if (n === 2) return "hsv";
      return "rgb";
    }

    _clamp(value, min, max) {
      return Math.max(min, Math.min(max, Number(value) || 0));
    }

    _hslToRgb255(h, s, l) {
      const hue = ((Number(h) % 360) + 360) % 360;
      const sat = this._clamp(s, 0, 100) / 100;
      const lit = this._clamp(l, 0, 100) / 100;

      const c = (1 - Math.abs((2 * lit) - 1)) * sat;
      const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
      const m = lit - (c / 2);

      let r1 = 0;
      let g1 = 0;
      let b1 = 0;

      if (hue < 60) {
        r1 = c;
        g1 = x;
      } else if (hue < 120) {
        r1 = x;
        g1 = c;
      } else if (hue < 180) {
        g1 = c;
        b1 = x;
      } else if (hue < 240) {
        g1 = x;
        b1 = c;
      } else if (hue < 300) {
        r1 = x;
        b1 = c;
      } else {
        r1 = c;
        b1 = x;
      }

      return [
        (r1 + m) * 255,
        (g1 + m) * 255,
        (b1 + m) * 255,
      ];
    }

    _hsvToRgb255(h, s, v) {
      const hue = ((Number(h) % 360) + 360) % 360;
      const sat = this._clamp(s, 0, 100) / 100;
      const val = this._clamp(v, 0, 100) / 100;

      const c = val * sat;
      const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
      const m = val - c;

      let r1 = 0;
      let g1 = 0;
      let b1 = 0;

      if (hue < 60) {
        r1 = c;
        g1 = x;
      } else if (hue < 120) {
        r1 = x;
        g1 = c;
      } else if (hue < 180) {
        g1 = c;
        b1 = x;
      } else if (hue < 240) {
        g1 = x;
        b1 = c;
      } else if (hue < 300) {
        r1 = x;
        b1 = c;
      } else {
        r1 = c;
        b1 = x;
      }

      return [
        (r1 + m) * 255,
        (g1 + m) * 255,
        (b1 + m) * 255,
      ];
    }

    _colourToRgb255(space, c1, c2, c3) {
      const parsedSpace = this._parseColourSpace(space);

      if (parsedSpace === "hsl") {
        return this._hslToRgb255(c1, c2, c3);
      }

      if (parsedSpace === "hsv") {
        return this._hsvToRgb255(c1, c2, c3);
      }

      return [
        this._clamp(c1, 0, 255),
        this._clamp(c2, 0, 255),
        this._clamp(c3, 0, 255),
      ];
    }

    _setColourSpringAutoApplyId(id, enabled) {
      const springId = this._normalizeSpringId(id);
      if (enabled) {
        // Only one colour spring should drive the instance at a time.
        this._autoApplyColourSpringIds.clear();
        this._autoApplyColourSpringIds.add(springId);
      } else {
        this._autoApplyColourSpringIds.delete(springId);
      }
    }

    _getSingleActiveSpringId(idSet) {
      if (!idSet || !idSet.size) return "";
      // Use the latest inserted id so new applied springs override old ones.
      const ids = Array.from(idSet);
      return ids[ids.length - 1] || "";
    }

    _normalizeSingleActiveSet(idSet) {
      if (!idSet || idSet.size <= 1) return;
      const activeId = this._getSingleActiveSpringId(idSet);
      idSet.clear();
      if (activeId) {
        idSet.add(activeId);
      }
    }

    _springColourToId(id, colourSpace, c1, c2, c3, applyToObject = false) {
      const [r, g, b] = this._colourToRgb255(colourSpace, c1, c2, c3);
      this._springToId(this._colourSpringChannelId(id, "r"), r, 0);
      this._springToId(this._colourSpringChannelId(id, "g"), g, 0);
      this._springToId(this._colourSpringChannelId(id, "b"), b, 0);

      this._setColourSpringAutoApplyId(id, !!applyToObject);
      if (applyToObject) {
        this._applySprungColourToObject(id);
      }
    }

    _springColourFromToId(id, colourSpace, from1, from2, from3, to1, to2, to3, applyToObject = false) {
      const [fromR, fromG, fromB] = this._colourToRgb255(colourSpace, from1, from2, from3);
      const [toR, toG, toB] = this._colourToRgb255(colourSpace, to1, to2, to3);

      this._springFromToId(this._colourSpringChannelId(id, "r"), fromR, toR);
      this._springFromToId(this._colourSpringChannelId(id, "g"), fromG, toG);
      this._springFromToId(this._colourSpringChannelId(id, "b"), fromB, toB);

      this._setColourSpringAutoApplyId(id, !!applyToObject);
      if (applyToObject) {
        this._applySprungColourToObject(id);
      }
    }

    _setColourSpringSettingsId(id, stiffness, damping, precision) {
      this._setStiffness(stiffness, this._colourSpringChannelId(id, "r"));
      this._setStiffness(stiffness, this._colourSpringChannelId(id, "g"));
      this._setStiffness(stiffness, this._colourSpringChannelId(id, "b"));

      this._setDamping(damping, this._colourSpringChannelId(id, "r"));
      this._setDamping(damping, this._colourSpringChannelId(id, "g"));
      this._setDamping(damping, this._colourSpringChannelId(id, "b"));

      this._setPrecision(precision, this._colourSpringChannelId(id, "r"));
      this._setPrecision(precision, this._colourSpringChannelId(id, "g"));
      this._setPrecision(precision, this._colourSpringChannelId(id, "b"));
    }

    _resetColourSpringId(id, colourSpace, c1, c2, c3, applyToObject = false) {
      const [r, g, b] = this._colourToRgb255(colourSpace, c1, c2, c3);
      this._resetToValueId(this._colourSpringChannelId(id, "r"), r);
      this._resetToValueId(this._colourSpringChannelId(id, "g"), g);
      this._resetToValueId(this._colourSpringChannelId(id, "b"), b);

      this._setColourSpringAutoApplyId(id, !!applyToObject);
      if (applyToObject) {
        this._applySprungColourToObject(id);
      }
    }

    _stopColourSpringId(id) {
      this._stopAtCurrentValueId(this._colourSpringChannelId(id, "r"));
      this._stopAtCurrentValueId(this._colourSpringChannelId(id, "g"));
      this._stopAtCurrentValueId(this._colourSpringChannelId(id, "b"));
      this._setColourSpringAutoApplyId(id, false);
    }

    _getColourChannelValue(id, channel) {
      const spring = this._getSpring(this._colourSpringChannelId(id, channel), false);
      if (!spring) return 0;
      return this._clamp(spring.smoothValue, 0, 255);
    }

    _getColourRed(id) {
      return this._getColourChannelValue(id, "r");
    }

    _getColourGreen(id) {
      return this._getColourChannelValue(id, "g");
    }

    _getColourBlue(id) {
      return this._getColourChannelValue(id, "b");
    }

    _getColourHex(id) {
      const r = Math.round(this._getColourRed(id)).toString(16).padStart(2, "0");
      const g = Math.round(this._getColourGreen(id)).toString(16).padStart(2, "0");
      const b = Math.round(this._getColourBlue(id)).toString(16).padStart(2, "0");
      return `#${r}${g}${b}`;
    }

    _isColourSpringAnimatingId(id) {
      return this._isSpringAnimatingId(this._colourSpringChannelId(id, "r"))
        || this._isSpringAnimatingId(this._colourSpringChannelId(id, "g"))
        || this._isSpringAnimatingId(this._colourSpringChannelId(id, "b"));
    }

    _hasColourSpringReachedTargetId(id) {
      return this._hasSpringReachedTarget(this._colourSpringChannelId(id, "r"))
        && this._hasSpringReachedTarget(this._colourSpringChannelId(id, "g"))
        && this._hasSpringReachedTarget(this._colourSpringChannelId(id, "b"));
    }

    _tryApplyColour(target, methodNames, payloads) {
      if (!target) return false;

      for (const methodName of methodNames) {
        const fn = target[methodName];
        if (typeof fn !== "function") continue;

        for (const args of payloads) {
          try {
            fn.call(target, ...args);
            return true;
          } catch (_) {
            // Keep trying alternate signatures.
          }
        }
      }

      return false;
    }

    _applySprungColourToObject(id) {
      const r255 = this._getColourRed(id);
      const g255 = this._getColourGreen(id);
      const b255 = this._getColourBlue(id);

      const r01 = this._clamp(r255 / 255, 0, 1);
      const g01 = this._clamp(g255 / 255, 0, 1);
      const b01 = this._clamp(b255 / 255, 0, 1);
      const hex = this._getColourHex(id);

      const methodNames = [
        "setColor",
        "SetColor",
        "setColour",
        "SetColour",
        "setColorRgb",
        "SetColorRgb",
        "setUnpremultipliedColor",
        "SetUnpremultipliedColor",
      ];

      const payloads = [
        [[r01, g01, b01]],
        [[r255, g255, b255]],
        [r01, g01, b01],
        [r255, g255, b255],
        [{ r: r01, g: g01, b: b01 }],
        [{ r: r255, g: g255, b: b255 }],
        [hex],
      ];

      const targets = [
        this.instance,
        this.instance && typeof this.instance.GetWorldInfo === "function" ? this.instance.GetWorldInfo() : null,
        this.instance ? this.instance.worldInfo : null,
        this.instance ? this.instance._worldInfo : null,
      ];

      for (const target of targets) {
        if (this._tryApplyColour(target, methodNames, payloads)) {
          return true;
        }
      }

      return false;
    }

    _normalizeTransformSpringType(type) {
      const value = String(type ?? "").trim().toLowerCase();
      if (value === "size" || value === "1") return "size";
      if (value === "angle" || value === "2") return "angle";
      return "position";
    }

    _getTransformAutoApplySet(type) {
      const normalized = this._normalizeTransformSpringType(type);
      if (normalized === "size") return this._autoApplyTransformSizeSpringIds;
      if (normalized === "angle") return this._autoApplyTransformAngleSpringIds;
      return this._autoApplyTransformPositionSpringIds;
    }

    _setTransformSpringAutoApplyId(type, id, enabled) {
      const springId = this._normalizeSpringId(id);
      const set = this._getTransformAutoApplySet(type);
      if (enabled) {
        // Only one spring per transform target should drive the instance.
        set.clear();
        set.add(springId);
      } else {
        set.delete(springId);
      }
    }

    _transformSpringChannelId(type, id, channel) {
      const normalizedType = this._normalizeTransformSpringType(type);
      const springId = this._normalizeSpringId(id);
      return `__transform__:${normalizedType}:${springId}:${channel}`;
    }

    _getTransformTargets() {
      return [
        this.instance,
        this.instance && typeof this.instance.GetWorldInfo === "function" ? this.instance.GetWorldInfo() : null,
        this.instance ? this.instance.worldInfo : null,
        this.instance ? this.instance._worldInfo : null,
      ];
    }

    _tryGetNumericFromTarget(target, methodNames, propertyNames) {
      if (!target) return null;

      for (const methodName of methodNames) {
        const fn = target[methodName];
        if (typeof fn !== "function") continue;
        try {
          const value = Number(fn.call(target));
          if (Number.isFinite(value)) return value;
        } catch (_) {
          // Keep trying fallbacks.
        }
      }

      for (const propertyName of propertyNames) {
        if (!Object.prototype.hasOwnProperty.call(target, propertyName) && target[propertyName] === undefined) {
          continue;
        }
        const value = Number(target[propertyName]);
        if (Number.isFinite(value)) return value;
      }

      return null;
    }

    _readTransformValue(methodNames, propertyNames, fallback = 0) {
      for (const target of this._getTransformTargets()) {
        const value = this._tryGetNumericFromTarget(target, methodNames, propertyNames);
        if (value !== null) return value;
      }
      return fallback;
    }

    _getObjectX() {
      return this._readTransformValue(["getX", "GetX"], ["x", "_x"], 0);
    }

    _getObjectY() {
      return this._readTransformValue(["getY", "GetY"], ["y", "_y"], 0);
    }

    _getObjectWidth() {
      return this._readTransformValue(["getWidth", "GetWidth"], ["width", "_width"], 1);
    }

    _getObjectHeight() {
      return this._readTransformValue(["getHeight", "GetHeight"], ["height", "_height"], 1);
    }

    _getObjectAngle() {
      return this._readTransformValue(["getAngle", "GetAngle"], ["angle", "_angle"], 0);
    }

    _setTransformProperty(property, value) {
      for (const target of this._getTransformTargets()) {
        if (!target) continue;
        if (!Object.prototype.hasOwnProperty.call(target, property) && target[property] === undefined) continue;
        try {
          target[property] = value;
          return true;
        } catch (_) {
          // Try the next target.
        }
      }
      return false;
    }

    _applyPosition(x, y) {
      const targets = this._getTransformTargets();
      const payloads = [[x, y], [[x, y]]];
      const methodNames = ["setPosition", "SetPosition", "setXY", "SetXY"];
      for (const target of targets) {
        if (this._tryApplyColour(target, methodNames, payloads)) {
          return true;
        }
      }

      let updated = false;
      for (const target of targets) {
        if (!target) continue;
        const setX = target.setX || target.SetX;
        const setY = target.setY || target.SetY;
        try {
          if (typeof setX === "function") {
            setX.call(target, x);
            updated = true;
          }
          if (typeof setY === "function") {
            setY.call(target, y);
            updated = true;
          }
          if (updated) return true;
        } catch (_) {
          // Continue with fallback targets.
        }
      }

      return this._setTransformProperty("x", x) || this._setTransformProperty("y", y);
    }

    _applySize(width, height) {
      const w = Math.max(0, Number(width) || 0);
      const h = Math.max(0, Number(height) || 0);

      const targets = this._getTransformTargets();
      const payloads = [[w, h], [[w, h]]];
      const methodNames = ["setSize", "SetSize"];
      for (const target of targets) {
        if (this._tryApplyColour(target, methodNames, payloads)) {
          return true;
        }
      }

      let updated = false;
      for (const target of targets) {
        if (!target) continue;
        const setWidth = target.setWidth || target.SetWidth;
        const setHeight = target.setHeight || target.SetHeight;
        try {
          if (typeof setWidth === "function") {
            setWidth.call(target, w);
            updated = true;
          }
          if (typeof setHeight === "function") {
            setHeight.call(target, h);
            updated = true;
          }
          if (updated) return true;
        } catch (_) {
          // Continue with fallback targets.
        }
      }

      return this._setTransformProperty("width", w) || this._setTransformProperty("height", h);
    }

    _applyAngle(angle) {
      const a = Number(angle) || 0;
      const targets = this._getTransformTargets();
      const payloads = [[a]];
      const methodNames = ["setAngle", "SetAngle"];

      for (const target of targets) {
        if (this._tryApplyColour(target, methodNames, payloads)) {
          return true;
        }
      }

      return this._setTransformProperty("angle", a);
    }

    _ensurePositionSpringsFromObject(id) {
      const xId = this._transformSpringChannelId("position", id, "x");
      const yId = this._transformSpringChannelId("position", id, "y");
      if (this._getSpring(xId, false) && this._getSpring(yId, false)) return;

      const x = this._getObjectX();
      const y = this._getObjectY();
      this._resetToValueId(xId, x);
      this._resetToValueId(yId, y);
    }

    _ensureSizeSpringsFromObject(id) {
      const wId = this._transformSpringChannelId("size", id, "w");
      const hId = this._transformSpringChannelId("size", id, "h");
      if (this._getSpring(wId, false) && this._getSpring(hId, false)) return;

      const width = this._getObjectWidth();
      const height = this._getObjectHeight();
      this._resetToValueId(wId, width);
      this._resetToValueId(hId, height);
    }

    _ensureAngleSpringFromObject(id) {
      const aId = this._transformSpringChannelId("angle", id, "a");
      if (this._getSpring(aId, false)) return;
      this._resetToValueId(aId, this._getObjectAngle());
    }

    _springPositionToId(id, x, y, useForInstance = true) {
      this._ensurePositionSpringsFromObject(id);
      this._springToId(this._transformSpringChannelId("position", id, "x"), Number(x), 0);
      this._springToId(this._transformSpringChannelId("position", id, "y"), Number(y), 0);
      this._setTransformSpringAutoApplyId("position", id, !!useForInstance);
      if (useForInstance) {
        this._applySprungPositionToObject(id);
      }
    }

    _springPositionFromToId(id, fromX, fromY, toX, toY, useForInstance = true) {
      this._springFromToId(this._transformSpringChannelId("position", id, "x"), Number(fromX), Number(toX));
      this._springFromToId(this._transformSpringChannelId("position", id, "y"), Number(fromY), Number(toY));
      this._setTransformSpringAutoApplyId("position", id, !!useForInstance);
      if (useForInstance) {
        this._applySprungPositionToObject(id);
      }
    }

    _springSizeToId(id, width, height, useForInstance = true) {
      this._ensureSizeSpringsFromObject(id);
      this._springToId(this._transformSpringChannelId("size", id, "w"), Number(width), 0);
      this._springToId(this._transformSpringChannelId("size", id, "h"), Number(height), 0);
      this._setTransformSpringAutoApplyId("size", id, !!useForInstance);
      if (useForInstance) {
        this._applySprungSizeToObject(id);
      }
    }

    _springSizeFromToId(id, fromW, fromH, toW, toH, useForInstance = true) {
      this._springFromToId(this._transformSpringChannelId("size", id, "w"), Number(fromW), Number(toW));
      this._springFromToId(this._transformSpringChannelId("size", id, "h"), Number(fromH), Number(toH));
      this._setTransformSpringAutoApplyId("size", id, !!useForInstance);
      if (useForInstance) {
        this._applySprungSizeToObject(id);
      }
    }

    _springAngleToId(id, angle, mode = 1, useForInstance = true) {
      this._ensureAngleSpringFromObject(id);
      this._springToId(this._transformSpringChannelId("angle", id, "a"), Number(angle), Number(mode));
      this._setTransformSpringAutoApplyId("angle", id, !!useForInstance);
      if (useForInstance) {
        this._applySprungAngleToObject(id);
      }
    }

    _springAngleFromToId(id, fromAngle, toAngle, useForInstance = true) {
      this._springFromToAngleId(this._transformSpringChannelId("angle", id, "a"), Number(fromAngle), Number(toAngle));
      this._setTransformSpringAutoApplyId("angle", id, !!useForInstance);
      if (useForInstance) {
        this._applySprungAngleToObject(id);
      }
    }

    _stopTransformSpringId(type, id) {
      const normalized = this._normalizeTransformSpringType(type);
      if (normalized === "position") {
        this._stopAtCurrentValueId(this._transformSpringChannelId("position", id, "x"));
        this._stopAtCurrentValueId(this._transformSpringChannelId("position", id, "y"));
      } else if (normalized === "size") {
        this._stopAtCurrentValueId(this._transformSpringChannelId("size", id, "w"));
        this._stopAtCurrentValueId(this._transformSpringChannelId("size", id, "h"));
      } else {
        this._stopAtCurrentValueId(this._transformSpringChannelId("angle", id, "a"));
      }

      this._setTransformSpringAutoApplyId(normalized, id, false);
    }

    _setTransformSpringSettingsId(type, id, stiffness, damping, precision) {
      const normalized = this._normalizeTransformSpringType(type);
      if (normalized === "position") {
        this._setStiffness(stiffness, this._transformSpringChannelId("position", id, "x"));
        this._setStiffness(stiffness, this._transformSpringChannelId("position", id, "y"));
        this._setDamping(damping, this._transformSpringChannelId("position", id, "x"));
        this._setDamping(damping, this._transformSpringChannelId("position", id, "y"));
        this._setPrecision(precision, this._transformSpringChannelId("position", id, "x"));
        this._setPrecision(precision, this._transformSpringChannelId("position", id, "y"));
        return;
      }

      if (normalized === "size") {
        this._setStiffness(stiffness, this._transformSpringChannelId("size", id, "w"));
        this._setStiffness(stiffness, this._transformSpringChannelId("size", id, "h"));
        this._setDamping(damping, this._transformSpringChannelId("size", id, "w"));
        this._setDamping(damping, this._transformSpringChannelId("size", id, "h"));
        this._setPrecision(precision, this._transformSpringChannelId("size", id, "w"));
        this._setPrecision(precision, this._transformSpringChannelId("size", id, "h"));
        return;
      }

      this._setStiffness(stiffness, this._transformSpringChannelId("angle", id, "a"));
      this._setDamping(damping, this._transformSpringChannelId("angle", id, "a"));
      this._setPrecision(precision, this._transformSpringChannelId("angle", id, "a"));
    }

    _getSprungPositionX(id) {
      return this._getSpringValue(this._transformSpringChannelId("position", id, "x"));
    }

    _getSprungPositionY(id) {
      return this._getSpringValue(this._transformSpringChannelId("position", id, "y"));
    }

    _getSprungWidth(id) {
      return this._getSpringValue(this._transformSpringChannelId("size", id, "w"));
    }

    _getSprungHeight(id) {
      return this._getSpringValue(this._transformSpringChannelId("size", id, "h"));
    }

    _getSprungAngle(id) {
      return this._getSpringValue(this._transformSpringChannelId("angle", id, "a"));
    }

    _applySprungPositionToObject(id) {
      return this._applyPosition(this._getSprungPositionX(id), this._getSprungPositionY(id));
    }

    _applySprungSizeToObject(id) {
      return this._applySize(this._getSprungWidth(id), this._getSprungHeight(id));
    }

    _applySprungAngleToObject(id) {
      return this._applyAngle(this._getSprungAngle(id));
    }

    _isTransformSpringAnimatingId(type, id) {
      const normalized = this._normalizeTransformSpringType(type);
      if (normalized === "position") {
        return this._isSpringAnimatingId(this._transformSpringChannelId("position", id, "x"))
          || this._isSpringAnimatingId(this._transformSpringChannelId("position", id, "y"));
      }
      if (normalized === "size") {
        return this._isSpringAnimatingId(this._transformSpringChannelId("size", id, "w"))
          || this._isSpringAnimatingId(this._transformSpringChannelId("size", id, "h"));
      }
      return this._isSpringAnimatingId(this._transformSpringChannelId("angle", id, "a"));
    }

    _hasTransformSpringReachedTargetId(type, id) {
      const normalized = this._normalizeTransformSpringType(type);
      if (normalized === "position") {
        return this._hasSpringReachedTarget(this._transformSpringChannelId("position", id, "x"))
          && this._hasSpringReachedTarget(this._transformSpringChannelId("position", id, "y"));
      }
      if (normalized === "size") {
        return this._hasSpringReachedTarget(this._transformSpringChannelId("size", id, "w"))
          && this._hasSpringReachedTarget(this._transformSpringChannelId("size", id, "h"));
      }
      return this._hasSpringReachedTarget(this._transformSpringChannelId("angle", id, "a"));
    }

    _hasMeshApi() {
      return !!this._resolveMeshApi();
    }

    _resolveMeshApi() {
      if (this._meshApi) {
        return this._meshApi;
      }

      const candidates = [
        this.instance,
        this.instance && typeof this.instance.GetWorldInfo === "function" ? this.instance.GetWorldInfo() : null,
        this.instance ? this.instance.worldInfo : null,
        this.instance ? this.instance._worldInfo : null,
      ];

      for (const target of candidates) {
        if (!target) continue;

        const create = target.createMesh || target.CreateMesh;
        const setPoint = target.setMeshPoint || target.SetMeshPoint;
        const destroy = target.destroyMesh || target.DestroyMesh;

        if (typeof setPoint === "function") {
          this._meshApi = {
            create: typeof create === "function" ? create.bind(target) : null,
            setPoint: setPoint.bind(target),
            destroy: typeof destroy === "function" ? destroy.bind(target) : null,
          };
          return this._meshApi;
        }
      }

      return null;
    }

    _meshCreate(cols, rows) {
      const instCreate = this.instance && (this.instance.createMesh || this.instance.CreateMesh);
      if (typeof instCreate === "function") {
        try {
          instCreate.call(this.instance, cols, rows);
          return true;
        } catch (_) {
          return false;
        }
      }

      const api = this._resolveMeshApi();
      if (!api || !api.create) return false;
      try {
        api.create(cols, rows);
        return true;
      } catch (_) {
        return false;
      }
    }

    _meshSetPoint(col, row, point) {
      const instSetPoint = this.instance && (this.instance.setMeshPoint || this.instance.SetMeshPoint);
      if (typeof instSetPoint === "function") {
        try {
          instSetPoint.call(this.instance, col, row, point);
          return true;
        } catch (_) {
          // Fall through to secondary surfaces.
        }
      }

      const api = this._resolveMeshApi();
      if (!api) return false;

      try {
        api.setPoint(col, row, point);
        return true;
      } catch (_) {
        // Fallback for alternative signatures used by some runtime surfaces.
      }

      try {
        api.setPoint(col, row, point.x, point.y, point.mode || "absolute");
        return true;
      } catch (_) {
        // Keep falling back.
      }

      try {
        api.setPoint(col, row, point.x, point.y);
        return true;
      } catch (_) {
        return false;
      }
    }

    _meshDestroy() {
      const instDestroy = this.instance && (this.instance.destroyMesh || this.instance.DestroyMesh);
      if (typeof instDestroy === "function") {
        instDestroy.call(this.instance);
        return true;
      }

      const api = this._resolveMeshApi();
      if (!api || !api.destroy) return false;
      api.destroy();
      return true;
    }

    _notifyMeshUnsupported() {
      if (!this._meshUnsupportedReported) {
        this._meshUnsupportedReported = true;
        this._trigger("OnMeshUnsupported");
      }
    }

    _ensureMeshSupport(notify = false) {
      // Re-evaluate each call so support can become available after instance/world-info init.
      const isSupported = this._hasMeshApi();

      if (isSupported) {
        this._meshUnsupportedReported = false;
        return true;
      }

      if (notify) this._notifyMeshUnsupported();
      return false;
    }

    _meshIndex(col, row) {
      return (row * this._meshCols) + col;
    }

    _forEachMeshPoint(callback) {
      for (let row = 0; row < this._meshRows; row++) {
        for (let col = 0; col < this._meshCols; col++) {
          const index = this._meshIndex(col, row);
          const px = this._meshCols <= 1 ? 0.5 : col / (this._meshCols - 1);
          const py = this._meshRows <= 1 ? 0.5 : row / (this._meshRows - 1);
          callback(this._meshPoints[index], col, row, index, px, py);
        }
      }
    }

    _setMeshAnimating(value) {
      const next = !!value;
      if (next && !this._meshAnimating) {
        this._meshAnimating = true;
        this._trigger("OnMeshStarted");
        return;
      }
      this._meshAnimating = next;
    }

    _meshFalloff(distance, radius, mode) {
      if (radius <= 0) return 0;
      const t = Math.max(0, Math.min(1, 1 - (distance / radius)));
      if (mode === 1) {
        return t * t * (3 - (2 * t)); // smoothstep
      }
      if (mode === 2) {
        return Math.pow(t, 2.5); // exponential-ish curve
      }
      return t; // linear
    }

    _parseAutoMesh(autoMesh) {
      if (typeof autoMesh === "string") {
        const v = autoMesh.trim().toLowerCase();
        if (v === "yes" || v === "on" || v === "true") return 0;
        if (v === "no" || v === "off" || v === "false") return 1;
      }
      const n = Number(autoMesh);
      return Number.isFinite(n) ? n : 0;
    }

    _parseFalloffMode(falloffMode) {
      if (typeof falloffMode === "string") {
        const v = falloffMode.trim().toLowerCase();
        if (v === "smooth") return 1;
        if (v === "exponential") return 2;
        return 0;
      }
      const n = Number(falloffMode);
      return Number.isFinite(n) ? Math.max(0, Math.min(2, Math.floor(n))) : 0;
    }

    _parsePresetIndex(preset) {
      if (typeof preset === "number") {
        return Math.max(0, Math.min(10, Math.floor(preset)));
      }

      if (typeof preset === "string") {
        const normalized = preset.trim().toLowerCase().replace(/[-\s]+/g, "_");

        // Numeric strings from some combo pipelines: "0", "1", ...
        const asNumber = Number(normalized);
        if (Number.isFinite(asNumber)) {
          return Math.max(0, Math.min(10, Math.floor(asNumber)));
        }

        const presetMap = {
          hit_impact: 0,
          heavy_slam: 1,
          sword_trail: 2,
          wind_gust: 3,
          electric_stun: 4,
          portal_spawn: 5,
          ui_pop: 6,
          explosion_burst: 7,
          jelly_bounce: 8,
          whip_lash: 9,
          teleport_glitch: 10,
        };

        if (presetMap[normalized] !== undefined) {
          return presetMap[normalized];
        }

        // Handle display-label style values that may come through from some runtimes.
        if (normalized === "hitimpact") return 0;
        if (normalized === "heavyslam") return 1;
        if (normalized === "swordtrail") return 2;
        if (normalized === "windgust") return 3;
        if (normalized === "electricstun") return 4;
        if (normalized === "portalspawn") return 5;
        if (normalized === "uipop") return 6;
        if (normalized === "explosionburst") return 7;
        if (normalized === "jellybounce") return 8;
        if (normalized === "whiplash") return 9;
        if (normalized === "teleportglitch") return 10;
      }

      return 0;
    }

    _applyMeshPoint(col, row, point, extraX = 0, extraY = 0) {
      const baseX = this._meshCols <= 1 ? 0.5 : col / (this._meshCols - 1);
      const baseY = this._meshRows <= 1 ? 0.5 : row / (this._meshRows - 1);
      // Use absolute coordinates (like the working 2D Water addon path) for reliable writes.
      const payload = {
        mode: "absolute",
        x: baseX + point.x + extraX,
        y: baseY + point.y + extraY,
        u: baseX,
        v: baseY,
      };

      this._meshSetPoint(col, row, payload);
    }

    _createMeshGrid(cols, rows) {
      if (!this._ensureMeshSupport(true)) return;

      cols = Math.max(2, Math.floor(Number(cols) || 0));
      rows = Math.max(2, Math.floor(Number(rows) || 0));

      if (!this._meshCreate(cols, rows)) return false;

      this._meshCols = cols;
      this._meshRows = rows;
      this._meshPoints = Array.from({ length: cols * rows }, () => ({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
      }));
      this._meshEnergy = 0;
      this._meshEnabled = true;
      this._setMeshAnimating(false);
      return true;
    }

    _adoptExistingMesh(preferredCols = 5, preferredRows = 5) {
      if (!this._ensureMeshSupport(true)) return false;

      // Probe common grid sizes by attempting valid absolute writes.
      // If a write to the bottom-right corner succeeds, we assume that size exists.
      const colsCandidates = [preferredCols, 6, 5, 4, 3, 2];
      const rowsCandidates = [preferredRows, 6, 5, 4, 3, 2];

      for (const cols of colsCandidates) {
        for (const rows of rowsCandidates) {
          if (cols < 2 || rows < 2) continue;

          const okTopLeft = this._meshSetPoint(0, 0, {
            mode: "absolute",
            x: 0,
            y: 0,
            u: 0,
            v: 0,
          });
          if (!okTopLeft) continue;

          const okBottomRight = this._meshSetPoint(cols - 1, rows - 1, {
            mode: "absolute",
            x: 1,
            y: 1,
            u: 1,
            v: 1,
          });
          if (!okBottomRight) continue;

          this._meshCols = cols;
          this._meshRows = rows;
          this._meshPoints = Array.from({ length: cols * rows }, () => ({
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
          }));
          this._meshEnergy = 0;
          this._meshEnabled = true;
          this._setMeshAnimating(false);
          return true;
        }
      }

      return false;
    }

    _setAutoGridResolution(cols, rows) {
      this._meshAutoGridCols = Math.max(2, Math.min(32, Math.floor(Number(cols) || 5)));
      this._meshAutoGridRows = Math.max(2, Math.min(32, Math.floor(Number(rows) || 5)));
    }

    _autoCreateMesh(autoMesh) {
      // autoMesh: 0 = Yes (create automatically using auto-grid resolution), 1 = No (skip if no grid exists).
      // Returns false when the effect should abort.
      autoMesh = this._parseAutoMesh(autoMesh);
      if (!this._meshCols || !this._meshRows) {
        if (autoMesh === 0) {
          const cols = this._meshAutoGridCols;
          const rows = this._meshAutoGridRows;
          const created = this._createMeshGrid(cols, rows);
          if (!created && !this._adoptExistingMesh(cols, rows)) return false;
        } else {
          return false;
        }
      }
      return true;
    }

    _destroyMeshGrid() {
      if (!this._ensureMeshSupport(true)) return;

      this._meshDestroy();
      this._meshCols = 0;
      this._meshRows = 0;
      this._meshPoints = [];
      this._meshEnergy = 0;
      this._meshEnabled = false;
      this._setMeshAnimating(false);
    }

    _setMeshEnabled(enabled) {
      this._meshEnabled = !!enabled;
      if (!this._meshEnabled) {
        this._setMeshAnimating(false);
      }
    }

    _setMeshStiffness(v) {
      this._meshStiffness = Math.max(0.001, Number(v));
    }

    _setMeshDamping(v) {
      this._meshDamping = Math.max(0, Math.min(1, Number(v)));
    }

    _setMeshPrecision(v) {
      this._meshPrecision = Math.max(0.0001, Number(v));
    }

    _resetMeshOffsets() {
      if (!this._ensureMeshSupport(true)) return;
      if (!this._meshCols || !this._meshRows) return;

      this._forEachMeshPoint((point, col, row) => {
        point.x = 0;
        point.y = 0;
        point.vx = 0;
        point.vy = 0;
        this._applyMeshPoint(col, row, point);
      });

      this._meshEnergy = 0;
      this._setMeshAnimating(false);
    }

    _meshSquashStretch(axis, amount, centerX, centerY, radius, autoMesh) {
      if (!this._ensureMeshSupport(true)) return;
      if (!this._autoCreateMesh(autoMesh)) return;

      const horizontal = Number(axis) === 0;
      amount = Number(amount) || 0;
      centerX = Number(centerX);
      centerY = Number(centerY);
      radius = Math.max(0.0001, Number(radius));

      this._forEachMeshPoint((point, col, row, index, px, py) => {
        const dx = px - centerX;
        const dy = py - centerY;
        const dist = Math.hypot(dx, dy);
        const falloff = this._meshFalloff(dist, radius, 1);
        if (falloff <= 0) return;

        if (horizontal) {
          point.vx += (-dx * amount) * falloff;
          point.vy += (dy * amount * 0.5) * falloff;
        } else {
          point.vy += (-dy * amount) * falloff;
          point.vx += (dx * amount * 0.5) * falloff;
        }
      });

      this._setMeshAnimating(true);
    }

    _meshPunch(centerX, centerY, strength, radius, falloffMode, autoMesh) {
      if (!this._ensureMeshSupport(true)) return;
      if (!this._autoCreateMesh(autoMesh)) return;

      centerX = Number(centerX);
      centerY = Number(centerY);
      strength = Number(strength) || 0;
      radius = Math.max(0.0001, Number(radius));
      falloffMode = this._parseFalloffMode(falloffMode);

      this._forEachMeshPoint((point, col, row, index, px, py) => {
        const dx = px - centerX;
        const dy = py - centerY;
        const dist = Math.hypot(dx, dy);
        if (dist <= 0.000001) return;
        const falloff = this._meshFalloff(dist, radius, falloffMode);
        if (falloff <= 0) return;

        const impulse = strength * falloff;
        point.vx += (dx / dist) * impulse;
        point.vy += (dy / dist) * impulse;
      });

      this._setMeshAnimating(true);
    }

    _meshWobble(angleDegrees, strength, autoMesh) {
      if (!this._ensureMeshSupport(true)) return;
      if (!this._autoCreateMesh(autoMesh)) return;

      const angle = Number(angleDegrees) * Math.PI / 180;
      const sx = Math.cos(angle);
      const sy = Math.sin(angle);
      strength = Number(strength) || 0;

      this._forEachMeshPoint((point, col, row, index, px, py) => {
        const rx = px - 0.5;
        const ry = py - 0.5;
        const gradient = (rx * sx) + (ry * sy);
        const impulse = gradient * strength;
        point.vx += sx * impulse;
        point.vy += sy * impulse;
      });

      this._setMeshAnimating(true);
    }

    _meshRipple(centerX, centerY, strength, wavelength, decay, autoMesh) {
      if (!this._ensureMeshSupport(true)) return;
      if (!this._autoCreateMesh(autoMesh)) return;

      centerX = Number(centerX);
      centerY = Number(centerY);
      strength = Number(strength) || 0;
      wavelength = Math.max(0.0001, Number(wavelength));
      decay = Math.max(0, Number(decay));

      this._forEachMeshPoint((point, col, row, index, px, py) => {
        const dx = px - centerX;
        const dy = py - centerY;
        const dist = Math.hypot(dx, dy);
        if (dist <= 0.000001) return;

        const wave = Math.sin((dist / wavelength) * Math.PI * 2);
        const attenuation = Math.exp(-decay * dist);
        const impulse = strength * wave * attenuation;
        point.vx += (dx / dist) * impulse;
        point.vy += (dy / dist) * impulse;
      });

      this._setMeshAnimating(true);
    }

    _meshShockwave(centerX, centerY, strength, ringRadius, ringWidth, autoMesh) {
      if (!this._ensureMeshSupport(true)) return;
      if (!this._autoCreateMesh(autoMesh)) return;

      centerX = Number(centerX);
      centerY = Number(centerY);
      strength = Number(strength) || 0;
      ringRadius = Math.max(0, Number(ringRadius));
      ringWidth = Math.max(0.0001, Number(ringWidth));

      this._forEachMeshPoint((point, col, row, index, px, py) => {
        const dx = px - centerX;
        const dy = py - centerY;
        const dist = Math.hypot(dx, dy);
        if (dist <= 0.000001) return;

        const ringDist = Math.abs(dist - ringRadius);
        const t = Math.max(0, 1 - (ringDist / ringWidth));
        if (t <= 0) return;

        const impulse = strength * t * t * (3 - 2 * t); // smoothstep falloff
        point.vx += (dx / dist) * impulse;
        point.vy += (dy / dist) * impulse;
      });

      this._setMeshAnimating(true);
    }

    _meshTwist(centerX, centerY, strength, radius, falloffMode, autoMesh) {
      if (!this._ensureMeshSupport(true)) return;
      if (!this._autoCreateMesh(autoMesh)) return;

      centerX = Number(centerX);
      centerY = Number(centerY);
      strength = Number(strength) || 0;
      radius = Math.max(0.0001, Number(radius));
      falloffMode = this._parseFalloffMode(falloffMode);

      this._forEachMeshPoint((point, col, row, index, px, py) => {
        const dx = px - centerX;
        const dy = py - centerY;
        const dist = Math.hypot(dx, dy);
        if (dist <= 0.000001) return;

        const falloff = this._meshFalloff(dist, radius, falloffMode);
        if (falloff <= 0) return;

        // Tangent direction is perpendicular to the radial: (-dy, dx) / dist
        const tx = -dy / dist;
        const ty = dx / dist;
        const impulse = strength * falloff;
        point.vx += tx * impulse;
        point.vy += ty * impulse;
      });

      this._setMeshAnimating(true);
    }

    _meshWave(angleDegrees, strength, wavelength, autoMesh) {
      if (!this._ensureMeshSupport(true)) return;
      if (!this._autoCreateMesh(autoMesh)) return;

      const rad = Number(angleDegrees) * Math.PI / 180;
      // Wave propagation direction
      const wx = Math.cos(rad);
      const wy = Math.sin(rad);
      // Displacement direction is perpendicular to propagation
      const dx = -wy;
      const dy = wx;
      strength = Number(strength) || 0;
      const wavelengthInput = Number(wavelength);
      wavelength = Math.max(0.0001, Math.abs(Number.isFinite(wavelengthInput) ? wavelengthInput : 0));

      // Normalize projection to 0..1 across the full sprite along the wave axis.
      // This makes wavelength values divide the mesh evenly in normalized space.
      const minProj = Math.min(0, wx, wy, wx + wy);
      const maxProj = Math.max(0, wx, wy, wx + wy);
      const projSpan = Math.max(0.0001, maxProj - minProj);
      const phaseBase = (Math.PI * 2) / wavelength;

      this._forEachMeshPoint((point, col, row, index, px, py) => {
        const proj = px * wx + py * wy;
        const normalizedProj = (proj - minProj) / projSpan;
        const wave = Math.sin(normalizedProj * phaseBase);
        const impulse = wave * strength;
        point.vx += dx * impulse;
        point.vy += dy * impulse;
      });

      this._setMeshAnimating(true);
    }

    _meshDirectionalBend(angleDegrees, strength, radius, falloffMode, autoMesh) {
      if (!this._ensureMeshSupport(true)) return;
      if (!this._autoCreateMesh(autoMesh)) return;

      const rad = Number(angleDegrees) * Math.PI / 180;
      const bx = Math.cos(rad);
      const by = Math.sin(rad);
      strength = Number(strength) || 0;
      radius = Math.max(0.0001, Number(radius));
      falloffMode = this._parseFalloffMode(falloffMode);

      this._forEachMeshPoint((point, col, row, index, px, py) => {
        const rx = px - 0.5;
        const ry = py - 0.5;
        const dist = Math.hypot(rx, ry);
        const falloff = this._meshFalloff(dist, radius, falloffMode);
        if (falloff <= 0) return;

        // Push the leading side more than the trailing side for a bend-like arc.
        const proj = rx * bx + ry * by;
        const edgeBias = Math.max(0, Math.min(1, proj + 0.5));
        const impulse = strength * edgeBias * falloff;
        point.vx += bx * impulse;
        point.vy += by * impulse;
      });

      this._setMeshAnimating(true);
    }

    _meshNoiseJitterBurst(centerX, centerY, strength, radius, falloffMode, autoMesh) {
      if (!this._ensureMeshSupport(true)) return;
      if (!this._autoCreateMesh(autoMesh)) return;

      centerX = Number(centerX);
      centerY = Number(centerY);
      strength = Number(strength) || 0;
      radius = Math.max(0.0001, Number(radius));
      falloffMode = this._parseFalloffMode(falloffMode);

      this._forEachMeshPoint((point, col, row, index, px, py) => {
        const dx = px - centerX;
        const dy = py - centerY;
        const dist = Math.hypot(dx, dy);
        const falloff = this._meshFalloff(dist, radius, falloffMode);
        if (falloff <= 0) return;

        const angle = Math.random() * Math.PI * 2;
        const impulse = strength * falloff;
        point.vx += Math.cos(angle) * impulse;
        point.vy += Math.sin(angle) * impulse;
      });

      this._setMeshAnimating(true);
    }

    _meshImpactTrailWave(centerX, centerY, angleDegrees, strength, wavelength, trailWidth, autoMesh) {
      if (!this._ensureMeshSupport(true)) return;
      if (!this._autoCreateMesh(autoMesh)) return;

      centerX = Number(centerX);
      centerY = Number(centerY);
      const rad = Number(angleDegrees) * Math.PI / 180;
      const wx = Math.cos(rad);
      const wy = Math.sin(rad);
      // Displacement axis is perpendicular to travel axis
      const dx = -wy;
      const dy = wx;
      strength = Number(strength) || 0;
      wavelength = Math.max(0.0001, Number(wavelength));
      trailWidth = Math.max(0.0001, Number(trailWidth));

      // Match wave anti-aliasing behavior: clamp to a wavelength the mesh can resolve.
      const stepX = this._meshCols > 1 ? Math.abs(wx) / (this._meshCols - 1) : 0;
      const stepY = this._meshRows > 1 ? Math.abs(wy) / (this._meshRows - 1) : 0;
      const minResolvableWavelength = Math.max(0.0001, 2 * Math.max(stepX, stepY));
      const effectiveWavelength = Math.max(wavelength, minResolvableWavelength);

      this._forEachMeshPoint((point, col, row, index, px, py) => {
        const rx = px - centerX;
        const ry = py - centerY;
        const along = rx * wx + ry * wy;
        const perp = rx * dx + ry * dy;
        const band = Math.exp(-Math.abs(perp) / trailWidth);
        if (band <= 0.00001) return;

        const wave = Math.sin((along / effectiveWavelength) * Math.PI * 2);
        const impulse = wave * strength * band;
        point.vx += dx * impulse;
        point.vy += dy * impulse;
      });

      this._setMeshAnimating(true);
    }

    _startMeshSway(angle, strength, wavelength, speed, autoMesh) {
      if (!this._ensureMeshSupport(true)) return;
      if (!this._autoCreateMesh(autoMesh)) return;

      this._meshSwayAngle = Number(angle) || 0;
      this._meshSwayStrength = Number(strength) || 0;
      this._meshSwayWavelength = Math.max(0.0001, Number(wavelength));
      this._meshSwaySpeed = Number(speed) || 1;
      this._meshSwayPhase = 0;
      this._meshSwayEnabled = true;
      this._setMeshAnimating(true);
    }

    _stopMeshSway() {
      this._meshSwayEnabled = false;
      // Let existing spring energy settle naturally - OnMeshSettled fires when done
    }

    _meshApplyPreset(preset, intensity, centerX, centerY, angle, autoMesh) {
      if (!this._ensureMeshSupport(true)) return;
      if (!this._autoCreateMesh(autoMesh)) return;

      const presetIdx = this._parsePresetIndex(preset);
      intensity = Number(intensity) || 1;
      centerX = Number(centerX);
      centerY = Number(centerY);
      angle = Number(angle) || 0;

      // Skip auto-mesh for internal effect calls (already done)
      const skipAutoMesh = "no";

      switch (presetIdx) {
        case 0: // Hit Impact: Punch + NoiseJitterBurst + DirectionalBend
          this._meshPunch(centerX, centerY, 0.22 * intensity, 0.7, 1, skipAutoMesh);
          this._meshNoiseJitterBurst(centerX, centerY, 0.08 * intensity, 0.5, 2, skipAutoMesh);
          this._meshDirectionalBend(angle, 0.10 * intensity, 1.0, 1, skipAutoMesh);
          break;

        case 1: // Heavy Slam: Shockwave + SquashStretch + Ripple
          this._meshShockwave(centerX, centerY, 0.18 * intensity, 0.4, 0.3, skipAutoMesh);
          this._meshSquashStretch("vertical", 0.25 * intensity, centerX, centerY, 1.0, skipAutoMesh);
          this._meshRipple(centerX, centerY, 0.12 * intensity, 0.6, 0.85, skipAutoMesh);
          break;

        case 2: // Sword Trail: ImpactTrailWave + Twist
          this._meshImpactTrailWave(centerX, centerY, angle, 0.2 * intensity, 0.4, 0.3, skipAutoMesh);
          this._meshTwist(centerX, centerY, 0.15 * intensity, 0.8, 1, skipAutoMesh);
          break;

        case 3: // Wind Gust Foliage: DirectionalBend + Wave
          this._meshDirectionalBend(angle, 0.16 * intensity, 1.2, 0, skipAutoMesh);
          this._meshWave(angle, 0.12 * intensity, 0.5, skipAutoMesh);
          break;

        case 4: // Electric Stun: NoiseJitterBurst + Wobble + Ripple
          this._meshNoiseJitterBurst(centerX, centerY, 0.14 * intensity, 0.6, 1, skipAutoMesh);
          this._meshWobble(angle, 0.18 * intensity, skipAutoMesh);
          this._meshRipple(centerX, centerY, 0.10 * intensity, 0.5, 0.9, skipAutoMesh);
          break;

        case 5: // Portal Spawn: Twist + Ripple + Shockwave
          this._meshTwist(centerX, centerY, 0.20 * intensity, 0.9, 1, skipAutoMesh);
          this._meshRipple(centerX, centerY, 0.15 * intensity, 0.7, 0.8, skipAutoMesh);
          this._meshShockwave(centerX, centerY, 0.16 * intensity, 0.5, 0.35, skipAutoMesh);
          break;

        case 6: // UI Pop/Collect: Punch + SquashStretch
          this._meshPunch(centerX, centerY, 0.2 * intensity, 0.8, 0, skipAutoMesh);
          this._meshSquashStretch("vertical", 0.15 * intensity, centerX, centerY, 1.0, skipAutoMesh);
          break;

        case 7: // Explosion Burst: Shockwave + Ripple + NoiseJitterBurst
          this._meshShockwave(centerX, centerY, 0.28 * intensity, 0.35, 0.25, skipAutoMesh);
          this._meshRipple(centerX, centerY, 0.18 * intensity, 0.45, 0.7, skipAutoMesh);
          this._meshNoiseJitterBurst(centerX, centerY, 0.10 * intensity, 0.7, 2, skipAutoMesh);
          break;

        case 8: // Jelly Bounce: Wobble + SquashStretch + Soft Ripple
          this._meshWobble(angle, 0.14 * intensity, skipAutoMesh);
          this._meshSquashStretch("vertical", 0.20 * intensity, centerX, centerY, 1.0, skipAutoMesh);
          this._meshRipple(centerX, centerY, 0.08 * intensity, 0.8, 1.1, skipAutoMesh);
          break;

        case 9: // Whip Lash: DirectionalBend + ImpactTrailWave + Jitter
          this._meshDirectionalBend(angle, 0.19 * intensity, 1.0, 1, skipAutoMesh);
          this._meshImpactTrailWave(centerX, centerY, angle, 0.16 * intensity, 0.35, 0.22, skipAutoMesh);
          this._meshNoiseJitterBurst(centerX, centerY, 0.05 * intensity, 0.45, 1, skipAutoMesh);
          break;

        case 10: // Teleport Glitch: Twist + Jitter + Small Shockwave
          this._meshTwist(centerX, centerY, 0.24 * intensity, 0.75, 2, skipAutoMesh);
          this._meshNoiseJitterBurst(centerX, centerY, 0.12 * intensity, 0.55, 2, skipAutoMesh);
          this._meshShockwave(centerX, centerY, 0.11 * intensity, 0.22, 0.2, skipAutoMesh);
          break;

        default:
          // Default to Hit Impact if preset is unknown
          this._meshPunch(centerX, centerY, 0.22 * intensity, 0.7, 1, skipAutoMesh);
          this._meshNoiseJitterBurst(centerX, centerY, 0.08 * intensity, 0.5, 2, skipAutoMesh);
          this._meshDirectionalBend(angle, 0.10 * intensity, 1.0, 1, skipAutoMesh);
      }
    }

    _tickMesh(dt) {
      if (!this._ensureMeshSupport(false)) {
        this._meshEnabled = false;
        this._setMeshAnimating(false);
        return;
      }

      if (!this._meshCols || !this._meshRows || !this._meshPoints.length) {
        this._setMeshAnimating(false);
        this._meshEnergy = 0;
        return;
      }

      const stepScale = dt * 60;
      let anyActive = false;
      let energy = 0;

      // Precompute sway sine wave for this tick.
      // Sway is written as a direct offset (not through spring physics) so the sine
      // shape is always clean regardless of stiffness/damping settings.
      // Other effects (punch, wobble, etc.) still use spring physics independently.
      let swayWx = 0, swayWy = 0, swayDx = 0, swayDy = 0;
      if (this._meshSwayEnabled) {
        this._meshSwayPhase += this._meshSwaySpeed * dt * Math.PI * 2;
        const rad = this._meshSwayAngle * Math.PI / 180;
        // Wave propagates along (wx, wy); displacement is perpendicular (dx, dy).
        swayWx = Math.cos(rad);
        swayWy = Math.sin(rad);
        swayDx = -swayWy;
        swayDy = swayWx;
      }

      this._forEachMeshPoint((point, col, row, index, px, py) => {
        // Spring physics: target is always rest (0,0); impulse effects spring back here.
        point.vx += (0 - point.x) * this._meshStiffness;
        point.vy += (0 - point.y) * this._meshStiffness;
        point.vx *= this._meshDamping;
        point.vy *= this._meshDamping;
        point.x += point.vx * stepScale;
        point.y += point.vy * stepScale;

        // Sway: direct sine offset added on top of spring position.
        let swayX = 0, swayY = 0;
        if (this._meshSwayEnabled) {
          // `along` = how far along the wave-propagation axis this point sits (0–1).
          const along = px * swayWx + py * swayWy;
          const sineVal = Math.sin(this._meshSwayPhase + along * (Math.PI * 2 / this._meshSwayWavelength)) * this._meshSwayStrength;
          swayX = swayDx * sineVal;
          swayY = swayDy * sineVal;
        }

        this._applyMeshPoint(col, row, point, swayX, swayY);

        const localEnergy = Math.abs(point.x) + Math.abs(point.y) + Math.abs(point.vx) + Math.abs(point.vy);
        energy += localEnergy;
        if (Math.abs(point.x) >= this._meshPrecision ||
          Math.abs(point.y) >= this._meshPrecision ||
          Math.abs(point.vx) >= this._meshPrecision ||
          Math.abs(point.vy) >= this._meshPrecision) {
          anyActive = true;
        }
      });

      this._meshEnergy = energy;
      // Sway never settles - keep mesh animating while sway is on
      if (this._meshSwayEnabled) anyActive = true;
      if (!anyActive && this._meshAnimating) {
        this._setMeshAnimating(false);
        this._trigger("OnMeshSettled");
      }
    }

    _isMeshSupported() {
      return this._ensureMeshSupport(false);
    }

    _isMeshEnabled() {
      return this._meshEnabled;
    }

    _isMeshAnimating() {
      return this._meshAnimating;
    }

    _hasMeshSettled() {
      return !this._meshAnimating && this._meshEnergy < this._meshPrecision;
    }

    _getMeshEnergy() {
      return this._meshEnergy;
    }

    _getMeshPointCount() {
      return this._meshPoints.length;
    }

    _getMeshOffsetXAtIndex(index) {
      index = Math.floor(Number(index));
      if (index < 0 || index >= this._meshPoints.length) return 0;
      return this._meshPoints[index].x;
    }

    _getSpringCount() {
      return this._springs.size;
    }

    _getSpringIdAt(index) {
      index = Math.floor(Number(index));
      if (index < 0 || index >= this._springs.size) return "";
      return Array.from(this._springs.keys())[index] ?? "";
    }

    _getLastSpringId() {
      return this._lastTriggeredSpringId;
    }

    _getLastCompletedSpringId() {
      return this._lastCompletedSpringId;
    }

    _getSpringValue(id = this._defaultSpringId) {
      return this._getSpring(id, false)?.smoothValue ?? 0;
    }

    _getValue() {
      return this._getSpringValue(this._defaultSpringId);
    }

    _getSpringFrom(id = this._defaultSpringId) {
      return this._getSpring(id, false)?.from ?? 0;
    }

    _getFrom() {
      return this._getSpringFrom(this._defaultSpringId);
    }

    _getFromValue() {
      return this._getFrom();
    }

    _getSpringTo(id = this._defaultSpringId) {
      return this._getSpring(id, false)?.to ?? 0;
    }

    _getTo() {
      return this._getSpringTo(this._defaultSpringId);
    }

    _getToValue() {
      return this._getTo();
    }

    _getSpringVelocity(id = this._defaultSpringId) {
      return this._getSpring(id, false)?.velocity ?? 0;
    }

    _getVelocity() {
      return this._getSpringVelocity(this._defaultSpringId);
    }

    _getSpringStiffness(id = this._defaultSpringId) {
      return this._getSpring(id, false)?.stiffness ?? this._stiffness;
    }

    _getStiffness() {
      return this._getSpringStiffness(this._defaultSpringId);
    }

    _getSpringDamping(id = this._defaultSpringId) {
      return this._getSpring(id, false)?.damping ?? this._damping;
    }

    _getDamping() {
      return this._getSpringDamping(this._defaultSpringId);
    }

    _getSpringPrecision(id = this._defaultSpringId) {
      return this._getSpring(id, false)?.precision ?? this._precision;
    }

    _getPrecision() {
      return this._getSpringPrecision(this._defaultSpringId);
    }

    _isSpringAnimatingId(id = this._defaultSpringId) {
      return !!this._getSpring(id, false)?.isAnimating;
    }

    _isSpringAnimating() {
      return this._isSpringAnimatingId(this._defaultSpringId);
    }

    _hasSpringReachedTarget(id = this._defaultSpringId) {
      const spring = this._getSpring(id, false);
      if (!spring) return true;
      return !spring.isAnimating && Math.abs(spring.to - spring.value) < spring.precision;
    }

    _hasReachedTarget() {
      return this._hasSpringReachedTarget(this._defaultSpringId);
    }

    _isSpringEnabled() {
      return this._isEnabled;
    }

    _getSpringProgress(id = this._defaultSpringId) {
      const spring = this._getSpring(id, false);
      if (!spring) return 1;

      const total = spring.to - spring.from;
      if (Math.abs(total) <= 0.000001) {
        return 1;
      }

      const progress = (spring.smoothValue - spring.from) / total;
      return Math.max(0, Math.min(1, progress));
    }

    _getProgress() {
      return this._getSpringProgress(this._defaultSpringId);
    }

    _saveToJson() {
      return {
        isEnabled: this._isEnabled,
        stiffness: this._stiffness,
        damping: this._damping,
        precision: this._precision,
        lastTriggeredSpringId: this._lastTriggeredSpringId,
        lastCompletedSpringId: this._lastCompletedSpringId,
        meshEnabled: this._meshEnabled,
        meshAnimating: this._meshAnimating,
        meshCols: this._meshCols,
        meshRows: this._meshRows,
        meshStiff: this._meshStiffness,
        meshDamp: this._meshDamping,
        meshPrec: this._meshPrecision,
        meshEnergy: this._meshEnergy,
        meshPoints: this._meshPoints,
        meshAutoGridCols: this._meshAutoGridCols,
        meshAutoGridRows: this._meshAutoGridRows,
        meshSwayEnabled: this._meshSwayEnabled,
        meshSwayAngle: this._meshSwayAngle,
        meshSwayStrength: this._meshSwayStrength,
        meshSwayWavelength: this._meshSwayWavelength,
        meshSwaySpeed: this._meshSwaySpeed,
        meshSwayPhase: this._meshSwayPhase,
        autoApplyColourSpringIds: Array.from(this._autoApplyColourSpringIds),
        autoApplyTransformPositionSpringIds: Array.from(this._autoApplyTransformPositionSpringIds),
        autoApplyTransformSizeSpringIds: Array.from(this._autoApplyTransformSizeSpringIds),
        autoApplyTransformAngleSpringIds: Array.from(this._autoApplyTransformAngleSpringIds),
        springs: Array.from(this._springs.values()).map((spring) => ({
          id: spring.id,
          from: spring.from,
          to: spring.to,
          value: spring.value,
          velocity: spring.velocity,
          isAnimating: spring.isAnimating,
          smoothValue: spring.smoothValue,
          time: spring.time,
          steps: spring.steps,
          prevValue: spring.prevValue,
          alwaysSpringEnabled: spring.alwaysSpringEnabled,
          alwaysSpringMode: spring.alwaysSpringMode,
          stiffness: spring.stiffness,
          damping: spring.damping,
          precision: spring.precision,
        })),
      };
    }

    _loadFromJson(o) {
      this._isEnabled = o?.isEnabled !== undefined ? !!o.isEnabled : this._isEnabled;
      this._stiffness = Number(o?.stiffness ?? this._stiffness);
      this._damping = Number(o?.damping ?? this._damping);
      this._precision = Number(o?.precision ?? this._precision);
      this._lastTriggeredSpringId = this._normalizeSpringId(o?.lastTriggeredSpringId ?? this._defaultSpringId);
      this._lastCompletedSpringId = this._normalizeSpringId(o?.lastCompletedSpringId ?? this._defaultSpringId);
      this._autoApplyColourSpringIds = new Set(
        (Array.isArray(o?.autoApplyColourSpringIds) ? o.autoApplyColourSpringIds : [])
          .map((springId) => this._normalizeSpringId(springId))
      );
      this._autoApplyTransformPositionSpringIds = new Set(
        (Array.isArray(o?.autoApplyTransformPositionSpringIds) ? o.autoApplyTransformPositionSpringIds : [])
          .map((springId) => this._normalizeSpringId(springId))
      );
      this._autoApplyTransformSizeSpringIds = new Set(
        (Array.isArray(o?.autoApplyTransformSizeSpringIds) ? o.autoApplyTransformSizeSpringIds : [])
          .map((springId) => this._normalizeSpringId(springId))
      );
      this._autoApplyTransformAngleSpringIds = new Set(
        (Array.isArray(o?.autoApplyTransformAngleSpringIds) ? o.autoApplyTransformAngleSpringIds : [])
          .map((springId) => this._normalizeSpringId(springId))
      );
      this._normalizeSingleActiveSet(this._autoApplyColourSpringIds);
      this._normalizeSingleActiveSet(this._autoApplyTransformPositionSpringIds);
      this._normalizeSingleActiveSet(this._autoApplyTransformSizeSpringIds);
      this._normalizeSingleActiveSet(this._autoApplyTransformAngleSpringIds);

      this._meshEnabled = !!o?.meshEnabled;
      this._meshAnimating = !!o?.meshAnimating;
      this._meshCols = Math.max(0, Math.floor(Number(o?.meshCols) || 0));
      this._meshRows = Math.max(0, Math.floor(Number(o?.meshRows) || 0));
      this._meshStiffness = Math.max(0.001, Number(o?.meshStiff) || this._stiffness);
      this._meshDamping = Math.max(0, Math.min(1, Number(o?.meshDamp) || this._damping));
      this._meshPrecision = Math.max(0.0001, Number(o?.meshPrec) || this._precision);
      this._meshEnergy = Math.max(0, Number(o?.meshEnergy) || 0);
      this._meshAutoGridCols = Math.max(2, Math.min(32, Math.floor(Number(o?.meshAutoGridCols) || 5)));
      this._meshAutoGridRows = Math.max(2, Math.min(32, Math.floor(Number(o?.meshAutoGridRows) || 5)));
      this._meshSwayEnabled = !!o?.meshSwayEnabled;
      this._meshSwayAngle = Number(o?.meshSwayAngle) || 0;
      this._meshSwayStrength = Number(o?.meshSwayStrength) || 0.08;
      this._meshSwayWavelength = Math.max(0.0001, Number(o?.meshSwayWavelength) || 0.5);
      this._meshSwaySpeed = Number(o?.meshSwaySpeed) || 1;
      this._meshSwayPhase = Number(o?.meshSwayPhase) || 0;

      if (Array.isArray(o?.meshPoints)) {
        this._meshPoints = o.meshPoints.map((p) => ({
          x: Number(p?.x) || 0,
          y: Number(p?.y) || 0,
          vx: Number(p?.vx) || 0,
          vy: Number(p?.vy) || 0,
        }));
      } else {
        this._meshPoints = [];
      }

      this._springs = new Map();
      const springs = Array.isArray(o?.springs) ? o.springs : [];
      if (!springs.length) {
        this._createSpring(this._defaultSpringId);
      } else {
        for (const savedSpring of springs) {
          const spring = this._createSpring(savedSpring.id);
          spring.from = Number(savedSpring.from ?? 0);
          spring.to = Number(savedSpring.to ?? 0);
          spring.value = Number(savedSpring.value ?? 0);
          spring.velocity = Number(savedSpring.velocity ?? 0);
          spring.isAnimating = !!savedSpring.isAnimating;
          spring.smoothValue = Number(savedSpring.smoothValue ?? spring.value);
          spring.time = Number(savedSpring.time ?? 0);
          spring.steps = Number(savedSpring.steps ?? 0);
          spring.prevValue = Number(savedSpring.prevValue ?? spring.value);
          spring.alwaysSpringEnabled = !!savedSpring.alwaysSpringEnabled;
          spring.alwaysSpringMode = Number(savedSpring.alwaysSpringMode ?? 0);
          spring.stiffness = Math.max(0.001, Number(savedSpring.stiffness ?? this._stiffness));
          spring.damping = Math.max(0, Math.min(1, Number(savedSpring.damping ?? this._damping)));
          spring.precision = Math.max(0.0001, Math.min(1, Number(savedSpring.precision ?? this._precision)));
        }
      }

      if (!this._springs.has(this._defaultSpringId)) {
        this._createSpring(this._defaultSpringId);
      }
      if (this._meshCols > 1 && this._meshRows > 1 && this._meshPoints.length === this._meshCols * this._meshRows) {
        if (this._ensureMeshSupport(false)) {
          this._meshCreate(this._meshCols, this._meshRows);
          this._forEachMeshPoint((point, col, row) => {
            this._applyMeshPoint(col, row, point);
          });
        } else {
          this._meshEnabled = false;
          this._meshAnimating = false;
        }
      } else {
        this._meshCols = 0;
        this._meshRows = 0;
        this._meshPoints = [];
        this._meshEnabled = false;
        this._meshAnimating = false;
      }
    }

    _getMeshOffsetYAtIndex(index) {
      index = Math.floor(Number(index));
      if (index < 0 || index >= this._meshPoints.length) return 0;
      return this._meshPoints[index].y;
    }

    _getMeshCols() {
      return this._meshCols;
    }

    _getMeshRows() {
      return this._meshRows;
    }

    _getDebuggerProperties() {
      const spring = this._getSpring(this._defaultSpringId, true);
      return [
        {
          title: "$" + this.behaviorType.name,
          properties: [
            { name: "$isEnabled", value: this._isEnabled },
            { name: "$springCount", value: this._springs.size },
            { name: "$defaultSpringId", value: this._defaultSpringId },
            { name: "$isAnimating", value: spring.isAnimating },
            { name: "$value", value: spring.value, onedit: v => { spring.value = +v; spring.smoothValue = +v; spring.prevValue = +v; } },
            { name: "$from", value: spring.from },
            { name: "$to", value: spring.to, onedit: v => { spring.to = +v; spring.isAnimating = true; } },
            { name: "$velocity", value: spring.velocity, onedit: v => { spring.velocity = +v; spring.isAnimating = true; } },
            { name: "$stiffness", value: this._stiffness, onedit: v => this._stiffness = Math.max(0.001, +v) },
            { name: "$damping", value: this._damping, onedit: v => this._damping = Math.max(0, Math.min(1, +v)) },
            { name: "$precision", value: this._precision, onedit: v => this._precision = Math.max(0.0001, +v) },
            { name: "$alwaysSpring", value: spring.alwaysSpringEnabled },
            { name: "$lastSpringId", value: this._lastTriggeredSpringId },
          ]
        },
        {
          title: "$" + this.behaviorType.name + " - Mesh",
          properties: [
            { name: "$enabled", value: this._meshEnabled, onedit: v => this._meshEnabled = (v === "true") },
            { name: "$animating", value: this._meshAnimating },
            { name: "$Mesh Grid", value: this._meshCols + "×" + this._meshRows },
            { name: "$energy", value: this._meshEnergy },
            { name: "$stiffness", value: this._meshStiffness, onedit: v => this._meshStiffness = Math.max(0.001, +v) },
            { name: "$damping", value: this._meshDamping, onedit: v => this._meshDamping = Math.max(0, Math.min(1, +v)) },
            { name: "$precision", value: this._meshPrecision, onedit: v => this._meshPrecision = Math.max(0.0001, +v) },
          ]
        }
      ];
    }
  };
}
