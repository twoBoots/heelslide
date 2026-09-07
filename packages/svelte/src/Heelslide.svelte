<script lang="ts">
import { onDestroy } from 'svelte';
import type { Point2D } from '@heelslide/core';
import type { HeelslideProps } from './types.js';
import { createHeelslide } from './createHeelslide.svelte.js';
import './style.css';

let {
  track: propTrack,
  heels = 2,
  tolerance = 24,
  bounds = { width: 300, height: 150 },
  gridStep = 24,
  margin = 16,
  seed,
  disabled = false,
  segmented = false,
  checkpointTimeoutMs = 0,
  ariaLabel = 'Slide to unlock',
  class: customClass = '',
  numberedHeels = false,
  haptics,
  sound,
  onturn,
  onTurn,
  oncheckpoint,
  onCheckpoint,
  onunlock,
  onreset,
  onprogress,
  onstatechange,
  onUnlock,
  onReset,
  onProgress,
  onStateChange,
  children
}: HeelslideProps & { children?: any } = $props();

let containerRef: HTMLElement | null = $state(null);
let capturedPointerId: number | null = $state(null);

// svelte-ignore state_referenced_locally
const heelslide = createHeelslide({
  track: propTrack,
  tolerance,
  disabled,
  segmented,
  checkpointTimeoutMs,
  haptics,
  sound,
  generator: {
    bounds,
    gridStep,
    margin,
    heels,
    seed
  },
  containerElement: null,
  onTurn: (heelIndex) => {
    onturn?.(heelIndex);
    onTurn?.(heelIndex);
  },
  onCheckpoint: (heelIndex, progress) => {
    oncheckpoint?.(heelIndex, progress);
    onCheckpoint?.(heelIndex, progress);
  },
  onUnlock: () => {
    onunlock?.();
    onUnlock?.();
  },
  onReset: () => {
    onreset?.();
    onReset?.();
  },
  onProgress: (p) => {
    onprogress?.(p);
    onProgress?.(p);
  },
  onStateChange: (s) => {
    onstatechange?.(s);
    onStateChange?.(s);
  }
});

// Sync container element with composable
$effect(() => {
  heelslide.setContainerElement(containerRef);
});

function pointsToSvgPath(points: readonly Point2D[]): string {
  if (points.length === 0) return '';
  const [first, ...rest] = points;
  return `M ${first!.x} ${first!.y} ${rest.map((p) => `L ${p.x} ${p.y}`).join(' ')}`.trim();
}

const bgPathD = $derived(pointsToSvgPath(heelslide.track.points));

const progressPathD = $derived.by(() => {
  if (heelslide.progress <= 0) {
    const startPt = heelslide.track.points[0];
    if (!startPt) return '';
    return `M ${startPt.x} ${startPt.y} L ${startPt.x} ${startPt.y}`;
  }

  const traversedPoints = heelslide.track.points.slice(0, heelslide.currentSegmentIndex + 1);
  const pathPoints = [...traversedPoints, heelslide.handlePosition];
  return pointsToSvgPath(pathPoints);
});

const heelMarkers = $derived.by(() => {
  if (heelslide.track.points.length <= 2) return [];
  return heelslide.track.points.slice(1, -1);
});

const destinationPoint = $derived.by(() => {
  return heelslide.track.points[heelslide.track.points.length - 1];
});

const isGoalTarget = $derived(
  heelslide.track.points.length > 0 && heelslide.currentSegmentIndex >= heelslide.track.points.length - 2
);

const viewBox = $derived(`0 0 ${bounds.width} ${bounds.height}`);

function handlePointerDown(event: PointerEvent): void {
  if (disabled) return;

  const target = event.currentTarget as Element | null;
  if (target && typeof target.setPointerCapture === 'function') {
    try {
      target.setPointerCapture(event.pointerId);
      capturedPointerId = event.pointerId;
    } catch {
      // Ignore pointer capture error in tests
    }
  }

  heelslide.startGesture(event);
}

function handlePointerMove(event: PointerEvent): void {
  if (disabled || !heelslide.isDragging) return;
  heelslide.updateGesture(event);
}

