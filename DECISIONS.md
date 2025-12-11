# Decisions & Notes

## Tasks chosen

Final Work Order (Highest → Lowest Priority)

1. FR-001 — Complete computed status heuristic

2. FR-006 — Prominent status & next-action explainer

3. FR-005 — Redesign / enhanced order details page

4. DEF-001 — Fix failing tests & TypeScript errors

5. FR-004 — Show order articles

6. FR-003 — Optional ZIP input + limited access mode

7. DEF-002 — Multiple tracking timelines bug fix


Describe which tasks you chose to implement and why.

- chose to implement the FR-00N because ... priority ... impact ... foundational ...
1. FR-001 — Complete the computed status heuristic (Top Priority)

Directly impacts the core user experience: understanding where their parcel is.

A more accurate status reduces customer-service queries and frustration.

Essential foundation for FR-006 and FR-005.

Medium development effort with very high business impact.

2. FR-006 — Clearly show current status and next action
Why it’s important

Reduces user uncertainty → biggest UX uplift.

Leverages the new improved status heuristic (FR-001).

Adds high business value by decreasing support tickets.

Builds trust for both merchants & end customers.

3. FR-005 — UX enhancement of order details page
Why it’s important

High visibility: every user sees this page.

A polished, modern tracking view increases merchant satisfaction and client retention.

Integrates improvements from FR-006 naturally.

4. DEF-001 — Fix failing test & TypeScript errors
Why it’s important

Must be done early to clear CI pipeline.

Developer velocity depends on clean tests and correct types.

Low dev effort with strong enabling value.


5. FR-004 — Show articles included in the order
Why it’s important

High merchant demand.

Clear user benefit: avoids “what is being shipped” confusion.

Complements the redesigned detail page (FR-005).

Medium complexity, good ROI.

6. FR-003 — Optional ZIP input for limited info
Why it’s important

Improves accessibility and reduces friction.

Allows deep-linking to order pages without ZIP (merchant emails, SMS, etc.).

Requires careful data-privacy consideration.


7. DEF-002 — Show multiple tracking timelines
Why it’s important

Bug fix with clear UX problem.

Should be a small change but improves accuracy.

Important for multi-parcel shipments.


## Design Decisions as bullet points

Detail your design decisions here to be able to present them later on during the interview.

I kept the design fairly simple because I wanted this to be very readable and focused more on deliverability.

## Notes on e.g. trade-offs and non-functional requirements solved

Use this document to explain any trade-offs you made, especially around:

- Status computation (heuristics & edge cases).
- The time-zone bug you fixed: root cause → fix → test.
- Performance measurements (bundle size, obvious improvements).

### Status Computation (Heuristics & Edge Cases)

The status computation in `lib/status.ts` uses a hierarchical, rule-based approach to determine the most accurate status from checkpoints and delivery information.

**Priority Order:**
1. **Terminal states first**: "delivered" is checked first and is terminal—once delivered, no other status can override it.
2. **Action-required states**: "ready_for_collection" and "failed_attempt" take precedence as they require user action.
3. **Time-sensitive states**: "delayed" is detected from both explicit delay mentions and past due dates.
4. **Active delivery states**: "out_for_delivery" has multiple pattern matches to catch carrier variations.
5. **Scheduled states**: Uses delivery dates when status text indicates scheduling.
6. **Default fallback**: "in_transit" is the safe default when no specific status can be determined.

**Edge Cases Handled:**
- **No checkpoints**: Falls back to `announced_delivery_date` to determine "scheduled" or "delayed", otherwise defaults to "in_transit".
- **Out-of-order timestamps**: Checkpoints are sorted by `event_timestamp` (descending) to always use the latest checkpoint.
- **Missing status details**: Uses `normalize()` to safely combine `status` and `status_details` fields.
- **Explicit "in transit" protection**: Line 98-101 ensures that explicit "in transit" status is not overridden by delivery date heuristics, maintaining accuracy for active shipments.
- **Delivery date precedence**: Latest checkpoint's `meta.delivery_date` takes precedence over `announced_delivery_date` when both exist.
- **Multiple pattern matching**: "out_for_delivery" checks for 3 different text patterns to handle carrier-specific wording.

