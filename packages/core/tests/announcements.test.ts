import { describe, it, expect, vi } from 'vitest';
import { HeelslideEngine } from '../src/engine.js';
import type { TrackPath } from '../src/types.js';

describe('Accessibility Announcements & Event Lifecycle (@heelslide/core)', () => {
  const mockTrack: TrackPath = {
    points: [
      { x: 10, y: 10 },
      { x: 110, y: 10 },
      { x: 110, y: 110 },
      { x: 210, y: 110 }
    ],
    segments: [
      {
        start: { x: 10, y: 10 },
        end: { x: 110, y: 10 },
        direction: 'horizontal',
        length: 100
      },
      {
        start: { x: 110, y: 10 },
        end: { x: 110, y: 110 },
        direction: 'vertical',
        length: 100
      },
      {
        start: { x: 110, y: 110 },
        end: { x: 210, y: 110 },
        direction: 'horizontal',
        length: 100
      }
    ],
    totalLength: 300,
    heelCount: 2
  };

  it('emits a "start" announcement when gesture starts or stepping starts', () => {
    const onAnnouncement = vi.fn();
    const engine = new HeelslideEngine({
      track: mockTrack,
      onAnnouncement
    });

    engine.startGesture({ x: 10, y: 10 });
    expect(onAnnouncement).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'start',
        progress: 0,
        message: expect.stringContaining('started')
      })
    );
  });

  it('emits "step" announcements during incremental stepping', () => {
    const onAnnouncement = vi.fn();
    const engine = new HeelslideEngine({
      track: mockTrack,
      onAnnouncement
    });

    engine.stepForward(0.1);
    expect(onAnnouncement).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'start'
      })
    );
    expect(onAnnouncement).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'step',
        progress: expect.closeTo(0.1)
      })
    );
  });

  it('emits a "heel_reached" announcement when a heel vertex is crossed', () => {
    const onAnnouncement = vi.fn();
    const engine = new HeelslideEngine({
      track: mockTrack,
      onAnnouncement
    });

    engine.stepToNextHeel();
    expect(onAnnouncement).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'heel_reached',
        progress: expect.closeTo(100 / 300),
        message: expect.stringMatching(/heel|turn/i)
      })
    );
  });

  it('emits an "unlock" announcement when completing the path', () => {
    const onAnnouncement = vi.fn();
    const engine = new HeelslideEngine({
      track: mockTrack,
      onAnnouncement
    });

    engine.stepForward(0.96);
    expect(onAnnouncement).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'unlock',
        progress: 1,
        message: expect.stringMatching(/unlock/i)
      })
    );
  });

  it('emits a "reset" announcement when gesture resets', () => {
    const onAnnouncement = vi.fn();
    const engine = new HeelslideEngine({
      track: mockTrack,
      onAnnouncement
    });

    engine.startGesture({ x: 10, y: 10 });
    onAnnouncement.mockClear();

    engine.reset();
    expect(onAnnouncement).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'reset',
        progress: 0,
        message: expect.stringMatching(/reset/i)
      })
    );
  });

  it('supports custom announcement messages via accessible.announceMessages', () => {
    const onAnnouncement = vi.fn();
    const engine = new HeelslideEngine({
      track: mockTrack,
      onAnnouncement,
      accessible: {
        announceMessages: {
          unlock: () => 'Custom Gate Unlocked!'
        }
      }
    });

    engine.stepForward(0.96);
    expect(onAnnouncement).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'unlock',
        message: 'Custom Gate Unlocked!'
      })
    );
  });

  it('suppresses announcements if accessible.enabled is false', () => {
    const onAnnouncement = vi.fn();
    const engine = new HeelslideEngine({
      track: mockTrack,
      onAnnouncement,
      accessible: {
        enabled: false
      }
    });

    engine.startGesture({ x: 10, y: 10 });
    engine.stepForward(0.5);
    engine.reset();
    expect(onAnnouncement).not.toHaveBeenCalled();
  });
});