function handlePointerUp(event: PointerEvent): void {
  if (disabled) return;

  const target = event.currentTarget as Element | null;
  if (target && capturedPointerId !== null && typeof target.releasePointerCapture === 'function') {
    try {
      target.releasePointerCapture(capturedPointerId);
    } catch {
      // Ignore pointer release error
    }
    capturedPointerId = null;
  }

  if (heelslide.isDragging) {
    heelslide.endGesture();
  }
}

function handlePointerCancel(event: PointerEvent): void {
  if (disabled) return;

  const target = event.currentTarget as Element | null;
  if (target && capturedPointerId !== null && typeof target.releasePointerCapture === 'function') {
    try {
      target.releasePointerCapture(capturedPointerId);
    } catch {
      // Ignore pointer release error
    }
    capturedPointerId = null;
  }

  if (heelslide.isDragging) {
    heelslide.cancelGesture();
  }
}

onDestroy(() => {
  if (heelslide.isDragging) {
    heelslide.cancelGesture();
  }
  capturedPointerId = null;
  heelslide.destroy();
});

export function getHeelslide() {
  return heelslide;
}
</script>

<div
  bind:this={containerRef}
  class="heelslide-container {customClass} {disabled ? 'heelslide-disabled' : ''} {heelslide.isDragging ? 'heelslide-active' : ''} {heelslide.state === 'checkpoint' ? 'heelslide-checkpoint' : ''} {heelslide.state === 'unlocked' ? 'heelslide-unlocked' : ''}"
  data-disabled={disabled}
  data-state={heelslide.state}
  data-heelslide-container
  style="--heelslide-width: {bounds.width}px; --heelslide-height: {bounds.height}px;"
>
  <svg
    class="heelslide-svg"
    viewBox={viewBox}
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Background track -->
    <path
      class="heelslide-track-bg"
      d={bgPathD}
    />

    <!-- Progress path overlay -->
    <path
      class="heelslide-track-progress"
      d={progressPathD}
    />

    <!-- Heel turn markers -->
    {#each heelMarkers as marker, index (`heel-${index}`)}
      <g
        class="heelslide-heel-group"
        class:heelslide-target={heelslide.currentSegmentIndex === index}
        class:heelslide-cleared={heelslide.currentSegmentIndex > index}
        data-heelslide-heel={index + 1}
        data-target={heelslide.currentSegmentIndex === index ? 'true' : 'false'}
      >
        <!-- Clearance buffer ring -->
        <circle
          class="heelslide-heel-buffer"
          cx={marker.x}
          cy={marker.y}
        />
        <!-- Heel marker circle -->
        <circle
          class="heelslide-heel-marker"
          cx={marker.x}
          cy={marker.y}
        />
        <!-- Numbered heel text label -->
        {#if numberedHeels}
          <text
            class="heelslide-heel-text"
            x={marker.x}
            y={marker.y}
            text-anchor="middle"
            dominant-baseline="central"
          >{index + 1}</text>
        {/if}
      </g>
    {/each}

    <!-- Destination end marker -->
    {#if destinationPoint}
      <g
        class="heelslide-goal-group"
        class:heelslide-target={isGoalTarget}
        data-target={isGoalTarget ? 'true' : 'false'}
      >
        <circle
          class="heelslide-end-marker"
          cx={destinationPoint.x}
          cy={destinationPoint.y}
        />
      </g>
    {/if}

    <!-- Draggable Handle -->
    <g
      class="heelslide-handle"
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(heelslide.progress * 100)}
      aria-disabled={disabled}
      tabindex="0"
      onpointerdown={handlePointerDown}
      onpointermove={handlePointerMove}
      onpointerup={handlePointerUp}
      onpointercancel={handlePointerCancel}
    >
      <circle
        class="heelslide-handle-circle"
        cx={heelslide.handlePosition.x}
        cy={heelslide.handlePosition.y}
      />
      {#if children}
        {@render children()}
      {/if}
    </g>
  </svg>
</div>
