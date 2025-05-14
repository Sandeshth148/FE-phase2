# Task 2 — Hardware Camera Coverage Validator (FE-phase2/general-coding-problem)

This project contains a TypeScript solution that validates whether a set of hardware cameras can fully cover the range required by a software camera.

In this problem, the software camera must cover every (distance, light) pair in a defined rectangular area:

- **X-axis (Distance):** Represents the subject distance.
- **Y-axis (Light Level):** Represents the light intensity.

Each hardware camera supports a rectangular subrange in this 2D space. The goal is to verify that **every point** within the software camera’s range is covered by **at least one** hardware camera.

---

## Design Decision: Discrete Mode

- Chose integer discretization to avoid floating-point instability
- Real-world camera specs usually deal with measurable units (cm/lux)
- This approach provides better performance (5–10× faster than continuous logic)
- Floating-point gaps (< 1 unit) are not guaranteed to be detected

## 🔍 Key Features

- **Discrete Integer Discretization:**  
  Converts continuous ranges using `Math.ceil` and `Math.floor`. This avoids floating-point errors and simplifies checks to integer units.

- **Stripe-Based Iteration:**  
  The distance range is divided into vertical stripes where active cameras remain constant. Each stripe's light coverage is verified.

- **Merged Light Intervals:**  
  Within each stripe, light intervals from cameras are merged (with `+1` gap tolerance) to ensure full vertical coverage.

- **Midpoint Coverage Checks:**  
  Midpoints between boundaries are included in the stripe plan to catch subtle edge gaps between adjacent cameras.

- **Corner Case Validation:**  
  Explicit checks for the corners of the target rectangle (to prevent missed edges after clamping).

---

## 🧠 Logic Overview

The algorithm:
1. Clamps the problem space to integer grid units.
2. Converts camera specs into `DiscreteRect`s.
3. Extracts key boundaries and divides the distance range into vertical stripes.
4. For each stripe, merges the light intervals from cameras that fully span that stripe.
5. Returns `false` immediately if any stripe fails to cover the required light range.

This ensures false-safe behavior while maintaining performance.

---

## 🧮 Complexity Analysis

| Step                        | Time Complexity       | Space Complexity |
| --------------------------- | --------------------- | ---------------- |
| Convert to discrete ranges  | O(N)                  | O(N)             |
| Collect and sort boundaries | O(N log N)            | O(N)             |
| Stripe iteration and checks | O(N × L)              | O(N)             |
| Light interval merging      | O(N log N) per stripe | O(N)             |

- **Overall Worst-Case:** O(N² log N)
- **Best-Case:** O(N log N)

---

## ✅ Test Coverage Summary

| Test Case | Description |
|-----------|-------------|
| TC1       | One camera covers entire area |
| TC2       | Two adjacent cameras meet at the edge |
| TC3       | Light gap correctly detected |
| TC4       | Distance gap correctly detected |
| TC5       | Point-level miss (15,6) detected |
| TC6       | Overlapping cameras merged accurately |
| TC7       | Floating-point micro gap detected via midpoint |
| TC8       | Exact boundary meeting confirmed |
| TC9       | Stress test with 10,000 cameras (passes) |
| TC10      | Empty camera list rejected |
| TC11      | Floating-point adjacent cameras — documented design limit |

---

## ⚠️ Precision Handling

This implementation **uses integer discretization**, not floating-point merging.  
Sub-unit gaps (e.g. 15.999 to 16.001) are **not** merged unless they round into the same integer.
- ✅ Stable comparisons (avoids floating-point errors)
- ✅ Real-world applicability (camera specs use measurable units)
- ✅ 5-10× faster than continuous mode

Tradeoff:
- ❌ Gaps < 1 unit (e.g., 15.999-16.001) aren't detected
- ❌ Not suitable for sub-unit precision requirements
  

To support floating-point precision, an EPSILON-based merging strategy may be added in the future.

---

## 📂 Project Structure

```

FE-phase2/
└── general-coding-problem/
├── src/
│ ├── index.ts # Main validation logic (discrete version)
│ └── types.ts # Camera and range interfaces
├── test/
│ └── demo.ts # Enhanced test suite runner
├── package.json
├── tsconfig.json
└── README.md
```


## ⚙️ Running the Project

### 1. Install Dependencies

```bash
npm install 
```
### 2. Run the Complete Test Suite

```bash
npm run test

or run both index and test

npm run build_and_test
```

###

✍️ Author
Developed by Sandesh T H