**Trade-offs:**
- **Text-based matching**: Uses simple string inclusion rather than NLP, trading sophistication for reliability and performance. This works well for consistent carrier terminology but may miss edge cases with unusual wording.
- **Single latest checkpoint**: Only considers the most recent checkpoint rather than analyzing the full timeline. This simplifies logic but could miss nuanced status transitions.
- **Date-only comparison**: `buildStatusFromDueDate` compares dates without time, which is appropriate for delivery dates but may cause brief false positives around midnight boundaries.

### Time-Zone Bug Fix: Root Cause → Fix → Test

**Root Cause:**
The `relativeDayLabel` function in `lib/format.ts` was incorrectly calculating day differences when comparing dates across timezones. The original implementation likely used naive date arithmetic (e.g., `date.getTime() - now.getTime()`) which doesn't account for timezone differences. This caused dates to be labeled incorrectly—for example, a timestamp at 00:30 UTC on Oct 30 would be labeled as "today" when viewed in America/Chicago timezone (where it's actually Oct 29 at 19:30), even though the local date is "yesterday".

**The Fix:**
The solution extracts date components (year, month, day) directly in the target timezone using `Intl.DateTimeFormat.formatToParts()`, then calculates day differences using a custom `daysSinceEpoch()` function that:
- Properly handles leap years (including century and 400-year rules)
- Converts dates to day numbers since a fixed epoch
- Compares day numbers rather than millisecond timestamps
- Ensures consistent day-of-year semantics (leap day adjustment for February+ dates)

This approach ensures that "today", "yesterday", and "tomorrow" are determined based on calendar days in the user's timezone, not UTC or system time.

**Test Coverage:**
- `tests/unit/relativeDayLabel.spec.ts` includes a test case that verifies timezone respect: a timestamp at 00:30 UTC on Oct 30, when viewed in "America/Chicago" timezone with "now" set to 12:00 UTC on Oct 30, correctly returns "yesterday" (because in Chicago it's Oct 29 at 19:30).
- The fix is also implicitly tested through `explainStatus` tests which use various timezones (America/Chicago, Europe/Berlin, America/New_York) and verify correct relative day labels in explanations.

**Why This Matters:**
Timezone bugs are particularly insidious because they work correctly in the developer's timezone but fail for users in different zones. This fix ensures consistent, accurate date labeling regardless of where the user or server is located.

### Performance Measurements (Bundle Size & Optimizations)

**React Performance Optimizations:**
- **useMemo in StatusBanner**: Status computation and explanation generation are memoized to avoid recalculating on every render. Dependencies are `[order]` and `[order, status]` respectively.
- **useMemo in DeliveryEstimate**: Latest checkpoint calculation is memoized to avoid sorting checkpoints on every render.
- **useMemo in OrderHeader**: Status computation is memoized.

**Bundle Size Considerations:**
- **Minimal dependencies**: The project uses lightweight libraries:
  - `lucide-react` for icons (tree-shakeable)
  - `@radix-ui/react-slot` (minimal UI primitives)
  - `tailwind-merge` and `clsx` for efficient className composition
- **No heavy frameworks**: Uses React Router (already included) and Vite for fast builds
- **Tree-shaking friendly**: All imports are ES modules, allowing Vite to eliminate unused code
- **Build target**: `es2020` in `vite.config.ts` ensures modern JavaScript without unnecessary polyfills

**Obvious Improvements Made:**
- **Memoization strategy**: Computed values (status, explanations, sorted checkpoints) are cached to prevent unnecessary recalculations during re-renders.
- **Efficient sorting**: Checkpoints are sorted once per order change, not on every render.
- **Conditional rendering**: Components like `DeliveryEstimate` return `null` early when data is unavailable, avoiding unnecessary DOM work.

**Trade-offs:**
- **Memoization overhead**: The `useMemo` hooks add slight overhead, but this is negligible compared to the cost of recalculating status from potentially large checkpoint arrays.
- **No code splitting**: The application is small enough that code splitting wasn't necessary, but could be added for larger features.
- **No virtual scrolling**: Timeline components render all checkpoints; for orders with 100+ checkpoints, virtual scrolling could be added if needed.
