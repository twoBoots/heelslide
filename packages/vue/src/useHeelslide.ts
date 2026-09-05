import { ref, shallowRef, shallowReadonly, computed, readonly, type Ref } from 'vue';
import {
  HeelslideEngine,
  projectPointOnSegment,
  type GestureState,
  type GeneratorOptions,
  type Point2D,
  type TrackPath
} from '@heelslide/core';
import type { UseHeelslideOptions, UseHeelslideReturn } from './types.js';

function extractPoint(
  pointOrEvent: Point2D | PointerEvent,
  containerRef?: Ref<HTMLElement | null | undefined>
): Point2D {
  if ('clientX' in pointOrEvent) {
    const container = containerRef?.value;
    if (container) {
      const rect = container.getBoundingClientRect();
      return {
        x: pointOrEvent.clientX - rect.left,
        y: pointOrEvent.clientY - rect.top
      };
    }
    return {
      x: pointOrEvent.clientX,
      y: pointOrEvent.clientY
    };
  }
  return pointOrEvent;
}

export function useHeelslide(options: UseHeelslideOptions = {}): UseHeelslideReturn {
  const state = ref<GestureState>('idle');
  const progress = ref<number>(0);
  const currentSegmentIndex = ref<number>(0);

  const engine = new HeelslideEngine({
    ...options,
    onUnlock: () => {
      syncFromEngine();
      options.onUnlock?.();
    },
    onReset: () => {
      syncFromEngine();
      options.onReset?.();
    },
    onProgress: (p) => {
      progress.value = p;
      currentSegmentIndex.value = engine.getCurrentSegmentIndex();
      options.onProgress?.(p);
    },
    onStateChange: (s) => {
      state.value = s;
      options.onStateChange?.(s);
    }
  });

  const track = shallowRef<TrackPath>(engine.getPath());
  const lastPoint = ref<Point2D>({ ...track.value.points[0]! });

  function syncFromEngine(): void {
    state.value = engine.getState();
    progress.value = engine.getProgress();
    currentSegmentIndex.value = engine.getCurrentSegmentIndex();
    if (state.value === 'idle' || state.value === 'reset') {
      lastPoint.value = { ...track.value.points[0]! };
    } else if (state.value === 'unlocked') {
      lastPoint.value = { ...track.value.points[track.value.points.length - 1]! };
    }
  }

  // Initial sync
  syncFromEngine();

  const isDragging = computed(() => state.value === 'active');

  const handlePosition = computed<Point2D>(() => {
    if (state.value === 'idle' || state.value === 'reset') {
      return track.value.points[0]!;
    }
    if (state.value === 'unlocked') {
      return track.value.points[track.value.points.length - 1]!;
    }

    const segments = track.value.segments;
    const segIdx = currentSegmentIndex.value;
    const currentSegment = segments[segIdx];
    if (currentSegment) {
      const projection = projectPointOnSegment(lastPoint.value, currentSegment);
      return projection.point;
    }
    return lastPoint.value;
  });

  function startGesture(pointOrEvent: Point2D | PointerEvent): boolean {
    const pt = extractPoint(pointOrEvent, options.containerRef);
    lastPoint.value = pt;
    const started = engine.startGesture(pt);
    syncFromEngine();
    return started;
  }

  function updateGesture(pointOrEvent: Point2D | PointerEvent): void {
    const pt = extractPoint(pointOrEvent, options.containerRef);
    lastPoint.value = pt;
    engine.updateGesture(pt);
    syncFromEngine();
  }

  function endGesture(): void {
    engine.endGesture();
    syncFromEngine();
  }

  function cancelGesture(): void {
    engine.cancelGesture();
    syncFromEngine();
  }

  function reset(): void {
    engine.reset();
    syncFromEngine();
  }

  function regeneratePath(overrideOptions?: Partial<GeneratorOptions>): TrackPath {
    const newTrack = engine.regeneratePath(overrideOptions);
    track.value = newTrack;
    syncFromEngine();
    lastPoint.value = { ...newTrack.points[0]! };
    return newTrack;
  }

  return {
    state: readonly(state),
    progress: readonly(progress),
    track: shallowReadonly(track),
    currentSegmentIndex: readonly(currentSegmentIndex),
    handlePosition,
    isDragging,
    startGesture,
    updateGesture,
    endGesture,
    cancelGesture,
    reset,
    regeneratePath
  };
}
