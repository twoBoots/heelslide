import {
  HeelslideEngine,
  projectPointOnSegment,
  type GeneratorOptions,
  type GestureState,
  type Point2D,
  type TrackPath
} from '@heelslide/core';
import type { CreateHeelslideOptions, CreateHeelslideReturn } from './types.js';

function extractPoint(
  pointOrEvent: Point2D | PointerEvent,
  container?: HTMLElement | null
): Point2D {
  if ('clientX' in pointOrEvent) {
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

export function createHeelslide(options: CreateHeelslideOptions = {}): CreateHeelslideReturn {
  let state = $state<GestureState>('idle');
  let progress = $state<number>(0);
  let currentSegmentIndex = $state<number>(0);
  let container = $state<HTMLElement | null>(options.containerElement ?? null);

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
      progress = p;
      currentSegmentIndex = engine.getCurrentSegmentIndex();
      options.onProgress?.(p);
    },
    onStateChange: (s) => {
      state = s;
      options.onStateChange?.(s);
    }
  });

  const initialTrack = engine.getPath();
  let track = $state<TrackPath>(initialTrack);
  let lastPoint = $state<Point2D>({ ...initialTrack.points[0]! });

  function syncFromEngine(): void {
    state = engine.getState();
    progress = engine.getProgress();
    currentSegmentIndex = engine.getCurrentSegmentIndex();
    if (state === 'idle' || state === 'reset') {
      lastPoint = { ...track.points[0]! };
    } else if (state === 'unlocked') {
      lastPoint = { ...track.points[track.points.length - 1]! };
    }
  }

  // Initial sync
  syncFromEngine();

  const isDragging = $derived(state === 'active');

  const handlePosition = $derived.by<Point2D>(() => {
    if (state === 'idle' || state === 'reset') {
      return track.points[0]!;
    }
    if (state === 'unlocked') {
      return track.points[track.points.length - 1]!;
    }

    const segments = track.segments;
    const currentSegment = segments[currentSegmentIndex];
    if (currentSegment) {
      const projection = projectPointOnSegment(lastPoint, currentSegment);
      return projection.point;
    }
    return lastPoint;
  });

  function startGesture(pointOrEvent: Point2D | PointerEvent): boolean {
    const pt = extractPoint(pointOrEvent, container);
    lastPoint = pt;
    const started = engine.startGesture(pt);
    syncFromEngine();
    return started;
  }

  function updateGesture(pointOrEvent: Point2D | PointerEvent): void {
    const pt = extractPoint(pointOrEvent, container);
    lastPoint = pt;
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
    track = newTrack;
    syncFromEngine();
    lastPoint = { ...newTrack.points[0]! };
    return newTrack;
  }

  function setContainerElement(element: HTMLElement | null): void {
    container = element;
  }

  return {
    get state() {
      return state;
    },
    get progress() {
      return progress;
    },
    get track() {
      return track;
    },
    get currentSegmentIndex() {
      return currentSegmentIndex;
    },
    get handlePosition() {
      return handlePosition;
    },
    get isDragging() {
      return isDragging;
    },
    startGesture,
    updateGesture,
    endGesture,
    cancelGesture,
    reset,
    regeneratePath,
    setContainerElement
  };
}
