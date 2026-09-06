import type {
  FeedbackOptions,
  HapticPatterns,
  SoundFrequencies
} from './types.js';

export const DEFAULT_HAPTIC_PATTERNS: Required<HapticPatterns> = {
  turn: 15,
  reset: [40, 60, 40],
  unlock: [30, 50, 80]
};

export const DEFAULT_SOUND_FREQUENCIES: Required<SoundFrequencies> = {
  turn: 880,
  reset: 180,
  unlock: [523.25, 659.25, 783.99]
};

export const DEFAULT_SOUND_VOLUME = 0.3;

function getAudioContextConstructor(): typeof AudioContext | undefined {
  if (typeof window !== 'undefined') {
    return (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    );
  }
  if (typeof globalThis !== 'undefined') {
    return (
      globalThis.AudioContext ||
      (globalThis as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    );
  }
  return undefined;
}

export class FeedbackController {
  private options: FeedbackOptions;
  private audioCtx: AudioContext | null = null;

  constructor(options: FeedbackOptions = {}) {
    this.options = { ...options };
  }

  public getOptions(): FeedbackOptions {
    return { ...this.options };
  }

  public setOptions(options: FeedbackOptions): void {
    this.options = {
      ...this.options,
      ...options
    };
  }

  public isHapticsSupported(): boolean {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  public isAudioSupported(): boolean {
    return getAudioContextConstructor() !== undefined;
  }

  public async resumeAudio(): Promise<void> {
    try {
      const ctx = this.getOrCreateAudioContext();
      if (ctx && ctx.state === 'suspended') {
        await ctx.resume();
      }
    } catch {
      // AudioContext resume failed or unsupported; degrade silently
    }
  }

  public triggerTurn(): void {
    this.playHaptic('turn');
    this.playAudioTurn();
  }

  public triggerReset(): void {
    this.playHaptic('reset');
    this.playAudioReset();
  }

  public triggerUnlock(): void {
    this.playHaptic('unlock');
    this.playAudioUnlock();
  }

  public destroy(): void {
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        void this.audioCtx.close();
      } catch {
        // Silently handle close errors
      }
      this.audioCtx = null;
    }
  }

  private isHapticsEnabled(): boolean {
    if (this.options.haptics === undefined) return false;
    if (typeof this.options.haptics === 'boolean') return this.options.haptics;
    return this.options.haptics.enabled ?? true;
  }

  private getHapticPatterns(): Required<HapticPatterns> {
    const customPatterns =
      typeof this.options.haptics === 'object' && this.options.haptics !== null
        ? this.options.haptics.patterns
        : undefined;

    return {
      turn: customPatterns?.turn ?? DEFAULT_HAPTIC_PATTERNS.turn,
      reset: customPatterns?.reset ?? DEFAULT_HAPTIC_PATTERNS.reset,
      unlock: customPatterns?.unlock ?? DEFAULT_HAPTIC_PATTERNS.unlock
    };
  }

  private playHaptic(type: 'turn' | 'reset' | 'unlock'): void {
    if (!this.isHapticsEnabled()) return;

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        const patterns = this.getHapticPatterns();
        navigator.vibrate(patterns[type]);
      }
    } catch {
      // Gracefully ignore vibration errors
    }
  }

  private isSoundEnabled(): boolean {
    if (this.options.sound === undefined) return false;
    if (typeof this.options.sound === 'boolean') return this.options.sound;
    return this.options.sound.enabled ?? true;
  }

  private getSoundVolume(): number {
    if (typeof this.options.sound === 'object' && this.options.sound !== null) {
      if (typeof this.options.sound.volume === 'number') {
        return Math.max(0, Math.min(1, this.options.sound.volume));
      }
    }
    return DEFAULT_SOUND_VOLUME;
  }

  private getSoundFrequencies(): Required<SoundFrequencies> {
    const customFrequencies =
      typeof this.options.sound === 'object' && this.options.sound !== null
        ? this.options.sound.frequencies
        : undefined;

    return {
      turn: customFrequencies?.turn ?? DEFAULT_SOUND_FREQUENCIES.turn,
      reset: customFrequencies?.reset ?? DEFAULT_SOUND_FREQUENCIES.reset,
      unlock: customFrequencies?.unlock ?? DEFAULT_SOUND_FREQUENCIES.unlock
    };
  }

  private getOrCreateAudioContext(): AudioContext | null {
    if (this.audioCtx) return this.audioCtx;

    const Ctor = getAudioContextConstructor();
    if (!Ctor) return null;

    try {
      this.audioCtx = new Ctor();
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  private playAudioTurn(): void {
    if (!this.isSoundEnabled()) return;

    try {
      const ctx = this.getOrCreateAudioContext();
      if (!ctx) return;

      const freqs = this.getSoundFrequencies();
      const volume = this.getSoundVolume();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freqs.turn, now);

      // Gain Envelope: Attack 2ms to peak volume (0.15 * volume), exponential decay to 0.001 over 33ms
      const peak = Math.max(0.0001, 0.15 * volume);
      gain.gain.setValueAtTime(0.0001, now);
      if (typeof gain.gain.linearRampToValueAtTime === 'function') {
        gain.gain.linearRampToValueAtTime(peak, now + 0.002);
      }
      if (typeof gain.gain.exponentialRampToValueAtTime === 'function') {
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Audio playback safely ignored on failure
    }
  }

  private playAudioReset(): void {
    if (!this.isSoundEnabled()) return;

    try {
      const ctx = this.getOrCreateAudioContext();
      if (!ctx) return;

      const freqs = this.getSoundFrequencies();
      const volume = this.getSoundVolume();
      const now = ctx.currentTime;
      const duration = 0.12;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freqs.reset, now);
      if (typeof osc.frequency.linearRampToValueAtTime === 'function') {
        osc.frequency.linearRampToValueAtTime(110, now + duration);
      }

      // Gain: Peak volume (0.25 * volume), fast linear fade-out to 0.001
      const peak = Math.max(0.0001, 0.25 * volume);
      gain.gain.setValueAtTime(peak, now);
      if (typeof gain.gain.linearRampToValueAtTime === 'function') {
        gain.gain.linearRampToValueAtTime(0.001, now + duration);
      }

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Audio playback safely ignored on failure
    }
  }

  private playAudioUnlock(): void {
    if (!this.isSoundEnabled()) return;

    try {
      const ctx = this.getOrCreateAudioContext();
      if (!ctx) return;

      const freqs = this.getSoundFrequencies();
      const volume = this.getSoundVolume();
      const baseNow = ctx.currentTime;

      // Multi-tone ascending major triad arpeggio:
      // Note 1: 523.25 Hz at offset 0ms (duration 80ms)
      // Note 2: 659.25 Hz at offset 70ms (duration 80ms)
      // Note 3: 783.99 Hz at offset 140ms (duration 180ms)
      const notes = [
        { freq: freqs.unlock[0] ?? 523.25, offset: 0, duration: 0.08 },
        { freq: freqs.unlock[1] ?? 659.25, offset: 0.07, duration: 0.08 },
        { freq: freqs.unlock[2] ?? 783.99, offset: 0.14, duration: 0.18 }
      ];

      for (const note of notes) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = baseNow + note.offset;
        const endTime = startTime + note.duration;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, startTime);

        const peak = Math.max(0.0001, 0.2 * volume);
        gain.gain.setValueAtTime(0.0001, startTime);
        if (typeof gain.gain.linearRampToValueAtTime === 'function') {
          gain.gain.linearRampToValueAtTime(peak, startTime + 0.01);
        }
        if (typeof gain.gain.exponentialRampToValueAtTime === 'function') {
          gain.gain.exponentialRampToValueAtTime(0.001, endTime);
        }

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(endTime);
      }
    } catch {
      // Audio playback safely ignored on failure
    }
  }
}

export function createFeedbackController(options?: FeedbackOptions): FeedbackController {
  return new FeedbackController(options);
}
