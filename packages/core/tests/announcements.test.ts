import { describe, it, expect, vi } from 'vitest';
import { HeelslideEngine } from '../src/engine.js';
import { createDefaultAnnouncementMessage } from '../src/accessibility.js';
import type { AccessibleAnnouncement, TrackPath } from '../src/types.js';

/**
 * Structured announcement lifecycle feeding the adapters' polite live regions.
 *
 * Partially derived from the superseded `accessibility-fallback` branch; see
 * `.cooper/active/accessibility-keyboard-nav/harvest/AUDIT.md`.
 */

const track: TrackPath = {
  points: [
    { x: 10, y: 10 },
    { x: 110, y: 10 },
    { x: 110, y: 110 },
    { x: 210, y: 110 }
  ],
  segments: [
    { start: { x: 10, y: 10 }, end: { x: 110, y: 10 }, direction: 'horizontal', length: 100 },
    { start: { x: 110, y: 10 }, end: { x: 110, y: 110 }, direction: 'vertical', length: 100 },
    { start: { x: 110, y: 110 }, end: { x: 210, y: 110 }, direction: 'horizontal', length: 100 }
  ],
  totalLength: 300,
  heelCount: 2
};

function collect() {
  const announcements: AccessibleAnnouncement[] = [];
  const onAnnouncement = vi.fn((a: AccessibleAnnouncement) => {
    announcements.push(a);
  });
  return { announcements, onAnnouncement };
}

const typesOf = (list: AccessibleAnnouncement[]) => list.map((a) => a.type);

describe('announcement lifecycle', () => {
  it('announces when a pointer gesture starts', () => {
    const { announcements, onAnnouncement } = collect();
    const engine = new HeelslideEngine({ track, onAnnouncement });

    engine.startGesture({ x: 10, y: 10 });

    expect(typesOf(announcements)).toContain('start');
  });

  it('announces each step', () => {
    const { announcements, onAnnouncement } = collect();
    const engine = new HeelslideEngine({ track, onAnnouncement });

    engine.stepForward(0.1);

    expect(typesOf(announcements)).toContain('step');
  });

  it('announces reaching a heel vertex while stepping', () => {
    const { announcements, onAnnouncement } = collect();
    const engine = new HeelslideEngine({ track, onAnnouncement });

    engine.stepForward(0.2);
    expect(typesOf(announcements)).not.toContain('heel_reached');

    engine.stepForward(0.3);
    expect(typesOf(announcements)).toContain('heel_reached');
  });

  it('announces the unlock', () => {
    const { announcements, onAnnouncement } = collect();
    const engine = new HeelslideEngine({ track, onAnnouncement });

    engine.stepForward(5);
    engine.endGesture();

    expect(typesOf(announcements)).toContain('unlock');
  });

  it('announces a reset', () => {
    const { announcements, onAnnouncement } = collect();
    const engine = new HeelslideEngine({ track, onAnnouncement });

    engine.stepForward(0.4);
    engine.reset();

    expect(typesOf(announcements)).toContain('reset');
  });

  it('carries type, message, progress and timestamp on every announcement', () => {
    const { announcements, onAnnouncement } = collect();
    const engine = new HeelslideEngine({ track, onAnnouncement });

    engine.stepForward(0.3);
    const announcement = announcements.at(-1);

    expect(announcement).toBeDefined();
    expect(typeof announcement?.type).toBe('string');
    expect(announcement?.message.length).toBeGreaterThan(0);
    expect(announcement?.progress).toBeCloseTo(0.3, 5);
    expect(typeof announcement?.timestamp).toBe('number');
  });

  it('reports progress consistent with the engine at announcement time', () => {
    const { announcements, onAnnouncement } = collect();
    const engine = new HeelslideEngine({ track, onAnnouncement });

    engine.stepForward(0.5);

    expect(announcements.at(-1)?.progress).toBeCloseTo(engine.getProgress(), 10);
  });
});

describe('announcement configuration', () => {
  it('applies a custom message for an overridden type', () => {
    const { announcements, onAnnouncement } = collect();
    const engine = new HeelslideEngine({
      track,
      onAnnouncement,
      accessible: {
        announceMessages: {
          step: (context) => `custom step at ${Math.round(context.progress * 100)}`
        }
      }
    });

    engine.stepForward(0.25);

    const step = announcements.find((a) => a.type === 'step');
    expect(step?.message).toBe('custom step at 25');
  });

  it('leaves non-overridden types on their default message', () => {
    const { announcements, onAnnouncement } = collect();
    const engine = new HeelslideEngine({
      track,
      onAnnouncement,
      accessible: { announceMessages: { step: () => 'overridden' } }
    });

    engine.stepForward(0.4);
    engine.reset();

    const reset = announcements.find((a) => a.type === 'reset');
    expect(reset?.message).not.toBe('overridden');
    expect(reset?.message.length).toBeGreaterThan(0);
  });

  it('suppresses all announcements when accessibility is disabled', () => {
    const { announcements, onAnnouncement } = collect();
    const engine = new HeelslideEngine({
      track,
      onAnnouncement,
      accessible: { enabled: false }
    });

    engine.stepForward(0.3);
    engine.stepForward(0.3);
    engine.endGesture();
    engine.reset();

    expect(announcements).toHaveLength(0);
    expect(onAnnouncement).not.toHaveBeenCalled();
  });

  it('still advances progress when announcements are disabled', () => {
    const engine = new HeelslideEngine({ track, accessible: { enabled: false } });

    engine.stepForward(0.3);

    expect(engine.getProgress()).toBeCloseTo(0.3, 5);
  });

  it('is inert when no onAnnouncement callback is supplied', () => {
    const engine = new HeelslideEngine({ track });

    expect(() => {
      engine.stepForward(0.3);
      engine.reset();
    }).not.toThrow();
  });
});

describe('createDefaultAnnouncementMessage', () => {
  const types = [
    'start',
    'step',
    'heel_reached',
    'checkpoint',
    'unlock',
    'reset'
  ] as const;

  it.each(types)('produces a non-empty message for "%s"', (type) => {
    const message = createDefaultAnnouncementMessage(type, {
      progress: 0.5,
      currentSegmentIndex: 1,
      totalSegments: 3
    });

    expect(message.length).toBeGreaterThan(0);
  });

  it('includes the progress percentage where relevant', () => {
    expect(createDefaultAnnouncementMessage('step', { progress: 0.42 })).toContain('42');
  });

  it('distinguishes a confirmed checkpoint from a plain heel arrival', () => {
    const heel = createDefaultAnnouncementMessage('heel_reached', {
      progress: 0.33,
      currentSegmentIndex: 1
    });
    const checkpoint = createDefaultAnnouncementMessage('checkpoint', {
      progress: 0.33,
      currentSegmentIndex: 1
    });

    expect(checkpoint).not.toBe(heel);
    expect(checkpoint.toLowerCase()).toContain('checkpoint');
  });
});
