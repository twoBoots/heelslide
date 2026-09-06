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
  ariaLabel: 'Slide to unlock'
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
  startGesture,
  updateGesture,
  endGesture,
  cancelGesture,
  reset,
  regeneratePath
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
  haptics: props.haptics,
  sound: props.sound,
  containerRef,
  onTurn: (heelIndex) => {
    emit('turn', heelIndex);
    props.onTurn?.(heelIndex);
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
  }
});

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
      'heelslide-unlocked': state === 'unlocked'
    }"
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
  </div>
</template>
