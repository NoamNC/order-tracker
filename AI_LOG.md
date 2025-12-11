# AI Usage Log (optional)

If you used AI assistance, please paste relevant prompts and output below.
For each snippet, briefly describe how you verified and adapted it.


I used chatGPT to create a work plan.
The prompt I used was:
"Overall goal Pick from the tasks below to improve the project according to your time budget and priorities. 

 Backlog tasks to choose from You are free to choose which tasks to implement from the list below.  prioritize them from your perspective based on impact on user experience and business value. 
 Imagine these are not yet in a prioritized list - they were just added to the backlog by various stakeholders and you can pick and order them as you see fit.
Choose wisely and justify your choices.
Create a work plan for each task.
 
FR-001 Complete the computed status heuristic This is an important part for usability and user experience. The current implementation is simplified and does not cover all cases. Improve the lib/status.ts to cover more edge cases and provide a more accurate status computation based on the order's checkpoints and delivery information. FR-002 improve a11y/perf, improve test coverage Make sure all code and css is WCAG accessibility act compliant as required by law and best practices. Improve performance for mobile devices which are the majority of users. Optimise for lighthouse and Google performance criteria. Add more unit/integration tests to cover edge cases and make sure the code is robust. Achieve 100% test coverage for all new and existing code. This is preparation for the audit in 2 months. DEF-001 Fix the failing test and related type errors There is a failing unit test and some TypeScript errors. Identify the root cause, fix the issues, and ensure all tests pass. FR-003 Optional ZIP input to disclose additional order and tracking information Currently the zip-code in the lookup is required to submit. We should make that optional and display only basic tracking information when no zip-code is provided. That also makes the order details page accessible without zip-code, but only with limited information and by calling the url with just the order-number (e.g. /order/0000RTAB1). If the ZIP code is provided the page shall display all information relevant to the recipient and the goods in the order. FR-004 UX improvement: show articles included in the order Our customers (e-commerce shops) want to provide their end-customers with more transparency about what is included in the order. Therefore we want to show the articles included in the order on the order details page. Please enhance the order details page to include a section that lists all articles in the order, including their name, quantity, and any other relevant information available in the order data. Ideally, include images if available. Links to the article detail page on the shop's website would make a good addition as well. FR-005 UX improvement: enhance the order details page The order details page is functional but bare-bones. Improve the user experience by enhancing the visual design, information hierarchy, and overall usability. Consider what information is most important to a user tracking their package and how to present it effectively. You have creative freedom here — show us how you would make this page delightful and informative for end users. FR-006 Clearly show the user the current status and the next action (for them or the carrier) we have a computed status, but it is not very visible in the UI. Improve the order details page to prominently display the current status (e.g. "In Transit", "Out for Delivery", "Delivered") and what the user can expect next (e.g. " Expected delivery tomorrow", "Action required: Please contact carrier"). Or if no action is required, show that clearly as well. Add a short human‑readable explanation under the computed status (e.g., “Your parcel left the local depot at 08:12 and is expected on Tue”). Implement a rule‑based explainer function and an evaluation harness (/evaluation/explainer.spec.ts) with 4–6 cases. DEF-002 Orders with two tracking numbers show only one tracking timeline There is a bug in the order details page when an order has two tracking numbers (e.g. from different carriers). Currently only one timeline is shown, which can be confusing for users. Fix the bug to ensure that both timelines are displayed correctly, allowing users to see the full tracking information for their order. Should be easy."



the output was:
"✅ Work Plan (Prioritised by Importance & Impact)
1. FR-001 — Complete the computed status heuristic (Top Priority)
Why it’s important

Directly impacts the core user experience: understanding where their parcel is.

A more accurate status reduces customer-service queries and frustration.

Essential foundation for FR-006 and FR-005.

Medium development effort with very high business impact.

Work plan

Analyse current status logic in lib/status.ts.

Add missing states (e.g., "label created", "handover delay", "exception", "customs", "awaiting pickup", etc.).

Include edge-case handling (out-of-order timestamps, partial checkpoint data, carrier-specific quirks).

