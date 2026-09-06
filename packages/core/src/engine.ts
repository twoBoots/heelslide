import { createFeedbackController, type FeedbackController } from './feedback.js';
import { generateTrackPath } from './generator.js';
import { createGestureStateMachine, type GestureStateMachine } from './machine.js';
import type {
  EngineOptions,
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
      onTurn: this.options.onTurn,
      onUnlock: this.options.onUnlock,
      onReset: this.options.onReset,
      onProgress: this.options.onProgress,
      onStateChange: this.options.onStateChange,
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

  public getFeedbackController(): FeedbackController {
    return this.feedback;
  }

  public setFeedbackOptions(options: FeedbackOptions): void {
    this.feedback.setOptions(options);
  }

  public destroy(): void {
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
    this.machine = this.createMachine();

    return this.track;
  }
}
