import { id, addonType, name } from "../../config.caw.js";
import AddonTypeMap from "../../template/addonTypeMap.js";

export default function (parentClass) {
  return class extends parentClass {
    constructor() {
      super();
      const props = this._getInitProperties() || [];

      // Settings
      this._stiffness = Number(props[0]) || 0.15;
      this._damping = Number(props[1]) || 0.8;
      this._precision = Number(props[2]) || 0.01;
      this._isEnabled = props[3] !== undefined ? !!props[3] : true;

      // Spring state
      this._from = 0;
      this._to = 0;
      this._value = 0;
      this._velocity = 0;
      this._isAnimating = false;
      this._smoothValue = 0;

      // For framerate independence (fixed 60fps physics)
      this._time = 0;
      this._steps = 0;
      this._prevValue = 0;

      // Always spring mode
      this._alwaysSpringEnabled = false;
      this._alwaysSpringMode = 0; // 0 = value, 1 = angle

      this._setTicking(true);
    }

    _tick() {
      if (!this._isEnabled) return;

      // Always spring to target if enabled — wake up only when not settled
      if (this._alwaysSpringEnabled && !this._isAnimating) {
        const dist = Math.abs(this._to - this._value);
        const speed = Math.abs(this._velocity);
        if (dist >= this._precision || speed >= this._precision) {
          this._isAnimating = true;
        }
      }

      if (!this._isAnimating) return;

      const dt = Math.min(this.instance.runtime.dt, 0.067); // Cap at ~15fps
      this._time += dt;

      // Run physics at fixed 60fps
      const targetSteps = Math.floor(this._time * 60);
      while (this._steps < targetSteps) {
        this._prevValue = this._value;
        this._stepPhysics();
        this._steps++;
      }

      // Smooth interpolation between physics steps
      const t = (this._time * 60) - this._steps;
      this._smoothValue = this._prevValue + (this._value - this._prevValue) * t;

      // Check if we've settled
      const dist = Math.abs(this._to - this._value);
      const speed = Math.abs(this._velocity);

      if (dist < this._precision && speed < this._precision) {
        this._finish();
        this._trigger("OnReachedTarget");
      }

      // Safety check
      if (!isFinite(this._value)) {
        this._finish();
      }
    }

    _stepPhysics() {
      let targetValue = this._to;

      // For angle mode, find shortest path
      if (this._alwaysSpringEnabled && this._alwaysSpringMode === 1) {
        let diff = this._to - this._value;
        // Normalize to -180 to 180
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        targetValue = this._value + diff;
      }

      const displacement = targetValue - this._value;
      this._velocity += displacement * this._stiffness;
      this._velocity *= this._damping;
      this._value += this._velocity;
    }

    _finish() {
      this._value = this._to;
      this._smoothValue = this._to;
      this._velocity = 0;
      this._isAnimating = false;
      this._time = 0;
      this._steps = 0;
    }

    _reset(startValue) {
      this._value = startValue;
      this._prevValue = startValue;
      this._smoothValue = startValue;
      this._velocity = 0;
      this._time = 0;
      this._steps = 0;
    }

    _trigger(method) {
      this.dispatch(method);
      super._trigger(self.C3[AddonTypeMap[addonType]][id].Cnds[method]);
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

    _springFromTo(from, to) {
      from = Number(from);
      to = Number(to);

      const wasAnimating = this._isAnimating;

      if (!this._isAnimating) {
        this._reset(from);
      }

      this._from = from;
      this._to = to;
      this._isAnimating = true;

      if (!wasAnimating) {
        this._trigger("OnStarted");
      }
    }

    _springTo(to, mode) {
      to = Number(to);
      mode = Number(mode) || 0;

      let targetTo = to;

      if (mode === 1) {
        // Angle mode: find shortest path from current value to target
        let normalizedTo = to % 360;
        if (normalizedTo < 0) normalizedTo += 360;

        let normalizedCurrent = this._smoothValue % 360;
        if (normalizedCurrent < 0) normalizedCurrent += 360;

        let diff = normalizedTo - normalizedCurrent;
        if (diff > 180) diff -= 360;
        if (diff < -180) diff += 360;

        targetTo = this._smoothValue + diff;
      }

      const wasAnimating = this._isAnimating;

      if (!this._isAnimating) {
        this._reset(this._smoothValue);
      }

      this._from = this._smoothValue;
      this._to = targetTo;
      this._isAnimating = true;

      if (!wasAnimating) {
        this._trigger("OnStarted");
      }
    }

    _springFromToAngle(from, to) {
      from = Number(from) % 360;
      to = Number(to) % 360;

      if (from < 0) from += 360;
      if (to < 0) to += 360;

      // Find shortest rotation
      let diff = to - from;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      const wasAnimating = this._isAnimating;

      if (!this._isAnimating) {
        this._reset(from);
      }

      this._from = this._value;
      this._to = this._value + diff;
      this._isAnimating = true;

      if (!wasAnimating) {
        this._trigger("OnStarted");
      }
    }

    _setStiffness(v) {
      this._stiffness = Math.max(0.001, Number(v));
    }

    _setDamping(v) {
      this._damping = Math.max(0, Math.min(1, Number(v)));
    }

    _setPrecision(v) {
      this._precision = Math.max(0.0001, Math.min(1, Number(v)));
    }

    _setEnabled(v) {
      this._isEnabled = !!v;
    }

    _stopAtCurrentValue() {
      this._to = this._value;
      this._smoothValue = this._value;
      this._velocity = 0;
      this._isAnimating = false;
      this._time = 0;
      this._steps = 0;
      this._trigger("OnStopped");
    }

    _snapToTarget() {
      this._finish();
      this._trigger("OnStopped");
    }

    _resetToValue(v) {
      v = Number(v);
      this._from = v;
      this._to = v;
      this._reset(v);
      this._isAnimating = false;
    }

    _setVelocity(v) {
      this._velocity = Number(v);
      this._isAnimating = true;
    }

    _addToVelocity(v) {
      this._velocity += Number(v);
      this._isAnimating = true;
    }

    _setAlwaysSpring(enabled, target, mode) {
      this._alwaysSpringEnabled = !!enabled;
      this._to = Number(target);
      this._alwaysSpringMode = Number(mode);

      // Initialize value to target if not already animating
      if (enabled && !this._isAnimating) {
        this._value = this._to;
        this._smoothValue = this._to;
        this._prevValue = this._to;
        this._time = 0;
        this._steps = 0;
      }
    }

    _setAlwaysSpringTarget(target) {
      this._to = Number(target);
      if (this._alwaysSpringEnabled) {
        this._isAnimating = true;
      }
    }

    _isAlwaysSpringEnabled() {
      return this._alwaysSpringEnabled;
    }

    _getAlwaysSpringTarget() {
      return this._to;
    }

    _isSpringAnimating() {
      return this._isAnimating;
    }

    _isSpringEnabled() {
      return this._isEnabled;
    }

    _hasReachedTarget() {
      return !this._isAnimating && Math.abs(this._value - this._to) < this._precision;
    }

    _getValue() {
      return this._smoothValue;
    }

    _getProgress() {
      const span = Math.abs(this._to - this._from);
      if (span === 0 || !this._isAnimating) return 1;
      const remaining = Math.abs(this._to - this._smoothValue);
      return 1 - Math.min(remaining / span, 1);
    }

    _getFromValue() {
      return this._from;
    }

    _getToValue() {
      return this._to;
    }

    _getVelocity() {
      return this._velocity;
    }

    _getStiffness() {
      return this._stiffness;
    }

    _getDamping() {
      return this._damping;
    }

    _getPrecision() {
      return this._precision;
    }

    _saveToJson() {
      return {
        from: this._from,
        to: this._to,
        val: this._value,
        vel: this._velocity,
        stiff: this._stiffness,
        damp: this._damping,
        prec: this._precision,
        anim: this._isAnimating,
        enabled: this._isEnabled,
        alwaysEnabled: this._alwaysSpringEnabled,
        alwaysMode: this._alwaysSpringMode
      };
    }

    _loadFromJson(o) {
      this._from = o.from || 0;
      this._to = o.to || 0;
      this._value = o.val || 0;
      this._velocity = o.vel || 0;
      this._stiffness = o.stiff || 0.15;
      this._damping = o.damp || 0.8;
      this._precision = o.prec || 0.01;
      this._isAnimating = o.anim || false;
      this._isEnabled = o.enabled !== undefined ? !!o.enabled : true;
      this._smoothValue = this._value;
      this._prevValue = this._value;
      this._alwaysSpringEnabled = o.alwaysEnabled || false;
      this._alwaysSpringMode = o.alwaysMode || 0;
    }

    _getDebuggerProperties() {
      return [{
        title: "$" + this.behaviorType.name,
        properties: [
          { name: "$isEnabled", value: this._isEnabled },
          { name: "$isAnimating", value: this._isAnimating },
          { name: "$value", value: this._value, onedit: v => { this._value = +v; this._smoothValue = +v; } },
          { name: "$from", value: this._from },
          { name: "$to", value: this._to, onedit: v => { this._to = +v; this._isAnimating = true; } },
          { name: "$velocity", value: this._velocity, onedit: v => { this._velocity = +v; this._isAnimating = true; } },
          { name: "$stiffness", value: this._stiffness, onedit: v => this._stiffness = Math.max(0.001, +v) },
          { name: "$damping", value: this._damping, onedit: v => this._damping = Math.max(0, Math.min(1, +v)) },
          { name: "$precision", value: this._precision, onedit: v => this._precision = Math.max(0.0001, +v) },
          { name: "$alwaysSpring", value: this._alwaysSpringEnabled },
        ]
      }];
    }
  };
}
