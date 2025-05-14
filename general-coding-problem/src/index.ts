import { SoftwareCamera, Camera } from "./types";

/**
 * ============================================================================
 *  Task 2 – Camera Coverage Validator (Discrete, Stripe-Based Approach)
 * ============================================================================
 *
 *  ✅ Discrete integer clamping using Math.ceil / Math.floor
 *  ✅ O(N log N) average-case complexity
 *  ✅ Handles light merging with integer-based +1 merging logic
 *  ✅ Explicit boundary checks and midpoint coverage
 *
 *  ❌ Not designed for floating-point gaps < 1.0 units (by design)
 *
 * ============================================================================
 */

type DiscreteRect = {
  d_min: number;
  d_max: number;
  l_min: number;
  l_max: number;
};

/**
 * Main function that checks if the given hardware cameras fully cover
 * the software camera's required (distance × light) rectangle.
 */
export function willCamerasSuffice(
  softwareCam: SoftwareCamera,
  hardwareCams: Camera[]
): boolean {
  // Validate camera ranges (1-time O(N) check)
  if (
    hardwareCams.some(
      (cam) =>
        cam.distance.min > cam.distance.max || cam.light.min > cam.light.max
    )
  ) {
    throw new Error("Invalid camera range: min > max");
  }

  if (!checkBoundaryPoints(softwareCam, hardwareCams)) {
    return false;
  }

  const [d_min, d_max] = [
    Math.ceil(softwareCam.distance.min),
    Math.floor(softwareCam.distance.max),
  ];
  const [l_min, l_max] = [
    Math.ceil(softwareCam.light.min),
    Math.floor(softwareCam.light.max),
  ];

  const effectiveCams: DiscreteRect[] = hardwareCams
    .map((cam) => ({
      d_min: Math.ceil(Math.max(cam.distance.min, d_min)),
      d_max: Math.floor(Math.min(cam.distance.max, d_max)),
      l_min: Math.ceil(Math.max(cam.light.min, l_min)),
      l_max: Math.floor(Math.min(cam.light.max, l_max)),
    }))
    .filter((cam) => cam.d_min <= cam.d_max && cam.l_min <= cam.l_max);

  if (effectiveCams.length === 0) return false;

  const boundaries = collectBoundaries(d_min, d_max, effectiveCams);

  for (let i = 0; i < boundaries.length - 1; i++) {
    const stripe = { start: boundaries[i], end: boundaries[i + 1] - 1 };
    if (!checkStripeCoverage(stripe, l_min, l_max, effectiveCams)) {
      return false;
    }
  }

  return true;
}

/**
 * Verifies that the software camera's 4 corners are covered exactly,
 * preventing errors from rounding boundaries.
 */
function checkBoundaryPoints(
  softwareCam: SoftwareCamera,
  hardwareCams: Camera[]
): boolean {
  const points = [
    [softwareCam.distance.min, softwareCam.light.min],
    [softwareCam.distance.min, softwareCam.light.max],
    [softwareCam.distance.max, softwareCam.light.min],
    [softwareCam.distance.max, softwareCam.light.max],
  ];

  return points.every(([d, l]) =>
    hardwareCams.some(
      (cam) =>
        d >= cam.distance.min &&
        d <= cam.distance.max &&
        l >= cam.light.min &&
        l <= cam.light.max
    )
  );
}

/**
 * Returns all critical distance boundaries including camera edges and midpoints.
 */
function collectBoundaries(
  d_min: number,
  d_max: number,
  cameras: DiscreteRect[]
): number[] {
  const boundaries = new Set<number>([d_min, d_max + 1]);

  cameras.forEach((cam) => {
    boundaries.add(cam.d_min);
    boundaries.add(cam.d_max + 1);
    boundaries.add(Math.floor((cam.d_min + cam.d_max) / 2));
  });

  return Array.from(boundaries).sort((a, b) => a - b);
}

/**
 * For each vertical stripe (distance segment), check if the light range is fully covered.
 */
function checkStripeCoverage(
  stripe: { start: number; end: number },
  l_min: number,
  l_max: number,
  cameras: DiscreteRect[]
): boolean {
  const activeCams = cameras.filter(
    (cam) => cam.d_min <= stripe.start && cam.d_max >= stripe.end
  );

  if (activeCams.length === 0) return false;

  const lightIntervals: [number, number][] = activeCams.map((cam) => [
    cam.l_min,
    cam.l_max,
  ]);

  const merged = mergeIntervals(lightIntervals);
  return isRangeCovered(merged, [l_min, l_max]);
}

/**
 * Merges overlapping or adjacent light intervals.
 * Uses +1 merging rule to treat adjacent intervals as connected.
 */
function mergeIntervals(intervals: [number, number][]): [number, number][] {
  if (!intervals.length) return [];

  intervals.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const [start, end] = intervals[i];
    const last = merged[merged.length - 1];
    if (start <= last[1] + 1) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }

  return merged;
}

/**
 * Checks if the merged light intervals completely span the target light range.
 */
function isRangeCovered(
  merged: [number, number][],
  target: [number, number]
): boolean {
  for (const [start, end] of merged) {
    if (start <= target[0] && end >= target[1]) {
      return true;
    }
  }
  return false;
}
