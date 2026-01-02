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
      
      // Spring state
      this._from = 0;
      this._to = 0;
      this._value = 0;
      this._velocity = 0;
      this._isAnimating = false;
      
      // For framerate independence (fixed 60fps physics)
      this._time = 0;
      this._steps = 0;
      this._prevValue = 0;

      this._setTicking(true);
    }
    
    _tick() {
      if (!this._isAnimating) return;
      
      const dt = Math.min(this._inst.dt, 0.067); // Cap at ~15fps
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
      const displacement = this._to - this._value;
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
      
      if (!this._isAnimating) {
        this._reset(from);
      }
      
      this._from = from;
      this._to = to;
      this._isAnimating = true;
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
      
      if (!this._isAnimating) {
        this._reset(from);
      }
      
      this._from = this._value;
      this._to = this._value + diff;
      this._isAnimating = true;
    }
    
    _setStiffness(v) {
      this._stiffness = Math.max(0.01, Math.min(1, Number(v)));
    }
    
    _setDamping(v) {
      this._damping = Math.max(0, Math.min(1, Number(v)));
    }
    
    _stop() {
      this._finish();
    }
    
    _snapToTarget() {
      this._finish();
    }
    
    _setVelocity(v) {
      this._velocity = Number(v);
      this._isAnimating = true;
    }
    
    _addToVelocity(v) {
      this._velocity += Number(v);
      this._isAnimating = true;
    }
    
    _isSpringAnimating() {
      return this._isAnimating;
    }
    
    _hasReachedTarget() {
      return !this._isAnimating && Math.abs(this._value - this._to) < this._precision;
    }
    
    _getValue() {
      return this._smoothValue;
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

    _saveToJson() {
      return {
        from: this._from,
        to: this._to,
        val: this._value,
        vel: this._velocity,
        stiff: this._stiffness,
        damp: this._damping,
        prec: this._precision,
        anim: this._isAnimating
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
      this._smoothValue = this._value;
      this._prevValue = this._value;
    }
    
    _getDebuggerProperties() {
      return [{
        title: "$" + this.behaviorType.name,
        properties: [
          { name: "$isAnimating", value: this._isAnimating },
          { name: "$value", value: this._value, onedit: v => this._value = v },
          { name: "$velocity", value: this._velocity, onedit: v => this._velocity = v },
          { name: "$stiffness", value: this._stiffness, onedit: v => this._stiffness = v },
          { name: "$damping", value: this._damping, onedit: v => this._damping = v },
        ]
      }];
    }
  };
}