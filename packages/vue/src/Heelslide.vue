<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import type { Point2D } from '@heelslide/core';
import type { HeelslideProps, HeelslideEmits } from './types.js';
import { useHeelslide } from './useHeelslide.js';
import './style.css';

const props = withDefaults(defineProps<HeelslideProps>(), {
  heels: 2,
  tolerance: 24,
  bounds: () => ({ width: 300, height: 150 }),
  gridStep: 24,
  margin: 16,
  disabled: false,
  ariaLabel: 'Slide to unlock',
  accessibleFallback: 'stepped',
  accessibleButtonText: 'Confirm with Accessible Alternative'
});

const emit = defineEmits<HeelslideEmits>();

const containerRef = ref<HTMLElement | null>(null);
const handleRef = ref<SVGGElement | null>(null);
const capturedPointerId = ref<number | null>(null);

const {
  state,
  progress,
  track,
  currentSegmentIndex,
  handlePosition,
  isDragging,
  announcement,
  isFallbackOpen,
  startGesture,
  updateGesture,
  endGesture,
  cancelGesture,
  reset,
  regeneratePath,
  stepForward,
  stepBackward,
  stepToNextHeel,
  handleKeyDown: hookHandleKeyDown,
  openFallback,
  closeFallback,
  confirmFallback
} = useHeelslide({
  track: props.track,
  tolerance: props.tolerance,
  generator: {
    bounds: props.bounds,
    gridStep: props.gridStep,
    margin: props.margin,
    heels: props.heels,
    seed: props.seed
  },
  disabled: props.disabled,
  accessibleFallback: props.accessibleFallback,
  containerRef,
  onUnlock: () => {
    emit('unlock');
  },
  onReset: () => {
    emit('reset');
  },
  onProgress: (p) => {
    emit('progress', p);
  },
  onStateChange: (s) => {
    emit('stateChange', s);
  },
  onAnnouncement: (ann) => {
    emit('announcement', ann);
  }
});

function handleFallbackOpen(): void {
  openFallback();
  emit('fallbackOpen');
}

function handleFallbackClose(): void {
  closeFallback();
  emit('fallbackClose');
}

function handleKeyDown(event: KeyboardEvent): void {
  if (props.disabled) return;
  hookHandleKeyDown(event);
}

function pointsToSvgPath(points: readonly Point2D[]): string {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  return `M ${first!.x} ${first!.y} ${rest.map((p) => `L ${p.x} ${p.y}`).join(' ')}`.trim();
}

const bgPathD = computed(() => pointsToSvgPath(track.value.points));

const progressPathD = computed(() => {
  if (progress.value <= 0) {
    const startPt = track.value.points[0]!;
    return `M ${startPt.x} ${startPt.y} L ${startPt.x} ${startPt.y}`;
  }

  const traversedPoints = track.value.points.slice(0, currentSegmentIndex.value + 1);
  const pathPoints = [...traversedPoints, handlePosition.value];
  return pointsToSvgPath(pathPoints);
});

const heelMarkers = computed(() => {
  if (track.value.points.length <= 2) return [];
  return track.value.points.slice(1, -1);
});

const destinationPoint = computed(() => {
  return track.value.points[track.value.points.length - 1]!;
});

const viewBox = computed(() => {
  return `0 0 ${props.bounds.width} ${props.bounds.height}`;
});

function handlePointerDown(event: PointerEvent): void {
  if (props.disabled) return;

  const target = event.currentTarget as Element | null;
  if (target && typeof target.setPointerCapture === 'function') {
    try {
      target.setPointerCapture(event.pointerId);
      capturedPointerId.value = event.pointerId;
    } catch {
      // Ignore pointer capture error in test environments
    }
  }

  startGesture(event);
}

function handlePointerMove(event: PointerEvent): void {
  if (props.disabled || !isDragging.value) return;
  updateGesture(event);
}

function handlePointerUp(event: PointerEvent): void {
  if (props.disabled) return;

  const target = event.currentTarget as Element | null;
  if (target && capturedPointerId.value !== null && typeof target.releasePointerCapture === 'function') {
    try {
      target.releasePointerCapture(capturedPointerId.value);
    } catch {
      // Ignore pointer release error
    }
    capturedPointerId.value = null;
  }

  if (isDragging.value) {
    endGesture();
  }
}

function handlePointerCancel(event: PointerEvent): void {
  if (props.disabled) return;

  const target = event.currentTarget as Element | null;
  if (target && capturedPointerId.value !== null && typeof target.releasePointerCapture === 'function') {
    try {
      target.releasePointerCapture(capturedPointerId.value);
    } catch {
      // Ignore pointer release error
    }
    capturedPointerId.value = null;
  }

  if (isDragging.value) {
    cancelGesture();
  }
}

onUnmounted(() => {
  if (isDragging.value) {
    cancelGesture();
  }
  capturedPointerId.value = null;
});

defineExpose({
  state,
  progress,
  track,
  currentSegmentIndex,
  handlePosition,
  announcement,
  isFallbackOpen,
  reset,
  regeneratePath,
  stepForward,
  stepBackward,
  stepToNextHeel,
  openFallback: handleFallbackOpen,
  closeFallback: handleFallbackClose,
  confirmFallback
});
</script>