Add unit tests covering all paths.

2. FR-006 — Clearly show current status and next action
Why it’s important

Reduces user uncertainty → biggest UX uplift.

Leverages the new improved status heuristic (FR-001).

Adds high business value by decreasing support tickets.

Builds trust for both merchants & end customers.

Work plan

Build a prominent status banner with visual hierarchy.

Implement rule-based “next step” explainer function.

Create 4–6 canonical evaluation cases under /evaluation/explainer.spec.ts.

Add human-readable explanations and carrier-specific patterns.

3. FR-005 — UX enhancement of order details page
Why it’s important

High visibility: every user sees this page.

A polished, modern tracking view increases merchant satisfaction and client retention.

Integrates improvements from FR-006 naturally.

Work plan

Redesign layout: timeline, status banner, parcel summary, delivery estimate.

Improve info hierarchy (group actions, events, product data).

Add responsive design prioritising mobile.

Prepare design tokens for consistency.

4. DEF-001 — Fix failing test & TypeScript errors
Why it’s important

Must be done early to clear CI pipeline.

Developer velocity depends on clean tests and correct types.

Low dev effort with strong enabling value.

Work plan

Identify broken assertion and root cause.

Fix related logic or incorrect mocks.

Resolve TypeScript type mismatches.

Ensure all tests pass to stabilise the codebase.

5. FR-004 — Show articles included in the order
Why it’s important

High merchant demand.

Clear user benefit: avoids “what is being shipped” confusion.

Complements the redesigned detail page (FR-005).

Medium complexity, good ROI.

Work plan

Add article list section (name, quantity, SKU, thumbnail).

Add optional links to shop product pages.

Ensure fallback UI when data is missing.

Add tests for rendering and behaviour.

6. FR-003 — Optional ZIP input for limited info
Why it’s important

Improves accessibility and reduces friction.

Allows deep-linking to order pages without ZIP (merchant emails, SMS, etc.).

Requires careful data-privacy consideration.

Work plan

Modify endpoint and frontend logic to allow ZIP-less lookups.

Display restricted fields when ZIP not provided.

Ensure sensitive data is protected.

Add tests for both ZIP and ZIP-less flows.

7. DEF-002 — Show multiple tracking timelines
Why it’s important

Bug fix with clear UX problem.

Should be a small change but improves accuracy.

Important for multi-parcel shipments.

Work plan

Render timelines based on all tracking numbers.

Use carriers’ IDs or array index as keys.

Ensure layout supports stacked timelines.

8. FR-002 — Improve a11y, performance + test coverage (Audit Prep)
Why it’s important

Mandatory for compliance (WCAG).

Required for upcoming audit.

Improves Lighthouse scores & mobile performance.

Largest effort item — ongoing work, good to start after core features are stable.

Work plan

Add aria-labels, better contrast, focus states.

Audit component tree for accessibility.

Optimise images, bundle size, CSS.

Improve mobile rendering & hydration paths.

Reach 100% test coverage (incremental).

⭐ Final Work Order (Highest → Lowest Priority)

FR-001 — Complete computed status heuristic

FR-006 — Prominent status & next-action explainer

FR-005 — Redesign / enhanced order details page

DEF-001 — Fix failing tests & TypeScript errors

FR-004 — Show order articles

FR-003 — Optional ZIP input + limited access mode

DEF-002 — Multiple tracking timelines bug fix

FR-002 — Accessibility, performance, full test coverage"



I used curser to help with the tasks.
I used the same prompt for each task.
the prompts consist of the task + work plan.
example:
"Complete the computed status heuristic.
This is an important part for usability and user experience.
The current implementation is simplified and does not cover all cases.
Improve the lib/status.ts to cover more edge cases and provide a more accurate status computation based on the order's checkpoints and delivery information.

Work plan:

1. Analyse current status logic in lib/status.ts.

2. Add missing states (e.g., "label created", "handover delay", "exception", "customs", "awaiting pickup", etc.).

3. Include edge-case handling (out-of-order timestamps, partial checkpoint data, carrier-specific quirks).

4. Add unit tests covering all paths."

