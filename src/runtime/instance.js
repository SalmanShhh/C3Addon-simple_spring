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

      // Always spring to target if enabled — wake up only when not settled
      if (this._alwaysSpringEnabled && !this._isAnimating) {
        const dist = Math.abs(this._to - this._value);
        const speed = Math.abs(this._velocity);
        if (dist >= this._precision || speed >= this._precision) {
          this._isAnimating = true;
        }
      }

      const dt = Math.min(this.instance.runtime.dt, 0.067); // Cap at ~15fps

      if (this._isAnimating) {
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

      if (this._meshEnabled && (this._meshAnimating || this._meshSwayEnabled)) {
        this._tickMesh(dt);
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
        return Math.max(0, Math.min(6, Math.floor(preset)));
      }

      if (typeof preset === "string") {
        const normalized = preset.trim().toLowerCase().replace(/[-\s]+/g, "_");

        // Numeric strings from some combo pipelines: "0", "1", ...
        const asNumber = Number(normalized);
        if (Number.isFinite(asNumber)) {
          return Math.max(0, Math.min(6, Math.floor(asNumber)));
        }

        const presetMap = {
          hit_impact: 0,
          heavy_slam: 1,
          sword_trail: 2,
          wind_gust: 3,
          electric_stun: 4,
          portal_spawn: 5,
          ui_pop: 6,
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
        alwaysMode: this._alwaysSpringMode,
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

      this._meshEnabled = !!o.meshEnabled;
      this._meshAnimating = !!o.meshAnimating;
      this._meshCols = Math.max(0, Math.floor(Number(o.meshCols) || 0));
      this._meshRows = Math.max(0, Math.floor(Number(o.meshRows) || 0));
      this._meshStiffness = Math.max(0.001, Number(o.meshStiff) || this._stiffness);
      this._meshDamping = Math.max(0, Math.min(1, Number(o.meshDamp) || this._damping));
      this._meshPrecision = Math.max(0.0001, Number(o.meshPrec) || this._precision);
      this._meshEnergy = Math.max(0, Number(o.meshEnergy) || 0);
      this._meshAutoGridCols = Math.max(2, Math.min(32, Math.floor(Number(o.meshAutoGridCols) || 5)));
      this._meshAutoGridRows = Math.max(2, Math.min(32, Math.floor(Number(o.meshAutoGridRows) || 5)));
      this._meshSwayEnabled = !!o.meshSwayEnabled;
      this._meshSwayAngle = Number(o.meshSwayAngle) || 0;
      this._meshSwayStrength = Number(o.meshSwayStrength) || 0.08;
      this._meshSwayWavelength = Math.max(0.0001, Number(o.meshSwayWavelength) || 0.5);
      this._meshSwaySpeed = Number(o.meshSwaySpeed) || 1;
      this._meshSwayPhase = Number(o.meshSwayPhase) || 0;

      if (Array.isArray(o.meshPoints)) {
        this._meshPoints = o.meshPoints.map((p) => ({
          x: Number(p?.x) || 0,
          y: Number(p?.y) || 0,
          vx: Number(p?.vx) || 0,
          vy: Number(p?.vy) || 0,
        }));
      } else {
        this._meshPoints = [];
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

    _getDebuggerProperties() {
      return [
        {
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
