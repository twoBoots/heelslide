import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FeedbackController, createFeedbackController } from '../src/feedback.js';

describe('FeedbackController', () => {
  let originalNavigator: unknown;
  let originalAudioContext: unknown;
  let mockVibrate: ReturnType<typeof vi.fn>;
  let mockAudioContext: any;
  let createdNodes: {
    oscillators: any[];
    gains: any[];
  };

  beforeEach(() => {
    createdNodes = { oscillators: [], gains: [] };

    mockVibrate = vi.fn().mockReturnValue(true);

    // Mock AudioContext and nodes
    mockAudioContext = {
      state: 'suspended',
      currentTime: 0,
      destination: {},
      resume: vi.fn().mockImplementation(async () => {
        mockAudioContext.state = 'running';
      }),
      close: vi.fn().mockImplementation(async () => {
        mockAudioContext.state = 'closed';
      }),
      createOscillator: vi.fn().mockImplementation(() => {
        const osc = {
          type: 'sine',
          frequency: {
            value: 440,
            setValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn()
          },
          connect: vi.fn(),
          disconnect: vi.fn(),
          start: vi.fn(),
          stop: vi.fn()
        };
        createdNodes.oscillators.push(osc);
        return osc;
      }),
      createGain: vi.fn().mockImplementation(() => {
        const gain = {
          gain: {
            value: 1,
            setValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn()
          },
          connect: vi.fn(),
          disconnect: vi.fn()
        };
        createdNodes.gains.push(gain);
        return gain;
      })
    };

    // Global mocks
    originalNavigator = globalThis.navigator;
    originalAudioContext = globalThis.AudioContext;

    // Define navigator with vibrate
    Object.defineProperty(globalThis, 'navigator', {
      value: {
        vibrate: mockVibrate
      },
      configurable: true,
      writable: true
    });

    // Define AudioContext
    Object.defineProperty(globalThis, 'AudioContext', {
      value: vi.fn().mockImplementation(() => mockAudioContext),
      configurable: true,
      writable: true
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true
    });
    Object.defineProperty(globalThis, 'AudioContext', {
      value: originalAudioContext,
      configurable: true,
      writable: true
    });
    vi.restoreAllMocks();
  });

  describe('Haptic Feedback (navigator.vibrate)', () => {
    it('does not trigger vibration when haptics is disabled by default', () => {
      const controller = createFeedbackController();
      controller.triggerTurn();
      controller.triggerReset();
      controller.triggerUnlock();

      expect(mockVibrate).not.toHaveBeenCalled();
    });

    it('triggers default vibration patterns when haptics: true', () => {
      const controller = createFeedbackController({ haptics: true });

      controller.triggerTurn();
      expect(mockVibrate).toHaveBeenLastCalledWith(15);

      controller.triggerReset();
      expect(mockVibrate).toHaveBeenLastCalledWith([40, 60, 40]);

      controller.triggerUnlock();
      expect(mockVibrate).toHaveBeenLastCalledWith([30, 50, 80]);
    });

    it('supports object configuration with enabled: true', () => {
      const controller = new FeedbackController({
        haptics: { enabled: true }
      });

      controller.triggerTurn();
      expect(mockVibrate).toHaveBeenCalledWith(15);
    });

    it('uses custom vibration pattern overrides', () => {
      const controller = new FeedbackController({
        haptics: {
          enabled: true,
          patterns: {
            turn: 25,
            reset: [50, 100, 50],
            unlock: [100, 50, 200]
          }
        }
      });

      controller.triggerTurn();
      expect(mockVibrate).toHaveBeenLastCalledWith(25);

      controller.triggerReset();
      expect(mockVibrate).toHaveBeenLastCalledWith([50, 100, 50]);

      controller.triggerUnlock();
      expect(mockVibrate).toHaveBeenLastCalledWith([100, 50, 200]);
    });

    it('gracefully handles absence of navigator.vibrate', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {},
        configurable: true,
        writable: true
      });

      const controller = new FeedbackController({ haptics: true });
      expect(() => {
        controller.triggerTurn();
        controller.triggerReset();
        controller.triggerUnlock();
      }).not.toThrow();
    });

    it('gracefully handles navigator.vibrate throwing an error', () => {
      mockVibrate.mockImplementation(() => {
        throw new Error('NotAllowedError');
      });

      const controller = new FeedbackController({ haptics: true });
      expect(() => {
        controller.triggerTurn();
        controller.triggerReset();
        controller.triggerUnlock();
      }).not.toThrow();
    });
  });

  describe('Audio Synthesis (Web Audio API)', () => {
    it('does not synthesize audio when sound is disabled by default', () => {
      const controller = createFeedbackController();
      controller.triggerTurn();
      controller.triggerReset();
      controller.triggerUnlock();

      expect(mockAudioContext.createOscillator).not.toHaveBeenCalled();
    });

    it('resumes suspended AudioContext on resumeAudio()', async () => {
      const controller = new FeedbackController({ sound: true });
      expect(mockAudioContext.state).toBe('suspended');

      await controller.resumeAudio();
      expect(mockAudioContext.resume).toHaveBeenCalled();
      expect(mockAudioContext.state).toBe('running');
    });

    it('synthesizes high-frequency tick on turn', () => {
      const controller = new FeedbackController({ sound: true });
      controller.triggerTurn();

      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1);
      expect(mockAudioContext.createGain).toHaveBeenCalledTimes(1);

      const osc = createdNodes.oscillators[0];
      const gain = createdNodes.gains[0];

      expect(osc.type).toBe('sine');
      expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(880, expect.any(Number));
      expect(osc.connect).toHaveBeenCalledWith(gain);
      expect(gain.connect).toHaveBeenCalledWith(mockAudioContext.destination);
      expect(osc.start).toHaveBeenCalled();
      expect(osc.stop).toHaveBeenCalled();
    });

    it('synthesizes low-frequency error tone with frequency glide on reset', () => {
      const controller = new FeedbackController({ sound: true });
      controller.triggerReset();

      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1);
      const osc = createdNodes.oscillators[0];

      expect(osc.type).toBe('sawtooth');
      expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(180, expect.any(Number));
      expect(osc.frequency.linearRampToValueAtTime).toHaveBeenCalledWith(110, expect.any(Number));
      expect(osc.start).toHaveBeenCalled();
      expect(osc.stop).toHaveBeenCalled();
    });

    it('synthesizes ascending harmonic triad on unlock', () => {
      const controller = new FeedbackController({ sound: true });
      controller.triggerUnlock();

      // Major triad arpeggio: 3 notes (523.25, 659.25, 783.99)
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3);
      expect(mockAudioContext.createGain).toHaveBeenCalledTimes(3);

      const freqs = createdNodes.oscillators.map((osc) => osc.frequency.setValueAtTime.mock.calls[0][0]);
      expect(freqs).toEqual([523.25, 659.25, 783.99]);
    });

    it('applies custom sound volume and frequencies', () => {
      const controller = new FeedbackController({
        sound: {
          enabled: true,
          volume: 0.5,
          frequencies: {
            turn: 1000,
            reset: 200,
            unlock: [400, 500, 600]
          }
        }
      });

      controller.triggerTurn();
      expect(createdNodes.oscillators[0].frequency.setValueAtTime).toHaveBeenCalledWith(1000, expect.any(Number));

      controller.triggerReset();
      expect(createdNodes.oscillators[1].frequency.setValueAtTime).toHaveBeenCalledWith(200, expect.any(Number));

      controller.triggerUnlock();
      expect(createdNodes.oscillators[2].frequency.setValueAtTime).toHaveBeenCalledWith(400, expect.any(Number));
      expect(createdNodes.oscillators[3].frequency.setValueAtTime).toHaveBeenCalledWith(500, expect.any(Number));
      expect(createdNodes.oscillators[4].frequency.setValueAtTime).toHaveBeenCalledWith(600, expect.any(Number));
    });

    it('gracefully handles missing AudioContext', () => {
      Object.defineProperty(globalThis, 'AudioContext', {
        value: undefined,
        configurable: true,
        writable: true
      });
      Object.defineProperty(globalThis, 'webkitAudioContext', {
        value: undefined,
        configurable: true,
        writable: true
      });

      const controller = new FeedbackController({ sound: true });
      expect(() => {
        controller.triggerTurn();
        controller.triggerReset();
        controller.triggerUnlock();
      }).not.toThrow();
    });

    it('gracefully handles AudioContext methods throwing errors', () => {
      mockAudioContext.createOscillator.mockImplementation(() => {
        throw new Error('AudioContext error');
      });

      const controller = new FeedbackController({ sound: true });
      expect(() => {
        controller.triggerTurn();
        controller.triggerReset();
        controller.triggerUnlock();
      }).not.toThrow();
    });
  });

  describe('Options management & Lifecycle', () => {
    it('updates options dynamically via setOptions', () => {
      const controller = new FeedbackController({ haptics: false, sound: false });

      controller.triggerTurn();
      expect(mockVibrate).not.toHaveBeenCalled();

      controller.setOptions({ haptics: true, sound: true });
      controller.triggerTurn();
      expect(mockVibrate).toHaveBeenCalledWith(15);
      expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1);

      const opts = controller.getOptions();
      expect(opts.haptics).toBe(true);
      expect(opts.sound).toBe(true);
    });

    it('cleans up AudioContext on destroy', () => {
      const controller = new FeedbackController({ sound: true });
      controller.triggerTurn();
      controller.destroy();
      expect(mockAudioContext.close).toHaveBeenCalled();
    });

    it('reports feature support accurately', () => {
      const controller = new FeedbackController();
      expect(controller.isHapticsSupported()).toBe(true);
      expect(controller.isAudioSupported()).toBe(true);
    });
  });
});
