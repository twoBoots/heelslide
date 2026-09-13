<script setup lang="ts">
import { ref, computed, onUnmounted, useId } from 'vue';
import { KEY_SHORTCUTS, getStepDirection, resolveKeyAction, type Point2D } from '@heelslide/core';
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
  numberedHeels: false,
  segmented: false,
  checkpointTimeoutMs: 0,
  ariaLabel: 'Slide to unlock'
});

const emit = defineEmits<HeelslideEmits>();

const stepped = computed(() => (props.accessibleFallback ?? 'stepped') === 'stepped');
const descriptionId = `heelslide-desc-${useId()}`;

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
  startGesture,
  updateGesture,
  endGesture,
  cancelGesture,
  reset,
  regeneratePath,
  stepForward,
  stepBackward,
  description,
  announcement
} = useHeelslide({
  track: props.track,
  tolerance: props.tolerance,
  initialState: props.initialState,
  initialProgress: props.initialProgress,
  segmented: props.segmented,
  checkpointTimeoutMs: props.checkpointTimeoutMs,
  generator: {
    bounds: props.bounds,
    gridStep: props.gridStep,
    margin: props.margin,
    heels: props.heels,
    seed: props.seed
  },
  haptics: props.haptics,
  sound: props.sound,
  containerRef,
  onTurn: (heelIndex) => {
    emit('turn', heelIndex);
    props.onTurn?.(heelIndex);
  },
  onCheckpoint: (heelIndex, p) => {
    emit('checkpoint', { heelIndex, progress: p });
    props.onCheckpoint?.(heelIndex, p);
  },
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
  onAnnouncement: (a) => {
    emit('announcement', a);
  }
});

const activeSegment = computed(() => track.value.segments[currentSegmentIndex.value]);

const valueText = computed(() => {
  const percent = Math.round(progress.value * 100);
  const segment = activeSegment.value;
  if (!segment) return `${percent}% complete.`;
  const direction = getStepDirection(segment.start, segment.end, segment.direction);
  return `${percent}% complete. Move ${direction} to continue.`;
});

function handleKeyDown(event: KeyboardEvent): void {
  if (props.disabled || !stepped.value) return;

  const action = resolveKeyAction(event.key);
  if (!action) return;

  // Only claim keys we handle, so page scrolling and shortcuts survive elsewhere.
  event.preventDefault();

  switch (action) {
    case 'forward':
      stepForward();
      break;
    case 'backward':
      stepBackward();
      break;
    case 'reset':
    case 'cancel':
      reset();
      break;
    case 'confirm':
      endGesture();
      break;
  }
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

const isGoalTarget = computed(() => {
  return track.value.points.length > 0 && currentSegmentIndex.value >= track.value.points.length - 2;
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
  reset,
  regeneratePath
});
</script>

<template>
  <div
    ref="containerRef"
    class="heelslide-container"
    :class="{
      'heelslide-disabled': disabled,
      'heelslide-active': isDragging,
      'heelslide-checkpoint': state === 'checkpoint',
      'heelslide-unlocked': state === 'unlocked'
    }"
    role="slider"
    :aria-label="ariaLabel"
    :aria-valuemin="0"
    :aria-valuemax="100"
    :aria-valuenow="Math.round(progress * 100)"
    :aria-valuetext="valueText"
    :aria-orientation="activeSegment?.direction ?? 'horizontal'"
    :aria-disabled="disabled"
    :aria-describedby="descriptionId"
    :aria-keyshortcuts="stepped ? KEY_SHORTCUTS : undefined"
    :tabindex="disabled ? -1 : 0"
    :data-disabled="disabled"
    :data-state="state"
    data-heelslide-container
    @keydown="handleKeyDown"
    :style="{
      '--heelslide-width': `${bounds.width}px`,
      '--heelslide-height': `${bounds.height}px`
    }"
  >
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
      <g
        v-for="(marker, index) in heelMarkers"
        :key="`heel-${index}`"
        class="heelslide-heel-group"
        :class="{
          'heelslide-target': currentSegmentIndex === index,
          'heelslide-cleared': currentSegmentIndex > index
        }"
        :data-heelslide-heel="index + 1"
        :data-target="currentSegmentIndex === index ? 'true' : 'false'"
      >
        <!-- Clearance buffer ring -->
        <circle
          class="heelslide-heel-buffer"
          :cx="marker.x"
          :cy="marker.y"
        />
        <!-- Heel marker circle -->
        <circle
          class="heelslide-heel-marker"
          :cx="marker.x"
          :cy="marker.y"
        />
        <!-- Numbered heel text label -->
        <text
          v-if="numberedHeels"
          class="heelslide-heel-text"
          :x="marker.x"
          :y="marker.y"
          text-anchor="middle"
          dominant-baseline="central"
        >
          {{ index + 1 }}
        </text>
      </g>

      <!-- Destination end marker -->
      <g
        class="heelslide-goal-group"
        :class="{ 'heelslide-target': isGoalTarget }"
        :data-target="isGoalTarget ? 'true' : 'false'"
      >
        <circle
          class="heelslide-end-marker"
          :cx="destinationPoint.x"
          :cy="destinationPoint.y"
        />
      </g>

      <!-- Draggable Handle -->
      <!--
        The handle is a pointer affordance only. Keyboard and assistive-technology users operate
        the container, which carries role="slider", focus and the key bindings.
      -->
      <g
        ref="handleRef"
        class="heelslide-handle"
        role="presentation"
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

    <span :id="descriptionId" class="heelslide-visually-hidden">{{ description }}</span>

    <span
      v-if="stepped"
      data-heelslide-live-region
      role="status"
      aria-live="polite"
      aria-atomic="true"
      class="heelslide-visually-hidden"
    >
      <slot name="announcer" :announcement="announcement">{{ announcement?.message ?? '' }}</slot>
    </span>
  </div>
</template>
