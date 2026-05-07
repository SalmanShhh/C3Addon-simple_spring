import { id, addonType, name } from "../../config.caw.js";
import AddonTypeMap from "../../template/addonTypeMap.js";

export default function (parentClass) {
  return class extends parentClass {
    // Initialize runtime spring state, trigger bookkeeping, and mesh effect state.
    constructor() {
      super();
      const props = this._getInitProperties() || [];

      this._defaultSpringId = "default";
      this._lastTriggeredSpringId = this._defaultSpringId;
      this._lastCompletedSpringId = this._defaultSpringId;
      this._lastStartedSpringId = this._defaultSpringId;
      this._lastStoppedSpringId = this._defaultSpringId;
      this._springs = new Map();
      this._colourSpringSpaces = new Map();
      this._autoApplyColourSpringIds = new Set();
      this._autoApplyTransformPositionSpringIds = new Set();
      this._autoApplyTransformSizeSpringIds = new Set();
      this._autoApplyTransformAngleSpringIds = new Set();
      this._springActionQueueById = new Map();
      this._springCompletionWaiters = new Map();
      // Track only springs that still need per-tick attention.
      this._activeSpringIds = new Set();
      // Cache the last successful target + method + signature per apply path.
      this._applyMethodCache = {
        colour: null,
        positionXY: null,
        positionXYZ: null,
        sizeWH: null,
        sizeWHD: null,
        angle: null,
      };

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
      this._setTicking2(true);
    }

    _isSpringIdAnimating(id) {
      const spring = this._getSpring(id, false);
      return !!spring && spring.isAnimating;
    }

    // Resolve once all related springs for the requested public spring id are done animating.
    _waitForSpringCompletion(springId) {
      const normalizedId = this._normalizeSpringId(springId);
      const relatedIds = this._getRelatedSpringIds(normalizedId);
      const activeRelatedIds = relatedIds.filter((id) => this._isSpringIdAnimating(id));

      if (!activeRelatedIds.length) {
        return Promise.resolve();
      }

      return Promise.all(activeRelatedIds.map((id) => {
        return new Promise((resolve) => {
          const waiters = this._springCompletionWaiters.get(id) || new Set();
          waiters.add(resolve);
          this._springCompletionWaiters.set(id, waiters);
        });
      }));
    }

    // Flush all queued completion promises for a spring that has just finished.
    _resolveSpringCompletionWaiters(springId) {
      const normalizedId = this._normalizeSpringId(springId);
      const waiters = this._springCompletionWaiters.get(normalizedId);
      if (!waiters) {
        return;
      }

      this._springCompletionWaiters.delete(normalizedId);
      for (const resolve of waiters) {
        resolve();
      }
    }

    // Optionally serialize spring actions so each one waits for all related spring channels to settle.
    async _runSpringActionWithOptionalWait(springId, waitForPreviousActions, startFn) {
      const normalizedId = this._normalizeSpringId(springId);

      if (!waitForPreviousActions) {
        startFn();
        return;
      }

      const previous = this._springActionQueueById.get(normalizedId) || Promise.resolve();

      const run = (async () => {
        await previous.catch(() => {});
        startFn();
        await this._waitForSpringCompletion(normalizedId);
      })();

      this._springActionQueueById.set(normalizedId, run);

      try {
        await run;
      } finally {
        if (this._springActionQueueById.get(normalizedId) === run) {
          this._springActionQueueById.delete(normalizedId);
        }
      }
    }

    // Main per-frame update for non-constant springs and their auto-applied outputs.
    _tick() {
      if (!this._isEnabled) return;

      const dt = Math.min(this.instance.runtime.dt, 0.067); // Cap at ~15fps

      // Tick only active springs to avoid scanning every known spring each frame.
      for (const springId of this._activeSpringIds) {
        const spring = this._getSpring(springId, false);
        if (!spring) {
          this._activeSpringIds.delete(springId);
          continue;
        }
        if (spring.alwaysSpringEnabled) continue; // Constant springs are ticked in _tick2
        this._tickSpring(spring, dt);
        this._refreshSpringActiveState(spring);
      }

      const activeColourSpringId = this._getSingleActiveSpringId(this._autoApplyColourSpringIds);
      if (activeColourSpringId && !this._getSpring(this._colourSpringChannelId(activeColourSpringId, "r"), false)?.alwaysSpringEnabled) {
        this._applySprungColourToObject(activeColourSpringId);
      }

      const activePositionSpringId = this._getSingleActiveSpringId(this._autoApplyTransformPositionSpringIds);
      if (activePositionSpringId && !this._getSpring(this._transformSpringChannelId("position", activePositionSpringId, "x"), false)?.alwaysSpringEnabled) {
        this._applySprungPositionToObject(activePositionSpringId);
      }

      const activeSizeSpringId = this._getSingleActiveSpringId(this._autoApplyTransformSizeSpringIds);
      if (activeSizeSpringId && !this._getSpring(this._transformSpringChannelId("size", activeSizeSpringId, "w"), false)?.alwaysSpringEnabled) {
        this._applySprungSizeToObject(activeSizeSpringId);
      }

      const activeAngleSpringId = this._getSingleActiveSpringId(this._autoApplyTransformAngleSpringIds);
      if (activeAngleSpringId && !this._getSpring(this._transformSpringChannelId("angle", activeAngleSpringId, "a"), false)?.alwaysSpringEnabled) {
        this._applySprungAngleToObject(activeAngleSpringId);
      }

      if (this._meshEnabled && (this._meshAnimating || this._meshSwayEnabled)) {
        this._tickMesh(dt);
      }
    }

    // Post-event tick for constant springs so event-sheet property changes are seen first.
    _tick2() {
      if (!this._isEnabled) return;

      const dt = Math.min(this.instance.runtime.dt, 0.067);

      // Before ticking constant springs, resync each constant auto-apply spring from the
      // current object value. This picks up property changes made during events or _tick().
      const activeSizeId = this._getSingleActiveSpringId(this._autoApplyTransformSizeSpringIds);
      const isSizeConstant = activeSizeId
        ? !!this._getSpring(this._transformSpringChannelId("size", activeSizeId, "w"), false)?.alwaysSpringEnabled
        : false;
      if (isSizeConstant) {
        const current = this._getTransformCurrentValues("size");
        this._forEachTransformChannel("size", activeSizeId, (channelId, _ch, index) => {
          this._syncSpringToCurrentValueIfDrifted(channelId, current[index], 0.5, true);
        });
      }

      const activePositionId = this._getSingleActiveSpringId(this._autoApplyTransformPositionSpringIds);
      const isPositionConstant = activePositionId
        ? !!this._getSpring(this._transformSpringChannelId("position", activePositionId, "x"), false)?.alwaysSpringEnabled
        : false;
      if (isPositionConstant) {
        const current = this._getTransformCurrentValues("position");
        this._forEachTransformChannel("position", activePositionId, (channelId, _ch, index) => {
          this._syncSpringToCurrentValueIfDrifted(channelId, current[index]);
        });
      }

      const activeAngleId = this._getSingleActiveSpringId(this._autoApplyTransformAngleSpringIds);
      const isAngleConstant = activeAngleId
        ? !!this._getSpring(this._transformSpringChannelId("angle", activeAngleId, "a"), false)?.alwaysSpringEnabled
        : false;
      if (isAngleConstant) {
        const current = this._getTransformCurrentValues("angle");
        this._forEachTransformChannel("angle", activeAngleId, (channelId, _ch, index) => {
          this._syncAngleSpringToCurrentValueIfDrifted(channelId, current[index], 0.5, true);
        });
      }

      const activeColourId = this._getSingleActiveSpringId(this._autoApplyColourSpringIds);
      const isColourConstant = activeColourId
        ? !!this._getSpring(this._colourSpringChannelId(activeColourId, "r"), false)?.alwaysSpringEnabled
        : false;
      if (isColourConstant) {
        const currentColour = this._getObjectColourRgb255();
        this._forEachColourChannel(activeColourId, (channelId, _ch, index) => {
          this._syncSpringToCurrentValueIfDrifted(channelId, currentColour[index], 0.5, true);
        });
      }

      // Tick constant springs
      for (const springId of this._activeSpringIds) {
        const spring = this._getSpring(springId, false);
        if (!spring || !spring.alwaysSpringEnabled) continue;
        this._tickSpring(spring, dt);
        this._refreshSpringActiveState(spring);
      }

      // Apply constant auto-apply springs with updated values
      if (isSizeConstant) this._applySprungSizeToObject(activeSizeId);
      if (isPositionConstant) this._applySprungPositionToObject(activePositionId);
      if (isAngleConstant) this._applySprungAngleToObject(activeAngleId);
      if (isColourConstant) this._applySprungColourToObject(activeColourId);
    }

    // Create one scalar spring channel with the current global defaults.
    _createSpring(id) {
      const springId = this._normalizeSpringId(id);
      const spring = {
        id: springId,
        from: 0,
        to: 0,
        value: 0,
        velocity: 0,
        isAnimating: false,
        isPaused: false,
        smoothValue: 0,
        time: 0,
        steps: 0,
        prevValue: 0,
        alwaysSpringEnabled: false,
        alwaysSpringMode: 0,
        pendingReachedAfterStart: false,
        stiffness: this._stiffness,
        damping: this._damping,
        precision: this._precision,
      };

      this._springs.set(springId, spring);
      this._refreshSpringActiveState(spring);
      return spring;
    }

    _isSpringActiveForTick(spring) {
      // Paused springs stay tracked so they can resume without a full map scan.
      return !!spring && (spring.isAnimating || spring.isPaused || spring.alwaysSpringEnabled);
    }

    _refreshSpringActiveState(spring) {
      if (!spring) return;
      if (this._isSpringActiveForTick(spring)) {
        this._activeSpringIds.add(spring.id);
      } else {
        this._activeSpringIds.delete(spring.id);
      }
    }

    _rebuildActiveSpringIds() {
      // Rebuild after bulk state restores like save/load.
      this._activeSpringIds.clear();
      for (const spring of this._springs.values()) {
        this._refreshSpringActiveState(spring);
      }
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
      this._colourSpringSpaces.delete(springId);
      if (springId === this._defaultSpringId) {
        const spring = this._getSpring(springId, true);
        this._resetSpringState(spring, 0);
        this._resolveSpringCompletionWaiters(springId);
        spring.from = 0;
        spring.to = 0;
        spring.alwaysSpringEnabled = false;
        spring.alwaysSpringMode = 0;
        spring.stiffness = this._stiffness;
        spring.damping = this._damping;
        spring.precision = this._precision;
        this._refreshSpringActiveState(spring);
        return false;
      }
      this._resolveSpringCompletionWaiters(springId);
      this._activeSpringIds.delete(springId);
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
      spring.pendingReachedAfterStart = false;
      this._refreshSpringActiveState(spring);
    }

    // Snap a spring to its target and release any completion waiters.
    _finishSpring(spring) {
      spring.value = spring.to;
      spring.smoothValue = spring.to;
      spring.velocity = 0;
      spring.isAnimating = false;
      spring.time = 0;
      spring.steps = 0;
      this._refreshSpringActiveState(spring);
      this._resolveSpringCompletionWaiters(spring.id);
    }

    // Advance one fixed spring simulation step, including shortest-path angle motion when enabled.
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

    // Measure remaining distance to the target, using wrap-aware distance for angle springs.
    _getSpringTargetDistance(spring) {
      if (!spring) {
        return 0;
      }

      if (spring.alwaysSpringMode === 1) {
        let diff = spring.to - spring.value;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        return Math.abs(diff);
      }

      return Math.abs(spring.to - spring.value);
    }

    // Collapse internal channel springs back to one public spring id so Colour/Position/Size
    // only fire a single reached-target trigger once the whole grouped spring has settled.
    _getGroupedSpringTriggerInfo(springId) {
      const normalizedId = this._normalizeSpringId(springId);

      if (normalizedId.startsWith("__colour__:")) {
        const parts = normalizedId.split(":");
        const publicId = this._normalizeSpringId(parts[1]);
        const leaderId = this._colourSpringChannelId(publicId, "r");
        const memberIds = [
          this._colourSpringChannelId(publicId, "r"),
          this._colourSpringChannelId(publicId, "g"),
          this._colourSpringChannelId(publicId, "b"),
        ];
        return {
          publicId,
          isGrouped: true,
          leaderId,
          memberIds,
          isLeader: normalizedId === leaderId,
          hasReachedTarget: this._hasColourSpringReachedTargetId(publicId),
        };
      }

      if (normalizedId.startsWith("__transform__:")) {
        const parts = normalizedId.split(":");
        const transformType = this._normalizeTransformSpringType(parts[1]);
        const publicId = this._normalizeSpringId(parts[2]);
        const leaderChannel = this._getTransformChannels(transformType)[0] || "";
        const leaderId = this._transformSpringChannelId(transformType, publicId, leaderChannel);
        const memberIds = this._getTransformChannels(transformType).map((channel) =>
          this._transformSpringChannelId(transformType, publicId, channel)
        );
        return {
          publicId,
          isGrouped: true,
          leaderId,
          memberIds,
          isLeader: normalizedId === leaderId,
          hasReachedTarget: this._hasTransformSpringReachedTargetId(transformType, publicId),
        };
      }

      return {
        publicId: this._toPublicSpringId(normalizedId),
        isGrouped: false,
        leaderId: normalizedId,
        memberIds: [normalizedId],
        isLeader: true,
        hasReachedTarget: this._hasSpringReachedTarget(normalizedId),
      };
    }

    _setPendingReachedAfterStartForGroupedSpring(info, pending) {
      if (!info || !Array.isArray(info.memberIds)) {
        return;
      }

      for (const memberId of info.memberIds) {
        const memberSpring = this._getSpring(memberId, false);
        if (memberSpring) {
          memberSpring.pendingReachedAfterStart = !!pending;
        }
      }
    }

    _hasPendingReachedAfterStartForGroupedSpring(info) {
      if (!info || !Array.isArray(info.memberIds)) {
        return false;
      }

      for (const memberId of info.memberIds) {
        const memberSpring = this._getSpring(memberId, false);
        if (memberSpring && memberSpring.pendingReachedAfterStart) {
          return true;
        }
      }

      return false;
    }

    // Grouped springs should emit reached once when the whole group has settled,
    // regardless of which internal channel happened to finish last.
    _shouldTriggerReachedForSpringId(springId) {
      const info = this._getGroupedSpringTriggerInfo(springId);
      if (info.isGrouped) {
        return info.hasReachedTarget && this._hasPendingReachedAfterStartForGroupedSpring(info);
      }

      return info.isLeader && info.hasReachedTarget;
    }

    // Tick a single spring, auto-resume constant springs, and emit start/reached events on state changes.
    _tickSpring(spring, dt) {
      if (spring.isPaused) {
        return;
      }

      if (spring.alwaysSpringEnabled && !spring.isAnimating) {
        const dist = Math.abs(spring.to - spring.value);
        const speed = Math.abs(spring.velocity);
        if (dist >= spring.precision || speed >= spring.precision) {
          spring.isAnimating = true;
          this._lastStartedSpringId = this._toPublicSpringId(spring.id);
          this._triggerSpringEvent("OnStarted", "OnSpringStarted", spring.id);
        }
      }

      if (!spring.isAnimating) {
        return;
      }

      spring.time += dt;

      const time60 = spring.time * 60;
      const targetSteps = Math.floor(time60);
      while (spring.steps < targetSteps) {
        spring.prevValue = spring.value;
        this._stepSpringPhysics(spring);
        spring.steps++;
      }

      const t = time60 - spring.steps;
      spring.smoothValue = spring.prevValue + (spring.value - spring.prevValue) * t;

      const dist = this._getSpringTargetDistance(spring);
      const speed = Math.abs(spring.velocity);

      if (dist < spring.precision && speed < spring.precision) {
        this._finishSpring(spring);
        // Multi-channel springs finish per channel, but the public trigger should still fire once.
        if (this._shouldTriggerReachedForSpringId(spring.id)) {
          const info = this._getGroupedSpringTriggerInfo(spring.id);
          this._lastCompletedSpringId = info.publicId;
          this._triggerSpringEvent("OnReachedTarget", "OnSpringReachedTarget", info.leaderId);
        }
      }

      if (!isFinite(spring.value)) {
        this._finishSpring(spring);
      }
    }

    // Fire a named CAW trigger through both the local event bus and Construct runtime.
    _trigger(method) {
      this.dispatch(method);
      super._trigger(self.C3[AddonTypeMap[addonType]][id].Cnds[method]);
    }

    // Update spring-event bookkeeping before firing the legacy and Multi Spring trigger conditions.
    _triggerSpringEvent(legacyMethod, multiMethod, springId) {
      const info = this._getGroupedSpringTriggerInfo(springId);

      // Grouped springs (colour/position/size) run multiple channels, but should fire lifecycle
      // triggers once per public spring id, so only the leader channel dispatches them.
      if (info.isGrouped && !info.isLeader) {
        return;
      }

      if (multiMethod === "OnSpringStarted") {
        if (info.isGrouped) {
          this._setPendingReachedAfterStartForGroupedSpring(info, true);
        } else {
          const spring = this._getSpring(springId, false);
          if (spring) {
            spring.pendingReachedAfterStart = true;
          }
        }
      } else if (multiMethod === "OnSpringReachedTarget") {
        if (info.isGrouped) {
          this._setPendingReachedAfterStartForGroupedSpring(info, false);
        } else {
          const spring = this._getSpring(springId, false);
          if (spring) {
            spring.pendingReachedAfterStart = false;
          }
        }
      }

      this._lastTriggeredSpringId = this._toPublicSpringId(springId);
      this._trigger(legacyMethod);
      this._trigger(multiMethod);
    }

    // Guarantee a reached-target trigger after an explicitly stopped or snapped spring that had started.
    _triggerReachedIfPendingAfterStart(spring) {
      if (!spring) {
        return;
      }

      const info = this._getGroupedSpringTriggerInfo(spring.id);

      if (info.isGrouped) {
        if (!this._hasPendingReachedAfterStartForGroupedSpring(info) || !info.hasReachedTarget) {
          return;
        }

        this._lastCompletedSpringId = info.publicId;
        this._triggerSpringEvent("OnReachedTarget", "OnSpringReachedTarget", info.leaderId);
        return;
      }

      if (!spring.pendingReachedAfterStart) {
        return;
      }

      if (!this._shouldTriggerReachedForSpringId(spring.id)) {
        return;
      }

      this._lastCompletedSpringId = this._toPublicSpringId(spring.id);
      this._triggerSpringEvent("OnReachedTarget", "OnSpringReachedTarget", spring.id);
    }

    on(tag, callback, options) {
      if (!this.events[tag]) {
        this.events[tag] = [];
      }
      this.events[tag].push({ callback, options });
    }

    // Remove a specific event callback for a tag.
    off(tag, callback) {
      if (this.events[tag]) {
        this.events[tag] = this.events[tag].filter(
          (event) => event.callback !== callback
        );
      }
    }

    // Dispatch local callbacks and honor optional condition params/once semantics.
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

  // Start (or restart) a spring from explicit from/to values.
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
      spring.isPaused = false;
      spring.isAnimating = true;
      this._refreshSpringActiveState(spring);

      if (!wasAnimating) {
        this._lastStartedSpringId = this._toPublicSpringId(spring.id);
        this._triggerSpringEvent("OnStarted", "OnSpringStarted", spring.id);
      }
    }

    _springFromTo(from, to) {
      this._springFromToId(this._defaultSpringId, from, to);
    }

    // Spring from current value toward a target, with optional shortest-path angle mode.
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
      spring.isPaused = false;
      spring.isAnimating = true;
      this._refreshSpringActiveState(spring);

      if (!wasAnimating) {
        this._lastStartedSpringId = this._toPublicSpringId(spring.id);
        this._triggerSpringEvent("OnStarted", "OnSpringStarted", spring.id);
      }
    }

    _springTo(to, mode) {
      this._springToId(this._defaultSpringId, to, mode);
    }

    // Angle-specific start that normalizes to 0..360 and chooses shortest direction.
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

      spring.from = from;
      spring.to = spring.value + diff;
      spring.isPaused = false;
      spring.isAnimating = true;
      this._refreshSpringActiveState(spring);

      if (!wasAnimating) {
        this._lastStartedSpringId = this._toPublicSpringId(spring.id);
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

    _simulateSpringSettleDuration(stiffness, damping, precision, maxSeconds = 10) {
      const target = 1;
      let value = 0;
      let velocity = 0;
      let maxOvershoot = 0;
      const maxSteps = Math.max(1, Math.ceil(maxSeconds * 60));

      for (let step = 1; step <= maxSteps; step++) {
        const displacement = target - value;
        velocity += displacement * stiffness;
        velocity *= damping;
        value += velocity;

        if (value > target) {
          maxOvershoot = Math.max(maxOvershoot, value - target);
        }

        const dist = Math.abs(target - value);
        const speed = Math.abs(velocity);
        if (dist < precision && speed < precision) {
          return { duration: step / 60, overshoot: maxOvershoot };
        }
      }

      return { duration: maxSteps / 60, overshoot: maxOvershoot };
    }

    _parseDurationBounceProfile(profile) {
      if (typeof profile === "string") {
        const value = profile.trim().toLowerCase();
        if (value === "0" || value === "minimal" || value === "no_bounce") return 0;
        if (value === "1" || value === "balanced") return 1;
        if (value === "2" || value === "bouncy") return 2;
        if (value === "3" || value === "very_bouncy") return 3;
      }

      const n = Math.floor(Number(profile));
      if (!Number.isFinite(n)) return 1;
      return Math.max(0, Math.min(3, n));
    }

    // Search for stiffness/damping values that best match a requested settle duration and bounce profile.
    _findSpringSettingsForDuration(durationSeconds, precision = this._precision, bounceProfile = 1) {
      const targetDuration = Math.max(1 / 60, Number(durationSeconds) || 0);
      const targetPrecision = Math.max(0.0001, Math.min(1, Number(precision) || this._precision));
      const profile = this._parseDurationBounceProfile(bounceProfile);
      const dampingCandidatesByProfile = {
        0: [0.82, 0.86, 0.9, 0.92, 0.94, 0.96, 0.97, 0.98, 0.99],
        1: [0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.84, 0.88, 0.9, 0.92, 0.94, 0.96, 0.97, 0.98],
        2: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.84],
        3: [0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7],
      };
      const dampingCandidates = dampingCandidatesByProfile[profile] || dampingCandidatesByProfile[1];

      const profileTuning = {
        0: { overshootTarget: 0.0, overshootWeight: 3.0 },
        1: { overshootTarget: 0.06, overshootWeight: 1.0 },
        2: { overshootTarget: 0.16, overshootWeight: 0.6 },
        3: { overshootTarget: 0.3, overshootWeight: 0.3 },
      }[profile] || { overshootTarget: 0.06, overshootWeight: 1.0 };

      let best = {
        stiffness: 1.25,
        damping: 0.9,
        precision: targetPrecision,
        score: Infinity,
        error: Infinity,
        overshoot: Infinity,
      };

      for (const damping of dampingCandidates) {
        let low = 0.001;
        let high = 0.001;
        let highResult = this._simulateSpringSettleDuration(high, damping, targetPrecision, Math.max(10, targetDuration * 4));

        while (highResult.duration > targetDuration && high < 100) {
          low = high;
          high *= 2;
          highResult = this._simulateSpringSettleDuration(high, damping, targetPrecision, Math.max(10, targetDuration * 4));
        }

        let lowBound = 0.001;
        let highBound = high;
        for (let i = 0; i < 18; i++) {
          const mid = (lowBound + highBound) / 2;
          const result = this._simulateSpringSettleDuration(mid, damping, targetPrecision, Math.max(10, targetDuration * 4));
          if (result.duration > targetDuration) {
            lowBound = mid;
          } else {
            highBound = mid;
          }
        }

        const candidateStiffnesses = [lowBound, highBound, high];
        for (const stiffness of candidateStiffnesses) {
          const result = this._simulateSpringSettleDuration(stiffness, damping, targetPrecision, Math.max(10, targetDuration * 4));
          const error = Math.abs(result.duration - targetDuration);
          const overshootError = Math.abs(result.overshoot - profileTuning.overshootTarget);
          const score = error + (overshootError * profileTuning.overshootWeight);

          if (score < best.score || (score === best.score && error < best.error)) {
            best = {
              stiffness,
              damping,
              precision: targetPrecision,
              score,
              error,
              overshoot: result.overshoot,
            };
          }
        }
      }

      return {
        stiffness: best.stiffness,
        damping: best.damping,
        precision: best.precision,
      };
    }

    _setSpringSettingsFromDurationId(id, durationSeconds, precision = this._precision, bounceProfile = 1) {
      const settings = this._findSpringSettingsForDuration(durationSeconds, precision, bounceProfile);
      this._setStiffness(settings.stiffness, id);
      this._setDamping(settings.damping, id);
      this._setPrecision(settings.precision, id);
    }

    _setEnabled(v) {
      this._isEnabled = !!v;
    }

    // Stop and pin a spring at its current value, then emit stop (+ optional pending reached) triggers.
    _stopAtCurrentValueId(id) {
      const spring = this._getSpring(id, false);
      if (!spring) return;

      spring.to = spring.value;
      spring.smoothValue = spring.value;
      spring.velocity = 0;
      spring.isPaused = false;
      spring.isAnimating = false;
      spring.time = 0;
      spring.steps = 0;
      this._lastStoppedSpringId = this._toPublicSpringId(spring.id);
      this._refreshSpringActiveState(spring);
      this._resolveSpringCompletionWaiters(spring.id);
      this._triggerSpringEvent("OnStopped", "OnSpringStopped", spring.id);
      this._triggerReachedIfPendingAfterStart(spring);
    }

    // Return all ids linked to a public spring id (main + colour + transform channels).
    _getRelatedSpringIds(id) {
      const springId = this._normalizeSpringId(id);
      return [
        springId,
        this._colourSpringChannelId(springId, "r"),
        this._colourSpringChannelId(springId, "g"),
        this._colourSpringChannelId(springId, "b"),
        this._transformSpringChannelId("position", springId, "x"),
        this._transformSpringChannelId("position", springId, "y"),
        this._transformSpringChannelId("position", springId, "z"),
        this._transformSpringChannelId("size", springId, "w"),
        this._transformSpringChannelId("size", springId, "h"),
        this._transformSpringChannelId("size", springId, "d"),
        this._transformSpringChannelId("angle", springId, "a"),
      ];
    }

    _pauseSpringById(id) {
      for (const relatedId of this._getRelatedSpringIds(id)) {
        const spring = this._getSpring(relatedId, false);
        if (!spring) continue;
        spring.isPaused = true;
        this._refreshSpringActiveState(spring);
      }
    }

    _resumeSpringById(id) {
      for (const relatedId of this._getRelatedSpringIds(id)) {
        const spring = this._getSpring(relatedId, false);
        if (!spring) continue;
        spring.isPaused = false;
        this._refreshSpringActiveState(spring);
      }
    }

    _pauseAllSprings() {
      for (const spring of this._springs.values()) {
        spring.isPaused = true;
        this._refreshSpringActiveState(spring);
      }
    }

    _resumeAllSprings() {
      for (const spring of this._springs.values()) {
        spring.isPaused = false;
        this._refreshSpringActiveState(spring);
      }
    }

    // Remove one public spring id and all its internal channel springs.
    _clearSpringById(id) {
      const springId = this._normalizeSpringId(id);
      this._colourSpringSpaces.delete(springId);

      this._autoApplyColourSpringIds.delete(springId);
      this._autoApplyTransformPositionSpringIds.delete(springId);
      this._autoApplyTransformSizeSpringIds.delete(springId);
      this._autoApplyTransformAngleSpringIds.delete(springId);

      for (const relatedId of this._getRelatedSpringIds(springId)) {
        this._removeSpring(relatedId);
      }
    }

    // Remove all springs, auto-apply ownership, and queued async waiters.
    _clearAllSprings() {
      const ids = Array.from(this._springs.keys());
      for (const id of ids) {
        this._removeSpring(id);
      }

      this._autoApplyColourSpringIds.clear();
      this._colourSpringSpaces.clear();
      this._autoApplyTransformPositionSpringIds.clear();
      this._autoApplyTransformSizeSpringIds.clear();
      this._autoApplyTransformAngleSpringIds.clear();
      this._springActionQueueById.clear();
      this._springCompletionWaiters.clear();
      this._activeSpringIds.clear();
    }

    _stopAtCurrentValue() {
      this._stopAtCurrentValueId(this._defaultSpringId);
    }

    // Snap immediately to the current target and emit stop/reached trigger flow.
    _snapToTargetId(id) {
      const spring = this._getSpring(id, false);
      if (!spring) return;

      this._finishSpring(spring);
      this._lastStoppedSpringId = this._toPublicSpringId(spring.id);
      this._triggerSpringEvent("OnStopped", "OnSpringStopped", spring.id);
      this._triggerReachedIfPendingAfterStart(spring);
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
      this._refreshSpringActiveState(spring);
      this._resolveSpringCompletionWaiters(spring.id);
    }

    _resetToValue(v) {
      this._resetToValueId(this._defaultSpringId, v);
    }

    _setVelocityId(id, v) {
      const spring = this._getSpring(id, true);
      spring.velocity = Number(v);
      spring.isAnimating = true;
      this._refreshSpringActiveState(spring);
    }

    _setVelocity(v) {
      this._setVelocityId(this._defaultSpringId, v);
    }

    _addToVelocityId(id, v) {
      const spring = this._getSpring(id, true);
      spring.velocity += Number(v);
      spring.isAnimating = true;
      this._refreshSpringActiveState(spring);
    }

    _addToVelocity(v) {
      this._addToVelocityId(this._defaultSpringId, v);
    }

    _setAlwaysSpringId(id, enabled, target, mode) {
      const spring = this._getSpring(id, true);
      spring.alwaysSpringEnabled = !!enabled;
      spring.to = Number(target);
      spring.alwaysSpringMode = Number(mode) || 0;

      if (spring.alwaysSpringEnabled) {
        const dist = Math.abs(spring.to - spring.value);
        const speed = Math.abs(spring.velocity);
        if (dist >= spring.precision || speed >= spring.precision) {
          spring.isAnimating = true;
        }
      }

      this._refreshSpringActiveState(spring);
    }

    _setAlwaysSpring(enabled, target, mode) {
      this._setAlwaysSpringId(this._defaultSpringId, enabled, target, mode);
    }

    // Configure or update a scalar "constant spring" channel behavior.
    _configureAlwaysSpringValueId(id, operation, target, mode = 0, initialValue = 0) {
      const normalizedOperation = Number(operation) || 0;
      if (!this._getSpring(id, false)) {
        this._resetToValueId(id, initialValue);
      }

      const spring = this._getSpring(id, true);
      spring.to = Number(target);

      if (normalizedOperation === 2) {
        if (spring.alwaysSpringEnabled) {
          spring.isAnimating = true;
        }
        this._refreshSpringActiveState(spring);
        return;
      }

      spring.alwaysSpringEnabled = normalizedOperation === 0;
      spring.alwaysSpringMode = Number(mode) || 0;

      if (spring.alwaysSpringEnabled) {
        const dist = Math.abs(spring.to - spring.value);
        const speed = Math.abs(spring.velocity);
        if (dist >= spring.precision || speed >= spring.precision) {
          spring.isAnimating = true;
        }
      }
      this._refreshSpringActiveState(spring);
    }

    // Realign a spring to an externally changed value to prevent fighting manual property edits.
    _syncSpringToCurrentValueIfDrifted(id, currentValue, tolerance = 0.001, preserveVelocity = false) {
      const spring = this._getSpring(id, false);
      if (!spring) return;

      const current = Number(currentValue);
      if (!Number.isFinite(current)) return;

      const effectiveTolerance = Math.max(Number(tolerance) || 0, spring.precision || 0);
      if (Math.abs(spring.smoothValue - current) <= effectiveTolerance) {
        return;
      }

      spring.from = current;
      spring.value = current;
      spring.prevValue = current;
      spring.smoothValue = current;
      if (!preserveVelocity) {
        spring.velocity = 0;
      }
      spring.time = 0;
      spring.steps = 0;
    }

    // Resync an angle spring from the current object angle while preserving wrap-around continuity.
    _syncAngleSpringToCurrentValueIfDrifted(id, currentAngle, tolerance = 0.5, preserveVelocity = true) {
      const spring = this._getSpring(id, false);
      if (!spring) return;

      const current = Number(currentAngle);
      if (!Number.isFinite(current)) return;

      let diff = current - spring.smoothValue;
      while (diff > 180) diff -= 360;
      while (diff < -180) diff += 360;

      const effectiveTolerance = Math.max(Number(tolerance) || 0, spring.precision || 0);
      if (Math.abs(diff) <= effectiveTolerance) {
        return;
      }

      spring.from = current;
      spring.value = current;
      spring.prevValue = current;
      spring.smoothValue = current;
      if (!preserveVelocity) {
        spring.velocity = 0;
      }
      spring.time = 0;
      spring.steps = 0;
    }

    _setAlwaysSpringTargetId(id, target) {
      const spring = this._getSpring(id, true);
      spring.to = Number(target);
      if (spring.alwaysSpringEnabled) {
        spring.isAnimating = true;
      }
      this._refreshSpringActiveState(spring);
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

    _setColourSpringSpaceId(id, colourSpace) {
      const springId = this._normalizeSpringId(id);
      const parsedSpace = this._parseColourSpace(colourSpace);
      this._colourSpringSpaces.set(springId, parsedSpace);
      return parsedSpace;
    }

    _getColourSpace(id) {
      const springId = this._normalizeSpringId(id);
      return this._colourSpringSpaces.get(springId) || "rgb";
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

    // Shared hue-sector branching used by both HSL and HSV conversions.
    _hueToRgb255Components(hue, c, x, m) {
      let r1 = 0;
      let g1 = 0;
      let b1 = 0;

      if (hue < 60)       { r1 = c; g1 = x; }
      else if (hue < 120) { r1 = x; g1 = c; }
      else if (hue < 180) { g1 = c; b1 = x; }
      else if (hue < 240) { g1 = x; b1 = c; }
      else if (hue < 300) { r1 = x; b1 = c; }
      else                { r1 = c; b1 = x; }

      return [(r1 + m) * 255, (g1 + m) * 255, (b1 + m) * 255];
    }

    _hslToRgb255(h, s, l) {
      const hue = ((Number(h) % 360) + 360) % 360;
      const sat = this._clamp(s, 0, 100) / 100;
      const lit = this._clamp(l, 0, 100) / 100;
      const c = (1 - Math.abs((2 * lit) - 1)) * sat;
      const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
      const m = lit - (c / 2);
      return this._hueToRgb255Components(hue, c, x, m);
    }

    _hsvToRgb255(h, s, v) {
      const hue = ((Number(h) % 360) + 360) % 360;
      const sat = this._clamp(s, 0, 100) / 100;
      const val = this._clamp(v, 0, 100) / 100;
      const c = val * sat;
      const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
      const m = val - c;
      return this._hueToRgb255Components(hue, c, x, m);
    }

    // Convert editor/runtime colour inputs (RGB/HSL/HSV) into RGB 0..255 channels.
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
      this._setExclusiveAutoApplyId(this._autoApplyColourSpringIds, id, enabled);
    }

    _forEachColourChannel(id, callback) {
      const channels = ["r", "g", "b"];
      for (let i = 0; i < channels.length; i++) {
        callback(this._colourSpringChannelId(id, channels[i]), channels[i], i);
      }
    }

    // Keep one active colour auto-apply owner at a time, then optionally apply immediately.
    _finalizeColourSpringApply(id, applyToObject) {
      this._setColourSpringAutoApplyId(id, !!applyToObject);
      if (applyToObject) {
        this._applySprungColourToObject(id);
      }
    }

    _getSingleActiveSpringId(idSet) {
      if (!idSet || !idSet.size) return "";
      // Use the latest inserted id so new applied springs override old ones.
      let activeId = "";
      for (const id of idSet) {
        activeId = id;
      }
      return activeId;
    }

    _normalizeSingleActiveSet(idSet) {
      if (!idSet || idSet.size <= 1) return;
      const activeId = this._getSingleActiveSpringId(idSet);
      idSet.clear();
      if (activeId) {
        idSet.add(activeId);
      }
    }

    // For "Apply to properties", enforce single-owner behavior for a channel group.
    _setExclusiveAutoApplyId(idSet, id, enabled) {
      const springId = this._normalizeSpringId(id);
      if (enabled) {
        // "Apply to properties" always takes ownership for this group.
        idSet.clear();
        idSet.add(springId);
        return;
      }
      idSet.delete(springId);
    }

    // Configure a 3-channel colour spring from current->target values.
    _springColourToId(id, colourSpace, c1, c2, c3, applyToObject = false) {
      this._setColourSpringSpaceId(id, colourSpace);
      const values = this._colourToRgb255(colourSpace, c1, c2, c3);
      this._forEachColourChannel(id, (channelId, _ch, index) => {
        this._springToId(channelId, values[index], 0);
      });
      this._finalizeColourSpringApply(id, applyToObject);
    }

    // Configure a 3-channel colour spring from explicit from/to values.
    _springColourFromToId(id, colourSpace, from1, from2, from3, to1, to2, to3, applyToObject = false) {
      this._setColourSpringSpaceId(id, colourSpace);
      const fromValues = this._colourToRgb255(colourSpace, from1, from2, from3);
      const toValues = this._colourToRgb255(colourSpace, to1, to2, to3);
      this._forEachColourChannel(id, (channelId, _ch, index) => {
        this._springFromToId(channelId, fromValues[index], toValues[index]);
      });
      this._finalizeColourSpringApply(id, applyToObject);
    }

    // Configure constant colour spring behavior per RGB channel.
    _configureColourAlwaysSpringId(id, operation, colourSpace, c1, c2, c3, applyToObject = false) {
      this._setColourSpringSpaceId(id, colourSpace);
      const normalizedOperation = Number(operation) || 0;
      const values = this._colourToRgb255(colourSpace, c1, c2, c3);
      let currentColour = null;
      if (applyToObject) {
        currentColour = this._getObjectColourRgb255();
      }
      this._forEachColourChannel(id, (channelId, _ch, index) => {
        const target = values[index];
        const initialValue = applyToObject && currentColour ? currentColour[index] : (this._getSpringValue(channelId) || target);

        if (applyToObject && normalizedOperation === 0 && currentColour) {
          this._syncSpringToCurrentValueIfDrifted(channelId, currentColour[index]);
        }

        this._configureAlwaysSpringValueId(channelId, normalizedOperation, target, 0, initialValue);
      });
      this._finalizeColourSpringApply(id, applyToObject);
    }

    _setColourSpringSettingsId(id, stiffness, damping, precision) {
      this._forEachColourChannel(id, (channelId) => {
        this._setStiffness(stiffness, channelId);
        this._setDamping(damping, channelId);
        this._setPrecision(precision, channelId);
      });
    }

    _setColourSpringSettingsFromDurationId(id, durationSeconds, precision = this._precision, bounceProfile = 1) {
      const settings = this._findSpringSettingsForDuration(durationSeconds, precision, bounceProfile);
      this._forEachColourChannel(id, (channelId) => {
        this._setStiffness(settings.stiffness, channelId);
        this._setDamping(settings.damping, channelId);
        this._setPrecision(settings.precision, channelId);
      });
    }

    _resetColourSpringId(id, colourSpace, c1, c2, c3, applyToObject = false) {
      this._setColourSpringSpaceId(id, colourSpace);
      const values = this._colourToRgb255(colourSpace, c1, c2, c3);
      this._forEachColourChannel(id, (channelId, _ch, index) => {
        this._resetToValueId(channelId, values[index]);
      });
      this._finalizeColourSpringApply(id, applyToObject);
    }

    _stopColourSpringId(id) {
      this._forEachColourChannel(id, (channelId) => {
        this._stopAtCurrentValueId(channelId);
      });
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
      let isAnimating = false;
      this._forEachColourChannel(id, (channelId) => {
        if (!isAnimating && this._isSpringAnimatingId(channelId)) {
          isAnimating = true;
        }
      });
      return isAnimating;
    }

    _hasColourSpringReachedTargetId(id) {
      let reachedTarget = true;
      this._forEachColourChannel(id, (channelId) => {
        if (reachedTarget && !this._hasSpringReachedTarget(channelId)) {
          reachedTarget = false;
        }
      });
      return reachedTarget;
    }

    _getApplyTargets() {
      return [
        this.instance,
        this.instance && typeof this.instance.GetWorldInfo === "function" ? this.instance.GetWorldInfo() : null,
        this.instance ? this.instance.worldInfo : null,
        this.instance ? this.instance._worldInfo : null,
      ];
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

    _tryApplyWithCache(cacheKey, targets, methodNames, payloads) {
      const cached = this._applyMethodCache[cacheKey];
      if (cached) {
        // Fast path: retry the last known-good call shape first.
        const target = targets[cached.targetIndex];
        if (target) {
          const fn = target[cached.methodName];
          const args = payloads[cached.payloadIndex];
          if (typeof fn === "function" && args !== undefined) {
            try {
              fn.call(target, ...args);
              return true;
            } catch (_) {
              // Method or signature changed, rediscover below.
            }
          }
        }
        // Invalidate and rediscover if object surface changed.
        this._applyMethodCache[cacheKey] = null;
      }

      // Slow path: probe available methods/signatures, then cache the first success.
      for (let targetIndex = 0; targetIndex < targets.length; targetIndex++) {
        const target = targets[targetIndex];
        if (!target) continue;

        for (const methodName of methodNames) {
          const fn = target[methodName];
          if (typeof fn !== "function") continue;

          for (let payloadIndex = 0; payloadIndex < payloads.length; payloadIndex++) {
            const args = payloads[payloadIndex];
            try {
              fn.call(target, ...args);
              this._applyMethodCache[cacheKey] = { targetIndex, methodName, payloadIndex };
              return true;
            } catch (_) {
              // Keep trying alternate signatures and targets.
            }
          }
        }
      }

      return false;
    }

    _applySprungColourToObject(id) {
      const r01 = this._clamp(this._getColourRed(id) / 255, 0, 1);
      const g01 = this._clamp(this._getColourGreen(id) / 255, 0, 1);
      const b01 = this._clamp(this._getColourBlue(id) / 255, 0, 1);

      const targets = this._getApplyTargets();
      for (const target of targets) {
        if (!target) continue;
        try {
          if ("colorRgb" in target) {
            target.colorRgb = [r01, g01, b01];
            return true;
          }
          if ("colourRgb" in target) {
            target.colourRgb = [r01, g01, b01];
            return true;
          }
        } catch (_) {
          // Try next target.
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

    _getTransformChannels(type) {
      const normalized = this._normalizeTransformSpringType(type);
      if (normalized === "size") return ["w", "h", "d"];
      if (normalized === "angle") return ["a"];
      return ["x", "y", "z"];
    }

    _ensureTransformSpringsFromObjectId(type, id) {
      const normalized = this._normalizeTransformSpringType(type);
      if (normalized === "size") {
        this._ensureSizeSpringsFromObject(id);
        return;
      }
      if (normalized === "angle") {
        this._ensureAngleSpringFromObject(id);
        return;
      }
      this._ensurePositionSpringsFromObject(id);
    }

    _getTransformCurrentValues(type) {
      const normalized = this._normalizeTransformSpringType(type);
      if (normalized === "size") {
        return [this._getObjectWidth(), this._getObjectHeight(), this._getObjectDepth()];
      }
      if (normalized === "angle") {
        return [this._getObjectAngle()];
      }
      return [this._getObjectX(), this._getObjectY(), this._getObjectZ()];
    }

    _forEachTransformChannel(type, id, callback) {
      const normalized = this._normalizeTransformSpringType(type);
      const channels = this._getTransformChannels(normalized);
      for (let i = 0; i < channels.length; i++) {
        const channel = channels[i];
        callback(this._transformSpringChannelId(normalized, id, channel), channel, i);
      }
    }

    _applySprungTransformToObjectId(type, id) {
      const normalized = this._normalizeTransformSpringType(type);
      if (normalized === "size") {
        return this._applySprungSizeToObject(id);
      }
      if (normalized === "angle") {
        return this._applySprungAngleToObject(id);
      }
      return this._applySprungPositionToObject(id);
    }

    _finalizeTransformSpringApply(type, id, applyToObject) {
      const normalized = this._normalizeTransformSpringType(type);
      const shouldApply = !!applyToObject;
      this._setTransformSpringAutoApplyId(normalized, id, shouldApply);
      if (shouldApply) {
        this._applySprungTransformToObjectId(normalized, id);
      }
    }

    _getTransformAutoApplySet(type) {
      const normalized = this._normalizeTransformSpringType(type);
      if (normalized === "size") return this._autoApplyTransformSizeSpringIds;
      if (normalized === "angle") return this._autoApplyTransformAngleSpringIds;
      return this._autoApplyTransformPositionSpringIds;
    }

    _setTransformSpringAutoApplyId(type, id, enabled) {
      const set = this._getTransformAutoApplySet(type);
      this._setExclusiveAutoApplyId(set, id, enabled);
    }

    _transformSpringChannelId(type, id, channel) {
      const normalizedType = this._normalizeTransformSpringType(type);
      const springId = this._normalizeSpringId(id);
      return `__transform__:${normalizedType}:${springId}:${channel}`;
    }

    _getTransformTargets() {
      return this._getApplyTargets();
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

    // Query multiple likely object/world-info surfaces for transform values.
    _readTransformValue(methodNames, propertyNames, fallback = 0) {
      for (const target of this._getTransformTargets()) {
        const value = this._tryGetNumericFromTarget(target, methodNames, propertyNames);
        if (value !== null) return value;
      }
      return fallback;
    }

    _readPositionFromTuple(value, expectedLength) {
      if (Array.isArray(value) && value.length >= expectedLength) {
        const out = value.slice(0, expectedLength).map((v) => Number(v));
        if (out.every((v) => Number.isFinite(v))) {
          return out;
        }
      }

      if (value && typeof value === "object") {
        const x = Number(value.x);
        const y = Number(value.y);
        const z = Number(value.z);
        if (expectedLength === 2 && Number.isFinite(x) && Number.isFinite(y)) {
          return [x, y];
        }
        if (expectedLength === 3 && Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) {
          return [x, y, z];
        }
      }

      return null;
    }

    _getObjectPosition2d() {
      const targets = this._getTransformTargets();
      for (const target of targets) {
        if (!target) continue;

        const fn = target.getPosition || target.GetPosition;
        if (typeof fn !== "function") continue;

        try {
          const value = fn.call(target);
          const parsed = this._readPositionFromTuple(value, 2);
          if (parsed) {
            return parsed;
          }
        } catch (_) {
          // Try next runtime surface.
        }
      }

      return null;
    }

    _getObjectPosition3d() {
      const targets = this._getTransformTargets();
      for (const target of targets) {
        if (!target) continue;

        const fn = target.getPosition3d || target.GetPosition3d;
        if (typeof fn !== "function") continue;

        try {
          const value = fn.call(target);
          const parsed = this._readPositionFromTuple(value, 3);
          if (parsed) {
            return parsed;
          }
        } catch (_) {
          // Try next runtime surface.
        }
      }

      return null;
    }

    _getObjectX() {
      const pos3d = this._getObjectPosition3d();
      if (pos3d) return pos3d[0];

      const pos2d = this._getObjectPosition2d();
      if (pos2d) return pos2d[0];

      return this._readTransformValue(["getX", "GetX"], ["x", "_x"], 0);
    }

    _getObjectY() {
      const pos3d = this._getObjectPosition3d();
      if (pos3d) return pos3d[1];

      const pos2d = this._getObjectPosition2d();
      if (pos2d) return pos2d[1];

      return this._readTransformValue(["getY", "GetY"], ["y", "_y"], 0);
    }

    _getObjectZ() {
      const pos3d = this._getObjectPosition3d();
      if (pos3d) return pos3d[2];

      return this._readTransformValue(
        ["getZElevation", "GetZElevation", "getElevation", "GetElevation", "getZ", "GetZ"],
        ["zElevation", "elevation", "z", "_z"],
        0,
      );
    }

    _getObjectWidth() {
      return this._readTransformValue(["getWidth", "GetWidth"], ["width", "_width"], 1);
    }

    _getObjectHeight() {
      return this._readTransformValue(["getHeight", "GetHeight"], ["height", "_height"], 1);
    }

    _getObjectDepth() {
      return this._readTransformValue(["getDepth", "GetDepth"], ["depth", "_depth"], 1);
    }

    _getObjectAngle() {
      const radians = this._readTransformValue(["getAngle", "GetAngle"], ["angle", "_angle"], 0);
      return (Number(radians) || 0) * (180 / Math.PI);
    }

    _getObjectColourRgb255() {
      const targets = this._getApplyTargets();

      for (const target of targets) {
        if (!target) continue;

        try {
          const rgb = target.colorRgb ?? target.colourRgb;
          if (Array.isArray(rgb) && rgb.length >= 3) {
            const [r, g, b] = rgb;
            if (Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b)) {
              const scale = r <= 1 && g <= 1 && b <= 1 ? 255 : 1;
              return [this._clamp(r * scale, 0, 255), this._clamp(g * scale, 0, 255), this._clamp(b * scale, 0, 255)];
            }
          }
        } catch (_) {
          // Try next target.
        }
      }

      return [255, 255, 255];
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

    // Apply transform position with method/signature probing and property fallback.
    _applyPosition(x, y, z = null) {
      const targets = this._getTransformTargets();
      const hasZ = z !== null && z !== undefined;
      const xyPayloads = [[x, y], [[x, y]]];
      const xyMethodNames = ["setPosition", "SetPosition", "setXY", "SetXY"];

      if (hasZ) {
        const xyzPayloads = [[x, y, z], [[x, y, z]]];
        const xyzMethodNames = ["setPosition3d", "SetPosition3d", "setPosition3D", "SetPosition3D", "setXYZ", "SetXYZ"];

        if (this._tryApplyWithCache("positionXYZ", targets, xyzMethodNames, xyzPayloads)) {
          return true;
        }

        // Fallback: apply XY via setPosition/setXY, then apply Z separately.
        if (this._tryApplyWithCache("positionXY", targets, xyMethodNames, xyPayloads)) {
          const setZOnly = ["setZ", "SetZ", "setZElevation", "SetZElevation", "setElevation", "SetElevation"];
          for (const target of targets) {
            if (!target) continue;
            for (const methodName of setZOnly) {
              const fn = target[methodName];
              if (typeof fn !== "function") continue;
              try {
                fn.call(target, z);
                return true;
              } catch (_) {
                // Keep trying alternate runtime surfaces.
              }
            }
          }

          return this._setTransformProperty("zElevation", z)
            || this._setTransformProperty("elevation", z)
            || this._setTransformProperty("z", z)
            || false;
        }
      }

      const payloads = hasZ ? [[x, y, z], [[x, y, z]], [x, y], [[x, y]]] : [[x, y], [[x, y]]];
      const methodNames = hasZ ? ["setXYZ", "SetXYZ"] : xyMethodNames;
      if (this._tryApplyWithCache(hasZ ? "positionXYZ" : "positionXY", targets, methodNames, payloads)) {
        return true;
      }

      let updated = false;
      for (const target of targets) {
        if (!target) continue;
        const setX = target.setX || target.SetX;
        const setY = target.setY || target.SetY;
        const setZ = target.setZ || target.SetZ || target.setZElevation || target.SetZElevation || target.setElevation || target.SetElevation;
        try {
          if (typeof setX === "function") {
            setX.call(target, x);
            updated = true;
          }
          if (typeof setY === "function") {
            setY.call(target, y);
            updated = true;
          }
          if (hasZ && typeof setZ === "function") {
            setZ.call(target, z);
            updated = true;
          }
          if (updated) return true;
        } catch (_) {
          // Continue with fallback targets.
        }
      }

      let didSet = this._setTransformProperty("x", x) || this._setTransformProperty("y", y);
      if (hasZ) {
        didSet = this._setTransformProperty("zElevation", z)
          || this._setTransformProperty("elevation", z)
          || this._setTransformProperty("z", z)
          || didSet;
      }
      return didSet;
    }

    // Apply transform size with method/signature probing and property fallback.
    _applySize(width, height, depth = null) {
      const w = Math.max(0, Number(width) || 0);
      const h = Math.max(0, Number(height) || 0);
      const hasDepth = depth !== null && depth !== undefined;
      const d = Math.max(0, Number(depth) || 0);

      const targets = this._getTransformTargets();
      const payloads = hasDepth ? [[w, h, d], [[w, h, d]], [w, h], [[w, h]]] : [[w, h], [[w, h]]];
      const methodNames = hasDepth ? ["setSize", "SetSize", "setWHD", "SetWHD"] : ["setSize", "SetSize"];
      if (this._tryApplyWithCache(hasDepth ? "sizeWHD" : "sizeWH", targets, methodNames, payloads)) {
        return true;
      }

      let updated = false;
      for (const target of targets) {
        if (!target) continue;
        const setWidth = target.setWidth || target.SetWidth;
        const setHeight = target.setHeight || target.SetHeight;
        const setDepth = target.setDepth || target.SetDepth;
        try {
          if (typeof setWidth === "function") {
            setWidth.call(target, w);
            updated = true;
          }
          if (typeof setHeight === "function") {
            setHeight.call(target, h);
            updated = true;
          }
          if (hasDepth && typeof setDepth === "function") {
            setDepth.call(target, d);
            updated = true;
          }
          if (updated) return true;
        } catch (_) {
          // Continue with fallback targets.
        }
      }

      let didSet = this._setTransformProperty("width", w) || this._setTransformProperty("height", h);
      if (hasDepth) {
        didSet = this._setTransformProperty("depth", d) || didSet;
      }
      return didSet;
    }

    // Apply angle in radians to runtime surfaces while accepting degree inputs from spring logic.
    _applyAngle(angle) {
      const degrees = Number(angle) || 0;
      const a = degrees * (Math.PI / 180);
      const targets = this._getTransformTargets();
      const payloads = [[a]];
      const methodNames = ["setAngle", "SetAngle"];

      if (this._tryApplyWithCache("angle", targets, methodNames, payloads)) {
        return true;
      }

      return this._setTransformProperty("angle", a);
    }

    // Lazily bootstrap transform channel springs from current object values.
    _ensurePositionSpringsFromObject(id) {
      const xId = this._transformSpringChannelId("position", id, "x");
      const yId = this._transformSpringChannelId("position", id, "y");
      const zId = this._transformSpringChannelId("position", id, "z");
      if (this._getSpring(xId, false) && this._getSpring(yId, false) && this._getSpring(zId, false)) return;

      const x = this._getObjectX();
      const y = this._getObjectY();
      const z = this._getObjectZ();
      this._resetToValueId(xId, x);
      this._resetToValueId(yId, y);
      this._resetToValueId(zId, z);
    }

    // Lazily bootstrap size channel springs from current object values.
    _ensureSizeSpringsFromObject(id) {
      const wId = this._transformSpringChannelId("size", id, "w");
      const hId = this._transformSpringChannelId("size", id, "h");
      const dId = this._transformSpringChannelId("size", id, "d");
      if (this._getSpring(wId, false) && this._getSpring(hId, false) && this._getSpring(dId, false)) return;

      const width = this._getObjectWidth();
      const height = this._getObjectHeight();
      const depth = this._getObjectDepth();
      this._resetToValueId(wId, width);
      this._resetToValueId(hId, height);
      this._resetToValueId(dId, depth);
    }

    // Lazily bootstrap angle channel spring from current object angle.
    _ensureAngleSpringFromObject(id) {
      const aId = this._transformSpringChannelId("angle", id, "a");
      if (this._getSpring(aId, false)) return;
      this._resetToValueId(aId, this._getObjectAngle());
    }

    _springPositionToId(id, x, y, z = null, useForInstance = true) {
      if (typeof z === "boolean") {
        useForInstance = z;
        z = null;
      }
      this._ensurePositionSpringsFromObject(id);
      this._springToId(this._transformSpringChannelId("position", id, "x"), Number(x), 0);
      this._springToId(this._transformSpringChannelId("position", id, "y"), Number(y), 0);
      this._springToId(this._transformSpringChannelId("position", id, "z"), Number(z ?? this._getObjectZ()), 0);
      this._finalizeTransformSpringApply("position", id, useForInstance);
    }

    _springPositionFromToId(id, fromX, fromY, fromZ, toX, toY, toZ, useForInstance = true) {
      if (typeof toZ === "boolean") {
        useForInstance = toZ;
        toZ = this._getObjectZ();
        fromZ = this._getObjectZ();
      }
      this._springFromToId(this._transformSpringChannelId("position", id, "x"), Number(fromX), Number(toX));
      this._springFromToId(this._transformSpringChannelId("position", id, "y"), Number(fromY), Number(toY));
      this._springFromToId(this._transformSpringChannelId("position", id, "z"), Number(fromZ), Number(toZ));
      this._finalizeTransformSpringApply("position", id, useForInstance);
    }

    _springSizeToId(id, width, height, depth = null, useForInstance = true) {
      if (typeof depth === "boolean") {
        useForInstance = depth;
        depth = null;
      }
      this._ensureSizeSpringsFromObject(id);
      this._springToId(this._transformSpringChannelId("size", id, "w"), Number(width), 0);
      this._springToId(this._transformSpringChannelId("size", id, "h"), Number(height), 0);
      this._springToId(this._transformSpringChannelId("size", id, "d"), Number(depth ?? this._getObjectDepth()), 0);
      this._finalizeTransformSpringApply("size", id, useForInstance);
    }

    _springSizeFromToId(id, fromW, fromH, fromD, toW, toH, toD, useForInstance = true) {
      if (typeof toD === "boolean") {
        useForInstance = toD;
        toD = this._getObjectDepth();
        fromD = this._getObjectDepth();
      }
      this._springFromToId(this._transformSpringChannelId("size", id, "w"), Number(fromW), Number(toW));
      this._springFromToId(this._transformSpringChannelId("size", id, "h"), Number(fromH), Number(toH));
      this._springFromToId(this._transformSpringChannelId("size", id, "d"), Number(fromD), Number(toD));
      this._finalizeTransformSpringApply("size", id, useForInstance);
    }

    _springAngleToId(id, angle, mode = 1, useForInstance = true) {
      this._ensureAngleSpringFromObject(id);
      this._springToId(this._transformSpringChannelId("angle", id, "a"), Number(angle), Number(mode));
      this._finalizeTransformSpringApply("angle", id, useForInstance);
    }

    _springAngleFromToId(id, fromAngle, toAngle, useForInstance = true) {
      this._springFromToAngleId(this._transformSpringChannelId("angle", id, "a"), Number(fromAngle), Number(toAngle));
      this._finalizeTransformSpringApply("angle", id, useForInstance);
    }

    _setTransformPositionStartValueId(id, x, y, z = 0) {
      this._resetToValueId(this._transformSpringChannelId("position", id, "x"), Number(x));
      this._resetToValueId(this._transformSpringChannelId("position", id, "y"), Number(y));
      this._resetToValueId(this._transformSpringChannelId("position", id, "z"), Number(z));
    }

    _setTransformPositionEndValueId(id, x, y, z = 0) {
      this._ensurePositionSpringsFromObject(id);
      this._getSpring(this._transformSpringChannelId("position", id, "x"), true).to = Number(x);
      this._getSpring(this._transformSpringChannelId("position", id, "y"), true).to = Number(y);
      this._getSpring(this._transformSpringChannelId("position", id, "z"), true).to = Number(z);
    }

    _setTransformSizeStartValueId(id, width, height) {
      this._resetToValueId(this._transformSpringChannelId("size", id, "w"), Number(width));
      this._resetToValueId(this._transformSpringChannelId("size", id, "h"), Number(height));
      this._resetToValueId(this._transformSpringChannelId("size", id, "d"), 0);
    }

    _setTransformSizeEndValueId(id, width, height) {
      this._ensureSizeSpringsFromObject(id);
      this._getSpring(this._transformSpringChannelId("size", id, "w"), true).to = Number(width);
      this._getSpring(this._transformSpringChannelId("size", id, "h"), true).to = Number(height);
      this._getSpring(this._transformSpringChannelId("size", id, "d"), true).to = 0;
    }

    _setTransformAngleStartValueId(id, angle) {
      this._resetToValueId(this._transformSpringChannelId("angle", id, "a"), Number(angle));
    }

    _setTransformAngleEndValueId(id, angle) {
      this._ensureAngleSpringFromObject(id);
      this._getSpring(this._transformSpringChannelId("angle", id, "a"), true).to = Number(angle);
    }

    // Configure a constant transform spring and keep its per-channel state in sync with the object when required.
    _configureTransformAlwaysSpringId(type, id, operation, targetA, targetB, targetC = 0, mode = 1, applyToObject = false) {
      const normalized = this._normalizeTransformSpringType(type);
      const normalizedOperation = Number(operation) || 0;
      const targets = normalized === "angle"
        ? [Number(targetA)]
        : [Number(targetA), Number(targetB), Number(targetC)];
      const currentValues = this._getTransformCurrentValues(normalized);

      this._ensureTransformSpringsFromObjectId(normalized, id);
      // Keep channel behavior data-driven so updates only touch one transform map.
      this._forEachTransformChannel(normalized, id, (channelId, _channel, index) => {
        if (applyToObject && normalized === "size" && normalizedOperation === 0) {
          this._syncSpringToCurrentValueIfDrifted(channelId, currentValues[index], 0.5);
        }

        this._configureAlwaysSpringValueId(
          channelId,
          normalizedOperation,
          targets[index],
          normalized === "angle" ? Number(mode) : 0,
          currentValues[index],
        );
      });

      this._finalizeTransformSpringApply(normalized, id, applyToObject);
    }

    _stopTransformSpringId(type, id) {
      const normalized = this._normalizeTransformSpringType(type);
      this._forEachTransformChannel(normalized, id, (channelId) => {
        this._stopAtCurrentValueId(channelId);
      });

      this._setTransformSpringAutoApplyId(normalized, id, false);
    }

    _setTransformSpringSettingsId(type, id, stiffness, damping, precision) {
      const normalized = this._normalizeTransformSpringType(type);
      this._forEachTransformChannel(normalized, id, (channelId) => {
        this._setStiffness(stiffness, channelId);
        this._setDamping(damping, channelId);
        this._setPrecision(precision, channelId);
      });
    }

    _setTransformSpringSettingsFromDurationId(type, id, durationSeconds, precision = this._precision, bounceProfile = 1) {
      const normalized = this._normalizeTransformSpringType(type);
      const settings = this._findSpringSettingsForDuration(durationSeconds, precision, bounceProfile);
      this._forEachTransformChannel(normalized, id, (channelId) => {
        this._setStiffness(settings.stiffness, channelId);
        this._setDamping(settings.damping, channelId);
        this._setPrecision(settings.precision, channelId);
      });
    }

    _addToTransformSpringVelocityId(type, id, velocityA, velocityB = 0, velocityC = 0) {
      const normalized = this._normalizeTransformSpringType(type);
      const velocities = normalized === "angle"
        ? [Number(velocityA)]
        : [Number(velocityA), Number(velocityB), Number(velocityC)];

      this._ensureTransformSpringsFromObjectId(normalized, id);
      this._forEachTransformChannel(normalized, id, (channelId, _channel, index) => {
        this._addToVelocityId(channelId, velocities[index]);
      });
    }

    _getSprungPositionX(id) {
      return this._getSpringValue(this._transformSpringChannelId("position", id, "x"));
    }

    _getSprungPositionY(id) {
      return this._getSpringValue(this._transformSpringChannelId("position", id, "y"));
    }

    _getSprungPositionZ(id) {
      return this._getSpringValue(this._transformSpringChannelId("position", id, "z"));
    }

    _getSprungWidth(id) {
      return this._getSpringValue(this._transformSpringChannelId("size", id, "w"));
    }

    _getSprungHeight(id) {
      return this._getSpringValue(this._transformSpringChannelId("size", id, "h"));
    }

    _getSprungDepth(id) {
      return this._getSpringValue(this._transformSpringChannelId("size", id, "d"));
    }

    _getSprungAngle(id) {
      return this._getSpringValue(this._transformSpringChannelId("angle", id, "a"));
    }

    _applySprungPositionToObject(id) {
      return this._applyPosition(this._getSprungPositionX(id), this._getSprungPositionY(id), this._getSprungPositionZ(id));
    }

    _applySprungSizeToObject(id) {
      return this._applySize(this._getSprungWidth(id), this._getSprungHeight(id), this._getSprungDepth(id));
    }

    _applySprungAngleToObject(id) {
      return this._applyAngle(this._getSprungAngle(id));
    }

    _isTransformSpringAnimatingId(type, id) {
      const normalized = this._normalizeTransformSpringType(type);
      let isAnimating = false;
      this._forEachTransformChannel(normalized, id, (channelId) => {
        if (!isAnimating && this._isSpringAnimatingId(channelId)) {
          isAnimating = true;
        }
      });
      return isAnimating;
    }

    _hasTransformSpringReachedTargetId(type, id) {
      const normalized = this._normalizeTransformSpringType(type);
      let reachedTarget = true;
      this._forEachTransformChannel(normalized, id, (channelId) => {
        if (reachedTarget && !this._hasSpringReachedTarget(channelId)) {
          reachedTarget = false;
        }
      });
      return reachedTarget;
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

    // Tick mesh spring physics, apply optional sway, and emit settled once all mesh energy is gone.
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

    _getActiveSpringCount() {
      let count = 0;
      for (const spring of this._springs.values()) {
        if (spring.isAnimating && !spring.isPaused) {
          count++;
        }
      }
      return count;
    }

    _getConstantSpringCount() {
      let count = 0;
      for (const spring of this._springs.values()) {
        if (spring.alwaysSpringEnabled) {
          count++;
        }
      }
      return count;
    }

    _debugLogActiveSprings() {
      const rows = [];

      for (const springId of this._activeSpringIds) {
        const spring = this._getSpring(springId, false);
        if (!spring) {
          continue;
        }

        rows.push({
          id: spring.id,
          value: spring.smoothValue,
          target: spring.to,
          velocity: spring.velocity,
          animating: spring.isAnimating,
          paused: spring.isPaused,
          constant: spring.alwaysSpringEnabled,
        });
      }

      if (!rows.length) {
        console.info("[" + name + "] Active springs: none");
        return;
      }

      rows.sort((a, b) => String(a.id).localeCompare(String(b.id)));
      console.groupCollapsed("[" + name + "] Active springs (" + rows.length + ")");
      console.table(rows);
      console.groupEnd();
    }

    _getPausedSpringCount() {
      let count = 0;
      for (const spring of this._springs.values()) {
        if (spring.isPaused) {
          count++;
        }
      }
      return count;
    }

    _getSpringIdAt(index) {
      index = Math.floor(Number(index));
      if (index < 0 || index >= this._springs.size) return "";
      let i = 0;
      for (const springId of this._springs.keys()) {
        if (i === index) {
          return springId;
        }
        i++;
      }
      return "";
    }

    _toPublicSpringId(springId) {
      const idValue = this._normalizeSpringId(springId);

      if (idValue.startsWith("__colour__:")) {
        const parts = idValue.split(":");
        return parts[1] || this._defaultSpringId;
      }

      if (idValue.startsWith("__transform__:")) {
        const parts = idValue.split(":");
        return parts[2] || this._defaultSpringId;
      }

      return idValue;
    }

    _getLastSpringId() {
      return this._lastTriggeredSpringId;
    }

    _getLastCompletedSpringId() {
      return this._lastCompletedSpringId;
    }

    _getLastStartedSpringId() {
      return this._lastStartedSpringId;
    }

    _getLastStoppedSpringId() {
      return this._lastStoppedSpringId;
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

    _estimateSingleSpringTimeToTargetSeconds(spring, maxSeconds = 10) {
      if (!spring) return 0;

      const precision = Math.max(0.0001, Number(spring.precision) || this._precision || 0.01);
      const maxSteps = Math.max(1, Math.ceil((Number(maxSeconds) || 10) * 60));

      let value = Number(spring.value);
      let velocity = Number(spring.velocity);
      const target = Number(spring.to);
      const stiffness = Number(spring.stiffness) || this._stiffness;
      const damping = Number(spring.damping) || this._damping;

      if (!Number.isFinite(value) || !Number.isFinite(velocity) || !Number.isFinite(target)) {
        return 0;
      }

      const getDist = () => {
        if (spring.alwaysSpringMode === 1) {
          let diff = target - value;
          while (diff > 180) diff -= 360;
          while (diff < -180) diff += 360;
          return Math.abs(diff);
        }
        return Math.abs(target - value);
      };

      if (getDist() < precision && Math.abs(velocity) < precision) {
        return 0;
      }

      for (let step = 1; step <= maxSteps; step++) {
        let targetValue = target;

        if (spring.alwaysSpringMode === 1) {
          let diff = target - value;
          while (diff > 180) diff -= 360;
          while (diff < -180) diff += 360;
          targetValue = value + diff;
        }

        const displacement = targetValue - value;
        velocity += displacement * stiffness;
        velocity *= damping;
        value += velocity;

        const dist = getDist();
        const speed = Math.abs(velocity);
        if (dist < precision && speed < precision) {
          return step / 60;
        }
      }

      return -1;
    }

    // Estimate total settle time for a public spring id, including any internal transform/colour channel springs it owns.
    _estimateSpringTimeToTargetSeconds(id = this._defaultSpringId, maxSeconds = 10) {
      const springId = this._normalizeSpringId(id);
      const directSpring = this._getSpring(springId, false);

      const relatedSprings = [];
      if (directSpring) {
        relatedSprings.push(directSpring);
      }

      this._forEachColourChannel(springId, (channelId) => {
        const spring = this._getSpring(channelId, false);
        if (spring) {
          relatedSprings.push(spring);
        }
      });

      this._forEachTransformChannel("position", springId, (channelId) => {
        const spring = this._getSpring(channelId, false);
        if (spring) {
          relatedSprings.push(spring);
        }
      });

      this._forEachTransformChannel("size", springId, (channelId) => {
        const spring = this._getSpring(channelId, false);
        if (spring) {
          relatedSprings.push(spring);
        }
      });

      this._forEachTransformChannel("angle", springId, (channelId) => {
        const spring = this._getSpring(channelId, false);
        if (spring) {
          relatedSprings.push(spring);
        }
      });

      if (!relatedSprings.length) {
        return 0;
      }

      let maxEstimate = 0;
      for (const spring of relatedSprings) {
        const estimate = this._estimateSingleSpringTimeToTargetSeconds(spring, maxSeconds);
        if (estimate < 0) {
          return -1;
        }
        maxEstimate = Math.max(maxEstimate, estimate);
      }

      return maxEstimate;
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
        colourSpringSpaces: Array.from(this._colourSpringSpaces.entries()),
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
          isPaused: !!spring.isPaused,
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
      this._colourSpringSpaces = new Map(
        (Array.isArray(o?.colourSpringSpaces) ? o.colourSpringSpaces : [])
          .map(([springId, space]) => [
            this._normalizeSpringId(springId),
            this._parseColourSpace(space),
          ])
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
          spring.isPaused = !!savedSpring.isPaused;
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
      this._rebuildActiveSpringIds();
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
      const focusSpringId = this._normalizeSpringId(this._lastTriggeredSpringId || this._defaultSpringId);
      const spring = this._getSpring(focusSpringId, false) || this._getSpring(this._defaultSpringId, true);
      const activeIds = Array.from(this._activeSpringIds).sort();
      const toDebugList = (values, fallback = "-") => {
        if (!values || !values.length) {
          return fallback;
        }
        return values.join(", ");
      };

      const positionAutoIds = Array.from(this._autoApplyTransformPositionSpringIds);
      const sizeAutoIds = Array.from(this._autoApplyTransformSizeSpringIds);
      const angleAutoIds = Array.from(this._autoApplyTransformAngleSpringIds);
      const colourAutoIds = Array.from(this._autoApplyColourSpringIds);

      return [
        {
          title: "$" + this.behaviorType.name,
          properties: [
            { name: "$isEnabled", value: this._isEnabled },
            { name: "$defaultSpringId", value: this._defaultSpringId },
            { name: "$springCount", value: this._springs.size },
            { name: "$Playing/Active Springs", value: this._getActiveSpringCount() },
            { name: "$Constant Springs", value: this._getConstantSpringCount() },
            { name: "$Paused Springs", value: this._getPausedSpringCount() },
            { name: "$Active Spring IDs", value: toDebugList(activeIds) },
            { name: "$focusSpringId", value: spring.id },
            { name: "$Action Queues", value: this._springActionQueueById.size },
            { name: "$Completion Waiters", value: this._springCompletionWaiters.size },
            { name: "$stiffness", value: this._stiffness, onedit: v => this._stiffness = Math.max(0.001, +v) },
            { name: "$damping", value: this._damping, onedit: v => this._damping = Math.max(0, Math.min(1, +v)) },
            { name: "$precision", value: this._precision, onedit: v => this._precision = Math.max(0.0001, +v) },
            { name: "$alwaysSpring", value: spring.alwaysSpringEnabled },
            { name: "$lastSpringId", value: this._lastTriggeredSpringId },
            { name: "$lastStartedSpringId", value: this._lastStartedSpringId },
            { name: "$lastCompletedSpringId", value: this._lastCompletedSpringId },
          ]
        },
        {
          title: "$" + this.behaviorType.name + " - Auto Apply",
          properties: [
            { name: "$Colour Owner", value: toDebugList(colourAutoIds) },
            { name: "$Position Owner", value: toDebugList(positionAutoIds) },
            { name: "$Size Owner", value: toDebugList(sizeAutoIds) },
            { name: "$Angle Owner", value: toDebugList(angleAutoIds) },
          ]
        },
        {
          title: "$" + this.behaviorType.name + " - Mesh",
          properties: [
            { name: "$enabled", value: this._meshEnabled, onedit: v => this._meshEnabled = (v === "true") },
            { name: "$animating", value: this._meshAnimating },
            { name: "$swayEnabled", value: this._meshSwayEnabled },
            { name: "$swayAngle", value: this._meshSwayAngle },
            { name: "$swayStrength", value: this._meshSwayStrength },
            { name: "$swayWavelength", value: this._meshSwayWavelength },
            { name: "$swaySpeed", value: this._meshSwaySpeed },
            { name: "$autoGrid", value: this._meshAutoGridCols + "×" + this._meshAutoGridRows },
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
