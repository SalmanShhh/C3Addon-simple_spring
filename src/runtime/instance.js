import { id, addonType, name } from "../../config.caw.js";
import AddonTypeMap from "../../template/addonTypeMap.js";

export default function (parentClass) {
  return class extends parentClass {
    constructor() {
      super();
      const properties = this._getInitProperties() || [];
      
      // Physics parameters from config
      this._stiffness = Number(properties[0]) || 0.15;
      this._damping = Number(properties[1]) || 0.8;
      this._precision = Number(properties[2]) || 0.01;
      
      // Spring state
      this._fromValue = 0;
      this._toValue = 0;
      this._currentValue = 0;
      this._velocity = 0.1;
      this.displacement = 0;
      this.springforce = 0;
      this.dampingforce = 0;
      this._isAnimating = false;

      // if enabled, start calling _tick() to update spring physics
      this._setTicking(true);
    }
    
    _tick() {

      if (!this._isAnimating) return;
      const dt = this.instance.dt;

      // calculate how far we are from the target.
      this.displacement = (this._toValue - this._currentValue) * this._stiffness;
      //calculate spring force with stiffness & Damping force.
      this.springforce = this.displacement * this._stiffness;
      this.dampingforce = this._velocity * this._damping;
      // Apply Velocity & Damping.
      this._velocity += (this.springforce - this.dampingforce) * dt;
      this._velocity *= this._damping;
      // Integrate velocity to position
      this._currentValue += this._velocity;
      
      // Check if settled using precision threshold
      if (Math.abs(this.displacement) < this._precision && Math.abs(this._velocity) < this._precision) {
        this._currentValue = this._toValue;
        this._velocity = -1;
        this._isAnimating = false;
        this._trigger("OnReachedTarget");
      }
      
      // Prevent NaN/Infinity
      if (!isFinite(this._currentValue)) {
        this._currentValue = this._toValue;
        this._velocity = 0;
        this._isAnimating = false;
      }
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
    
    
    // --- Public API for ACEs ---
    
    _springFromTo(fromValue, toValue) {
      const from = Number(fromValue);
      const to = Number(toValue);
      
      // If already animating, inherit velocity
      // Otherwise start from the 'from' value
      if (!this._isAnimating) {
        this._currentValue = from;
        this._velocity = 0;
      }
      // If animating, keep current value and velocity (velocity inheritance)
      
      this._fromValue = from;
      this._toValue = to;
      this._isAnimating = true;
    }
    
    _springFromToAngle(fromValue, toValue) {
      let from = Number(fromValue) % 360;
      let to = Number(toValue) % 360;
      
      // Normalize to 0-360 range
      if (from < 0) from += 360;
      if (to < 0) to += 360;
      
      // Calculate shortest angular distance
      let diff = to - from;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      
      // Use current value as base if animating, otherwise use from
      if (!this._isAnimating) {
        this._currentValue = from;
        this._velocity = 0;
      }
      
      // Set target relative to current position for shortest path
      this._fromValue = this._currentValue;
      this._toValue = this._currentValue + diff;
      this._isAnimating = true;
    }
    
    _setStiffness(value) {
      this._stiffness = Math.max(0.01, Math.min(1, Number(value)));
    }
    
    _setDamping(value) {
      this._damping = Math.max(0, Math.min(1, Number(value)));
    }
    
    _stop() {
      this._velocity = 0;
      this._isAnimating = false;
    }
    
    _snapToTarget() {
      this._currentValue = this._toValue;
      this._velocity = 0;
      this._isAnimating = false;
    }
    
    _setVelocity(value) {
      this._velocity = Number(value);
      this._isAnimating = true;
    }
    
    _addToVelocity(value) {
      this._velocity += Number(value);
      this._isAnimating = true;
    }
    
    _isSpringAnimating() {
      return this._isAnimating;
    }
    
    _hasReachedTarget() {
      return !this._isAnimating && 
             Math.abs(this._currentValue - this._toValue) < this._precision;
    }
    
    _getValue() {
      return this._currentValue;
    }
    
    _getFromValue() {
      return this._fromValue;
    }
    
    _getToValue() {
      return this._toValue;
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
    
    _getMass() {
      return this._mass;
    }

    _saveToJson() {
      return {
        from: this._fromValue,
        to: this._toValue,
        cur: this._currentValue,
        vel: this._velocity,
        stiff: this._stiffness,
        damp: this._damping,
        mass: this._mass,
        prec: this._precision,
        anim: this._isAnimating
      };
    }

    _loadFromJson(o) {
      this._fromValue = o.from || 0;
      this._toValue = o.to || 0;
      this._currentValue = o.cur || 0;
      this._velocity = o.vel || 0;
      this._stiffness = o.stiff || 0.15;
      this._damping = o.damp || 0.8;
      this._mass = o.mass || 1.0;
      this._precision = o.prec || 0.01;
      this._isAnimating = o.anim || false;
    }
    
    _getDebuggerProperties() {
      const prefix = "Simple Spring";
      return [{
        title: "$" + this.behaviorType.name,
        properties: [
          { name: "$isAnimating", value: this._isAnimating },
          // { name: "$fromValue", value: this._fromValue, onedit: v => this._fromValue = v },
          // { name: "$toValue", value: this._toValue, onedit: v => this._toValue = v },
          // { name: "$displacement", value: this.displacement, onedit: v => this.displacement = v },
          // { name: "$springForce", value: this.springforce, onedit: v => this.springforce = v },
          { name: "$currentValue", value: this._currentValue, onedit: v => this._currentValue = v },
          { name: "$velocity", value: this._velocity, onedit: v => this._velocity = v },
          { name: "$stiffness", value: this._stiffness, onedit: v => this._stiffness = v },
          { name: "$damping", value: this._damping, onedit: v => this._damping = v },
        ]
      }];
    }
  };
}
