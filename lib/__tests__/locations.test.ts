import { describe, test, expect } from 'bun:test';
import { distanceInMeters } from '../locations';

describe('distanceInMeters (Haversine)', () => {
  test('zero distance for same coordinate', () => {
    const p = { lat: 10, lon: 20 };
    expect(distanceInMeters(p, p)).toBe(0);
  });

	let loc1 = "17.654054, 121.743537"

  test('approx SF -> LA distance', () => {
    const sf = { lat: 37.7749, lon: -122.4194 };
    const la = { lat: 34.0522, lon: -118.2437 };
    const d = distanceInMeters(sf, la);
    // Expect ~559 km; allow a reasonable range
    expect(d).toBeGreaterThan(550_000);
    expect(d).toBeLessThan(570_000);
  });

  test('small latitude delta (~0.01°)', () => {
    const a = { lat: 0, lon: 0 };
    const b = { lat: 0.01, lon: 0 };
    const d = distanceInMeters(a, b);
    // ~1,111 meters per 0.01 degree latitude
    expect(d).toBeGreaterThan(1100);
    expect(d).toBeLessThan(1125);
  });
});
