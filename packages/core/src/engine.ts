import { getAccessibleDescription, getAccessibleSteps } from './accessibility.js';
import { createFeedbackController, type FeedbackController } from './feedback.js';
import { generateTrackPath } from './generator.js';
import { createGestureStateMachine, type GestureStateMachine } from './machine.js';
import type {
  AccessibleStep,
  EngineOptions,
  InputModality,
  FeedbackOptions,
  GeneratorOptions,
  GestureState,
  Point2D,
  TrackPath
} from './types.js';

export interface HeelslideEngineOptions extends EngineOptions {
  track?: TrackPath;
}

export class HeelslideEngine {
  private options: HeelslideEngineOptions;
  private track: TrackPath;
  private machine: GestureStateMachine;
  private feedback: FeedbackController;

  constructor(options: HeelslideEngineOptions = {}) {
    this.options = options;

    this.feedback = createFeedbackController({
      haptics: options.haptics,
      sound: options.sound
    });

    if (options.track) {
      this.track = options.track;
    } else {
      const generatorOpts: GeneratorOptions = options.generator ?? {
        bounds: { width: 300, height: 150 },
        gridStep: 24,
        margin: 16,
        heels: 2
      };
      this.track = generateTrackPath(generatorOpts);
    }

    this.machine = this.createMachine();
  }

  private createMachine(): GestureStateMachine {
    return createGestureStateMachine(this.track, {
      tolerance: this.options.tolerance ?? 24,
      segmented: this.options.segmented,
      checkpointTimeoutMs: this.options.checkpointTimeoutMs,
      initialState: this.options.initialState,
      initialProgress: this.options.initialProgress,
      onTurn: this.options.onTurn,
      onCheckpoint: this.options.onCheckpoint,
      onUnlock: this.options.onUnlock,
      onReset: this.options.onReset,
      onProgress: this.options.onProgress,
      onStateChange: this.options.onStateChange,
      onAnnouncement: this.options.onAnnouncement,
      accessible: this.options.accessible,
      feedback: this.feedback
    });
  }

  public getPath(): TrackPath {
    return this.track;
  }

  public getState(): GestureState {
    return this.machine.getState();
  }

  public getProgress(): number {
    return this.machine.getProgress();
  }

  public getCurrentSegmentIndex(): number {
    return this.machine.getCurrentSegmentIndex();
  }

  public startGesture(point: Point2D): boolean {
    void this.feedback.resumeAudio();
    return this.machine.start(point);
  }

  public updateGesture(point: Point2D): void {
    this.machine.update(point);
  }

  public endGesture(): void {
    this.machine.end();
  }

  public cancelGesture(): void {
    this.machine.cancel();
  }

  public reset(): void {
    this.machine.reset();
  }

  /**
   * Which input most recently drove progress. Under `keyboard`, the segmented checkpoint
   * inactivity timer is suspended, since timing keyboard operation fails WCAG 2.2 SC 2.2.1.
   */
  public getInputModality(): InputModality {
    return this.machine.getInputModality();
  }

  /** Default fraction of total path length advanced per step. */
  private get stepIncrement(): number {
    const configured = this.options.accessible?.stepIncrement;
    return typeof configured === 'number' && configured > 0 ? configured : 0.1;
  }

  /**
   * Advances along the path by a fraction of total length. Progress only — unlock is reached
   * through `endGesture()`, the same transition pointer release uses.
   */
  public stepForward(amount?: number): number {
    return this.machine.step(amount ?? this.stepIncrement);
  }

  /** Retreats along the path, flooring at the start. */
  public stepBackward(amount?: number): number {
    return this.machine.step(-(amount ?? this.stepIncrement));
  }

  /** Advances to the next heel vertex, for efficient stepped navigation. */
  public stepToNextHeel(): number {
    return this.machine.stepToNextHeel();
  }

  /** One step descriptor per segment of the active track. */
  public getAccessibleSteps(): AccessibleStep[] {
    return getAccessibleSteps(this.track);
  }

  /** Single-sentence summary of the active track, suitable for `aria-describedby`. */
  public getAccessibleDescription(): string {
    return getAccessibleDescription(this.track);
  }

  public getFeedbackController(): FeedbackController {
    return this.feedback;
  }

  public setFeedbackOptions(options: FeedbackOptions): void {
    this.feedback.setOptions(options);
  }

  public destroy(): void {
    this.machine.destroy?.();
    this.feedback.destroy();
  }

  public regeneratePath(overrideOptions?: Partial<GeneratorOptions>): TrackPath {
    const currentGeneratorOpts: GeneratorOptions = this.options.generator ?? {
      bounds: { width: 300, height: 150 },
      gridStep: 24,
      margin: 16,
      heels: 2
    };

    const mergedOptions: GeneratorOptions = {
      ...currentGeneratorOpts,
      ...overrideOptions
    };

    this.options.generator = mergedOptions;
    this.track = generateTrackPath(mergedOptions);

    // Retire the superseded machine first: an armed checkpoint timer would otherwise survive and
    // fire onReset against a machine that is no longer in use.
    this.machine.destroy?.();
    this.machine = this.createMachine();

    return this.track;
  }
}
