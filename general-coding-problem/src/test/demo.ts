import { willCamerasSuffice } from "../index";
import { SoftwareCamera, Camera } from "../types";

const softwareCam: SoftwareCamera = {
  distance: { min: 10, max: 20 },
  light: { min: 5, max: 15 },
};

interface TestCase {
  label: string;
  expected: boolean;
  cams: Camera[];
  reason: string;
}

const testCases: TestCase[] = [
  {
    label: "TC1: One camera covers all",
    expected: true,
    reason: "Single camera covers entire distance and light range.",
    cams: [{ distance: { min: 10, max: 20 }, light: { min: 5, max: 15 } }],
  },
  {
    label: "TC2: Two halves covering cleanly",
    expected: true,
    reason: "Two adjacent cameras together fully cover the area.",
    cams: [
      { distance: { min: 10, max: 15 }, light: { min: 5, max: 15 } },
      { distance: { min: 16, max: 20 }, light: { min: 5, max: 15 } },
    ],
  },
  {
    label: "TC3: Missing light 11",
    expected: false,
    reason: "There's a gap in light coverage at level 11.",
    cams: [
      { distance: { min: 10, max: 20 }, light: { min: 5, max: 10 } },
      { distance: { min: 10, max: 20 }, light: { min: 12, max: 15 } },
    ],
  },
  {
    label: "TC4: Missing distance 16",
    expected: false,
    reason: "Gap in distance coverage at 16.",
    cams: [
      { distance: { min: 10, max: 15 }, light: { min: 5, max: 15 } },
      { distance: { min: 17, max: 20 }, light: { min: 5, max: 15 } },
    ],
  },
  {
    label: "TC5: Looks okay, but missing (15,6)",
    expected: false,
    reason: "Point (15,6) is not covered by any camera.",
    cams: [
      { distance: { min: 10, max: 12 }, light: { min: 5, max: 10 } },
      { distance: { min: 13, max: 15 }, light: { min: 11, max: 15 } },
      { distance: { min: 16, max: 18 }, light: { min: 5, max: 15 } },
      { distance: { min: 19, max: 20 }, light: { min: 5, max: 15 } },
      { distance: { min: 12, max: 14 }, light: { min: 5, max: 10 } },
      { distance: { min: 10, max: 20 }, light: { min: 11, max: 15 } },
    ],
  },
  {
    label: "TC6: Overlapping cameras",
    expected: true,
    reason: "Cameras overlap and fully cover the range.",
    cams: [
      { distance: { min: 10, max: 18 }, light: { min: 5, max: 15 } },
      { distance: { min: 15, max: 20 }, light: { min: 5, max: 15 } },
    ],
  },
  {
    label: "TC7: Minimal floating-point gap",
    expected: false,
    reason:
      "There's a small gap between 15.999 and 16.001 not caught by rounding.",
    cams: [
      { distance: { min: 10, max: 15.999 }, light: { min: 5, max: 15 } },
      { distance: { min: 16.001, max: 20 }, light: { min: 5, max: 15 } },
    ],
  },
  {
    label: "TC8: Cameras meeting at exact boundary",
    expected: true,
    reason: "Second camera starts where the first ends (both inclusive).",
    cams: [
      { distance: { min: 10, max: 15 }, light: { min: 5, max: 15 } },
      { distance: { min: 15, max: 20 }, light: { min: 5, max: 15 } },
    ],
  },
  {
    label: "TC9: Stress test with 10,000 cameras",
    expected: true,
    reason: "Large number of tiny cameras covering the whole range.",
    cams: Array.from({ length: 10000 }, (_, i) => ({
      distance: { min: 10 + i * 0.001, max: 10 + (i + 1) * 0.001 },
      light: { min: 5, max: 15 },
    })),
  },
  {
    label: "TC10: No hardware cameras",
    expected: false,
    reason: "Empty camera list should never pass.",
    cams: [],
  },
  {
    label: "TC11: Floating-point adjacent",
    expected: false,
    reason:
      "Expected fail — floating-point adjacent cameras not snapped together.",
    cams: [
      { distance: { min: 10, max: 15.999 }, light: { min: 5, max: 15 } },
      { distance: { min: 16.001, max: 20 }, light: { min: 5, max: 15 } },
    ],
  },
];

// Test runner
let allPassed = true;

console.log("\n=== Running Camera Coverage Test Suite ===\n");

for (const test of testCases) {
  const result = willCamerasSuffice(softwareCam, test.cams);
  const pass = result === test.expected;
  const status = pass ? "✅ PASS" : "❌ FAIL";

  if (!pass) allPassed = false;

  console.log(`${status} — ${test.label}`);
  console.log(`        Expected: ${test.expected}, Got: ${result}`);
  console.log(`        Reason: ${test.reason}\n`);
}

console.log(allPassed ? "🎉 ALL TESTS PASSED" : "🚨 SOME TESTS FAILED");
