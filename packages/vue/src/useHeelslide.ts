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
  const announcement = ref<string | null>(null);
  const isFallbackOpen = ref<boolean>(false);
  const accessibleFallback = options.accessibleFallback ?? 'stepped';

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
    },
    onAnnouncement: (ann) => {
      announcement.value = ann.message;
      options.onAnnouncement?.(ann);
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
  announcement.value = engine.getAccessibleDescription();

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
    if (options.disabled) return false;
    const pt = extractPoint(pointOrEvent, options.containerRef);
    lastPoint.value = pt;
    const started = engine.startGesture(pt);
    syncFromEngine();
    return started;
  }

  function updateGesture(pointOrEvent: Point2D | PointerEvent): void {
    if (options.disabled) return;
    const pt = extractPoint(pointOrEvent, options.containerRef);
    lastPoint.value = pt;
    engine.updateGesture(pt);
    syncFromEngine();
  }

  function endGesture(): void {
    if (options.disabled) return;
    engine.endGesture();
    syncFromEngine();
  }

  function cancelGesture(): void {
    if (options.disabled) return;
    engine.cancelGesture();
    syncFromEngine();
  }

  function reset(): void {
    engine.reset();
    syncFromEngine();
    isFallbackOpen.value = false;
  }

  function openFallback(): void {
    isFallbackOpen.value = true;
  }

  function closeFallback(): void {
    isFallbackOpen.value = false;
  }

  function confirmFallback(): void {
    isFallbackOpen.value = false;
    state.value = 'unlocked';
    progress.value = 1;
    announcement.value = 'Security gate unlocked successfully.';
    options.onUnlock?.();
  }

  function stepForward(amount?: number): number {
    if (options.disabled) return progress.value;
    const newProg = engine.stepForward(amount);
    syncFromEngine();
    return newProg;
  }

  function stepBackward(amount?: number): number {
    if (options.disabled) return progress.value;
    const newProg = engine.stepBackward(amount);
    syncFromEngine();
    return newProg;
  }

  function stepToNextHeel(): number {
    if (options.disabled) return progress.value;
    const newProg = engine.stepToNextHeel();
    syncFromEngine();
    return newProg;
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (options.disabled) return;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        event.preventDefault();
        stepForward();
        break;
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        event.preventDefault();
        stepBackward();
        break;
      }
      case 'Home': {
        event.preventDefault();
        reset();
        break;
      }
      case 'Escape': {
        event.preventDefault();
        if (isFallbackOpen.value) {
          closeFallback();
        } else {
          reset();
        }
        break;
      }
      case ' ':
      case 'Enter': {
        event.preventDefault();
        if (isFallbackOpen.value) {
          confirmFallback();
        } else if (state.value === 'idle' && accessibleFallback === 'dialog') {
          openFallback();
        } else if (progress.value >= 0.95 || state.value === 'active') {
          stepForward();
        }
        break;
      }
      case 'End': {
        event.preventDefault();
        break;
      }
      default:
        break;
    }
  }

  function regeneratePath(overrideOptions?: Partial<GeneratorOptions>): TrackPath {
    const newTrack = engine.regeneratePath(overrideOptions);
    track.value = newTrack;
    syncFromEngine();
    lastPoint.value = { ...newTrack.points[0]! };
    isFallbackOpen.value = false;
    announcement.value = engine.getAccessibleDescription();
    return newTrack;
  }

  return {
    state: readonly(state),
    progress: readonly(progress),
    track: shallowReadonly(track),
    currentSegmentIndex: readonly(currentSegmentIndex),
    handlePosition,
    isDragging,
    announcement: readonly(announcement),
    isFallbackOpen: readonly(isFallbackOpen),
    startGesture,
    updateGesture,
    endGesture,
    cancelGesture,
    reset,
    regeneratePath,
    stepForward,
    stepBackward,
    stepToNextHeel,
    handleKeyDown,
    openFallback,
    closeFallback,
    confirmFallback
  };
}
