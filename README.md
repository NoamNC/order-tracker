# parcelLab — Order Compass (Challenge Scaffold)

- [parcelLab — Order Compass (Challenge Scaffold)](#parcellab--order-compass-challenge-scaffold)
    - [📖 About the project and the use case](#-about-the-project-and-the-use-case)
    - [⚙️ Technical overview and instructions for developing](#️-technical-overview-and-instructions-for-developing)
    - [🏗️ Solving the Challenge and Rules to follow](#️-solving-the-challenge-and-rules-to-follow)
        - [IMPORTANT: Time limit](#important-time-limit)
        - [Use of AI and coding agents](#use-of-ai-and-coding-agents)
        - [1️⃣ Overall goal](#1️⃣-overall-goal)
        - [2️⃣ Backlog tasks to choose from](#2️⃣-backlog-tasks-to-choose-from)
        - [3️⃣ Deliverables](#3️⃣-deliverables)

## 📖 About the project and the use case

This is a synthetic project to evaluate your frontend engineering skills. It simulates a real world scenario that you
might encounter when working at parcelLab. We want to see how you approach the task, how you structure your code and how
you implement the requirements.

The use case is an order tracking application that allows users to look up their order status using an order number and
zip code. Once the order is found, the user should be able to see detailed information about the order, including its
current status, checkpoints, and delivery information.

> Please do not fork this repository. Clone it, work locally, and submit either as (non-forked) repository or a zip file.

## ⚙️ Technical overview and instructions for developing

Modern FE scaffold: **Vite + React + TypeScript + Tailwind (shadcn‑style)**, **MSW** for the mocked API, **Vitest** for
unit tests, and **Biome** for lint/format.

> This is **starter** code to build an order tracking application. It includes the lookup page, a bare Order Details
> page, a mocked API, design tokens, and might **contain bugs**.

### Prerequisites

- Node.js 20.x or higher
- pnpm 9.x

### Getting started

```bash
# install (pnpm preferred, but npm/yarn work too)
pnpm install

# run dev
pnpm dev

# run tests
pnpm test

# typecheck, lint & format
pnpm typecheck
pnpm lint
pnpm format
```

Open <http://localhost:5173> and try a valid order like **0000RTAB3** with zip **81371**.

### Structure

```bash
src/
  components/ui/*         # shadcn-style primitives (Button, Card, ...)
  components/Timeline.tsx # simple timeline
  components/OrderHeader.tsx
  lib/status.ts           # computed status heuristic (simplified)
  lib/format.ts           # date formatting helpers
  mocks/handlers.ts       # MSW mock: GET /orders/:orderNumber?zip=
  mocks/browser.ts        # MSW worker
  routes/Lookup.tsx       # lookup form
  routes/OrderDetails.tsx # details view (uses router state)
  styles/globals.css      # tailwind + CSS variables
  types/order.ts          # data types
data/shipments.json       # provided dataset
tests/*                   # vitest specs
```

### Mocked API

- **Endpoint:** `GET /orders/:orderNumber?zip=:zipCode`
- Returns `404` if order not found, `403` if zip mismatch, `200` with the order otherwise.
- Implemented via **MSW**; no server needed in dev.

### Notes

- The shadcn CLI config (`components.json`) is included; you can also generate more components if desired.
- **Biome** replaces ESLint + Prettier (see `biome.json`).

## 🏗️ Solving the Challenge and Rules to follow

### IMPORTANT: Time limit

> 💡 we want to have a fair playing field for all applicants. Therefore we kindly ask you to NOT spend more than **4
hours** on this challenge. If you reach the time limit, please stop working on it and send us what you have. We will
> evaluate your submission based on what you have done so far and also take into consideration that you had a limited
> time budget.
>
> We value very much good time management and transparency and prefer working code over unfinished 'perfect' solutions.

### Use of AI and coding agents

You are allowed to use AI tools and coding agents to help you solve the challenge in both code and documentation.
If you chose to do so, please document any AI usage in the provided `AI_LOG.md` file so we can understand how you
instructed AI to help you solve the challenge. Just dumping the conversation in there is fine, we are mainly interested
in how you prompted and verified the outputs.
> IMPORTANT: once you ship whatever was created either by you or by the llm/agent it is YOUR CODE and your
> responsibility to make sure it is correct, secure and follows best practices.

### 1️⃣ Overall goal

Pick from the tasks below to improve the project according to your time budget and priorities.

### 2️⃣ Backlog tasks to choose from

You are free to choose which tasks to implement from the list below. You do NOT have to implement all of them. Pick the ones
that you think are most relevant to showcase your skills within the given time budget and prioritise them from your
perspective based on impact on user experience and business value.
Imagine these are **not yet in a prioritised** list - they were just added to the backlog by various stakeholders and
you can pick and order them as you see fit. Choose wisely and justify your choices in the `DECISIONS.md` file.

#### FR-001 Complete the computed status heuristic

This is an important part for usability and user experience. The current implementation is simplified and does not cover
all cases. Improve the `lib/status.ts` to cover more edge cases and provide a more accurate status computation based on
the order's checkpoints and delivery information.

#### FR-002 improve a11y/perf, improve test coverage

Make sure all code and css is WCAG accessibility act compliant as required by law and best practices. Improve
performance for mobile devices which are the majority of users. Optimise for lighthouse and Google performance
criteria. Add more unit/integration tests to cover edge cases and make sure the code is robust. Achieve 100% test
coverage for all new and existing code. This is preparation for the audit in 2 months.

#### DEF-001 Fix the failing test and related type errors

There is a failing unit test and some TypeScript errors. Identify the root cause, fix the issues, and ensure all tests pass.

#### FR-003 Optional ZIP input to disclose additional order and tracking information

Currently the zip-code in the lookup is required to submit. We should make that optional and display only basic tracking
information when no zip-code is provided. That also makes the order details page accessible without zip-code, but only
with limited information and by calling the url with just the order-number (e.g. `/order/0000RTAB1`). If the ZIP code is
provided the page shall display all information relevant to the recipient and the goods in the order.

#### FR-004 UX improvement: show articles included in the order

Our customers (e-commerce shops) want to provide their end-customers with more transparency about what is included in
the order. Therefore we want to show the articles included in the order on the order details page. Please enhance the
order details page to include a section that lists all articles in the order, including their name, quantity, and any
other relevant information available in the order data. Ideally, include images if available. Links to the article
detail page on the shop's website would make a good addition as well.

#### FR-005 UX improvement: enhance the order details page

The order details page is functional but bare-bones. Improve the user experience by enhancing the visual design,
information hierarchy, and overall usability. Consider what information is most important to a user tracking their
package and how to present it effectively. You have creative freedom here — show us how you would make this page
delightful and informative for end users.

#### FR-006 Clearly show the user the current status and the next action (for them or the carrier)

we have a computed status, but it is not very visible in the UI. Improve the order details page to prominently display
the current status (e.g. "In Transit", "Out for Delivery", "Delivered") and what the user can expect next (e.g. "
Expected delivery tomorrow", "Action required: Please contact carrier"). Or if no action is required, show that clearly
as well.
Add a short human‑readable explanation under the computed status (e.g., “Your parcel left the local depot at 08:12 and
is expected on Tue”).

Implement a rule‑based explainer function and an evaluation harness (/evaluation/explainer.spec.ts) with 4–6 cases.

#### DEF-002 Orders with two tracking numbers show only one tracking timeline

There is a bug in the order details page when an order has two tracking numbers (e.g. from different carriers).
Currently only one timeline is shown, which can be confusing for users. Fix the bug to ensure that both timelines are
displayed correctly, allowing users to see the full tracking information for their order. Should be easy.

#### OPEN-001 Surprise us

Is there something you'd love to add, improve, or experiment with? A small feature, a polish detail, a clever
integration, or just something that makes you proud? This is your chance to show off your creativity and initiative.
No constraints — just make sure to document your reasoning in `DECISIONS.md`.

### 3️⃣ Deliverables

> **Important**: Do NOT fork this repository. Clone it, work locally, and submit as described below.

A zip file or link to your own private repository containing:

- [ ] Working code that is error-free, type-safe, and well-structured
- [ ] Commits in small, readable steps — avoid a single "monster" commit
- [ ] A log of all AI prompts and outputs you used (if any) in `AI_LOG.md`
- [ ] A brief summary of your design decisions and implementation notes in `DECISIONS.md`

---

© parcelLab — May your commits be atomic and your parcels always delivered.