<template>
  <div
    ref="containerRef"
    data-heelslide-container
    role="slider"
    :tabindex="disabled ? -1 : 0"
    :aria-label="ariaLabel"
    :aria-describedby="ariaDescribedBy"
    :aria-valuemin="0"
    :aria-valuemax="100"
    :aria-valuenow="Math.round(progress * 100)"
    :aria-valuetext="announcement || `${Math.round(progress * 100)}% complete`"
    aria-keyshortcuts="ArrowRight ArrowLeft ArrowUp ArrowDown Enter Space Escape Home"
    :aria-disabled="disabled"
    :data-disabled="disabled"
    :data-state="state"
    class="heelslide-container"
    :class="{
      'heelslide-disabled': disabled,
      'heelslide-active': isDragging,
      'heelslide-unlocked': state === 'unlocked'
    }"
    :style="{
      '--heelslide-width': `${bounds.width}px`,
      '--heelslide-height': `${bounds.height}px`,
      position: 'relative'
    }"
    @keydown="handleKeyDown"
  >
    <!-- Screen reader visually-hidden live region -->
    <div
      data-heelslide-live-region
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style="position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip: rect(0, 0, 0, 0); border: 0; white-space: nowrap;"
    >
      <slot name="announcer" :message="announcement">
        {{ announcement }}
      </slot>
    </div>

    <svg
      class="heelslide-svg"
      :viewBox="viewBox"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Background track -->
      <path
        class="heelslide-track-bg"
        :d="bgPathD"
      />

      <!-- Progress path overlay -->
      <path
        class="heelslide-track-progress"
        :d="progressPathD"
      />

      <!-- Heel turn markers -->
      <circle
        v-for="(marker, index) in heelMarkers"
        :key="`heel-${index}`"
        class="heelslide-heel-marker"
        :cx="marker.x"
        :cy="marker.y"
      />

      <!-- Destination end marker -->
      <circle
        class="heelslide-end-marker"
        :cx="destinationPoint.x"
        :cy="destinationPoint.y"
      />

      <!-- Draggable Handle -->
      <g
        ref="handleRef"
        class="heelslide-handle"
        role="slider"
        :aria-label="ariaLabel"
        :aria-valuemin="0"
        :aria-valuemax="100"
        :aria-valuenow="Math.round(progress * 100)"
        tabindex="0"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointercancel="handlePointerCancel"
      >
        <circle
          class="heelslide-handle-circle"
          :cx="handlePosition.x"
          :cy="handlePosition.y"
        />
        <slot
          name="handle"
          :position="handlePosition"
          :progress="progress"
          :state="state"
        />
      </g>
    </svg>

    <!-- Fallback trigger button -->
    <button
      v-if="accessibleFallback === 'dialog'"
      type="button"
      data-heelslide-fallback-button
      aria-haspopup="dialog"
      :disabled="disabled"
      style="position: absolute; bottom: 8px; right: 8px; z-index: 10; font-size: 11px; padding: 4px 8px; border-radius: 6px; background-color: var(--heelslide-fallback-btn-bg, #f1f5f9); color: var(--heelslide-fallback-btn-color, #334155); border: 1px solid var(--heelslide-fallback-btn-border, #cbd5e1); cursor: pointer;"
      @click="handleFallbackOpen"
    >
      {{ accessibleButtonText }}
    </button>

    <!-- Accessible Dialog Fallback / Slot -->
    <template v-if="isFallbackOpen">
      <slot
        name="fallback"
        :is-open="isFallbackOpen"
        :confirm="confirmFallback"
        :cancel="handleFallbackClose"
      >
        <div
          data-heelslide-dialog
          role="dialog"
          aria-modal="true"
          aria-labelledby="heelslide-dialog-title"
          aria-describedby="heelslide-dialog-desc"
          style="position: absolute; inset: 0; background-color: rgba(0, 0, 0, 0.75); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px; z-index: 20; box-sizing: border-box;"
        >
          <div
            style="background-color: #ffffff; border-radius: 8px; padding: 16px; max-width: 90%; text-align: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);"
          >
            <h3
              id="heelslide-dialog-title"
              style="margin: 0 0 8px 0; font-size: 16px; color: #0f172a;"
            >
              Accessible Verification
            </h3>
            <p
              id="heelslide-dialog-desc"
              style="margin: 0 0 16px 0; font-size: 13px; color: #475569;"
            >
              Confirm your intention to unlock the security gate.
            </p>
            <div style="display: flex; gap: 8px; justify-content: center;">
              <button
                type="button"
                data-heelslide-dialog-confirm
                style="padding: 6px 14px; border-radius: 6px; background-color: #2563eb; color: #ffffff; border: none; font-weight: 500; cursor: pointer;"
                @click="confirmFallback"
              >
                Confirm
              </button>
              <button
                type="button"
                data-heelslide-dialog-cancel
                style="padding: 6px 14px; border-radius: 6px; background-color: #e2e8f0; color: #334155; border: none; font-weight: 500; cursor: pointer;"
                @click="handleFallbackClose"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </slot>
    </template>
  </div>
</template>
