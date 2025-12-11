# parcelLab — Order Compass

A modern order tracking application that allows users to look up their order status using an order number and optional ZIP code. Built as a frontend engineering challenge demonstrating React best practices, TypeScript, and thoughtful UX design.

## 📖 Project Overview

This is an order tracking application that provides end customers with transparent, real-time information about their parcel deliveries. Users can search for orders by order number, with an optional ZIP code for additional security and detailed information. The application features a comprehensive status computation system, clear status explanations, and an enhanced order details page.

### Key Features

- **Order Lookup**: Search orders by order number with optional ZIP code verification
- **Computed Status Heuristic**: Intelligent status determination from checkpoints and delivery information
- **Status Explanations**: Human-readable explanations of current status and next actions
- **Enhanced Order Details**: Modern, informative order details page with articles, timelines, and delivery estimates
- **Multi-Parcel Support**: Displays multiple tracking timelines for orders with multiple parcels
- **Timezone-Aware**: Proper timezone handling for accurate date labels
- **Performance Optimized**: Memoized computations and efficient rendering

## 🎯 Implemented Features

The following features were implemented based on priority and business impact:

### 1. FR-001 — Complete Computed Status Heuristic (Top Priority)
- **Why**: Directly impacts core user experience and reduces customer service queries
- **Implementation**: Hierarchical, rule-based status computation in `lib/status.ts`
- **Features**:
  - Terminal state detection (delivered)
  - Action-required states (ready_for_collection, failed_attempt)
  - Time-sensitive states (delayed detection)
  - Active delivery states (out_for_delivery with multiple pattern matching)
  - Scheduled states based on delivery dates
  - Safe fallback to "in_transit"

### 2. FR-006 — Prominent Status & Next-Action Explainer
- **Why**: Reduces user uncertainty and builds trust
- **Implementation**: Status banner with clear explanations in `components/StatusBanner.tsx`
- **Features**:
  - Prominent status display with visual indicators
  - Human-readable explanations (e.g., "Your parcel left the local depot at 08:12 and is expected on Tue")
  - Next action guidance for users
  - Rule-based explainer function in `lib/explainer.ts`

### 3. FR-005 — Enhanced Order Details Page
- **Why**: High visibility page that increases merchant satisfaction
- **Implementation**: Redesigned `routes/OrderDetails.tsx` with improved information hierarchy
- **Features**:
  - Modern, clean design focused on readability
  - Clear information hierarchy
  - Integrated status banner and delivery estimates
  - Article display with images
  - Multiple timeline support

### 4. DEF-001 — Fixed Failing Tests & TypeScript Errors
- **Why**: Essential for developer velocity and CI pipeline
- **Implementation**: Fixed timezone bug in `lib/format.ts` and related test issues
- **Details**: See "Time-Zone Bug Fix" section below

### 5. FR-004 — Show Order Articles
- **Why**: High merchant demand and clear user benefit
- **Implementation**: Article display component in `components/ParcelSummary.tsx`
- **Features**:
  - Article listing with names, quantities, and images
  - Responsive grid layout
  - Image fallbacks for missing images

### 6. FR-003 — Optional ZIP Input & Limited Access Mode
- **Why**: Improves accessibility and enables deep-linking
- **Implementation**: Made ZIP code optional in `routes/Lookup.tsx`
- **Features**:
  - Optional ZIP code input
  - Limited information mode when ZIP is not provided
  - Deep-linking support via URL (e.g., `/order/0000RTAB1`)

### 7. DEF-002 — Multiple Tracking Timelines Bug Fix
- **Why**: Important for multi-parcel shipments
- **Implementation**: Fixed timeline rendering to show all tracking numbers
- **Features**: Displays separate timelines for each tracking number in an order

## 🛠️ Technical Stack

- **Framework**: React 18.3 with TypeScript
- **Build Tool**: Vite 5.4
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: React Router DOM 6.26
- **Testing**: 
  - Vitest for unit tests
  - Playwright for E2E tests
  - Testing Library for component tests
- **Mocking**: MSW (Mock Service Worker) for API mocking
- **Linting/Formatting**: Biome
- **Icons**: Lucide React (tree-shakeable)

## 🏗️ Architecture & Design Decisions

### Status Computation Heuristic

The status computation in `lib/status.ts` uses a hierarchical, rule-based approach:

**Priority Order:**
1. **Terminal states first**: "delivered" is checked first and is terminal
2. **Action-required states**: "ready_for_collection" and "failed_attempt" take precedence
3. **Time-sensitive states**: "delayed" detected from explicit mentions and past due dates
4. **Active delivery states**: "out_for_delivery" with multiple pattern matches for carrier variations
5. **Scheduled states**: Uses delivery dates when status text indicates scheduling
6. **Default fallback**: "in_transit" when no specific status can be determined

**Edge Cases Handled:**
- No checkpoints: Falls back to `announced_delivery_date`
- Out-of-order timestamps: Checkpoints sorted by `event_timestamp` (descending)
- Missing status details: Uses `normalize()` to safely combine fields
- Explicit "in transit" protection: Prevents override by delivery date heuristics
- Delivery date precedence: Latest checkpoint's `meta.delivery_date` takes precedence
- Multiple pattern matching: "out_for_delivery" checks 3 different text patterns

**Trade-offs:**
- Text-based matching: Uses simple string inclusion rather than NLP for reliability and performance
- Single latest checkpoint: Only considers most recent checkpoint to simplify logic
- Date-only comparison: Compares dates without time, appropriate for delivery dates

### Time-Zone Bug Fix

**Root Cause:**
The `relativeDayLabel` function in `lib/format.ts` was incorrectly calculating day differences when comparing dates across timezones. Naive date arithmetic caused dates to be labeled incorrectly—for example, a timestamp at 00:30 UTC on Oct 30 would be labeled as "today" when viewed in America/Chicago timezone (where it's actually Oct 29 at 19:30).

**The Fix:**
The solution extracts date components directly in the target timezone using `Intl.DateTimeFormat.formatToParts()`, then calculates day differences using a custom `daysSinceEpoch()` function that:
- Properly handles leap years (including century and 400-year rules)
- Converts dates to day numbers since a fixed epoch
- Compares day numbers rather than millisecond timestamps
- Ensures consistent day-of-year semantics

**Test Coverage:**
- `tests/unit/relativeDayLabel.spec.ts` includes timezone-aware test cases
- Verified with multiple timezones (America/Chicago, Europe/Berlin, America/New_York)

### Performance Optimizations

**React Performance:**
- **useMemo in StatusBanner**: Status computation and explanation generation memoized
- **useMemo in DeliveryEstimate**: Latest checkpoint calculation memoized
- **useMemo in OrderHeader**: Status computation memoized

**Bundle Size:**
- Minimal dependencies: lightweight libraries (lucide-react, @radix-ui/react-slot)
- Tree-shaking friendly: All imports are ES modules
- Build target: `es2020` in `vite.config.ts` for modern JavaScript without unnecessary polyfills

**Trade-offs:**
- Memoization overhead: Slight overhead but negligible compared to recalculating status from large checkpoint arrays
- No code splitting: Application is small enough that code splitting wasn't necessary
- No virtual scrolling: Timeline components render all checkpoints; could be added for orders with 100+ checkpoints

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- pnpm 9.x (or npm/yarn)

### Installation

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Format code
pnpm format
```

Open <http://localhost:5173> and try a valid order like **0000RTAB3** with zip **81371**.

## 📁 Project Structure

```
src/
  components/
    ui/              # shadcn-style primitives (Button, Card, Alert, etc.)
    ArticleImage.tsx # Article image component with fallbacks
    DeliveryEstimate.tsx # Delivery date estimation component
    OrderHeader.tsx  # Order header with status and key info
    ParcelSummary.tsx # Parcel summary with articles
    StatusBanner.tsx # Prominent status display with explanations
    Timeline.tsx     # Timeline component for checkpoints
  lib/
    explainer.ts     # Rule-based status explanation generator
    format.ts        # Date formatting helpers (timezone-aware)
    status.ts        # Computed status heuristic
    utils.ts         # Utility functions (cn, etc.)
  routes/
    ErrorPage.tsx    # Error page component
    Lookup.tsx       # Order lookup form
    OrderDetails.tsx # Enhanced order details page
  mocks/
    browser.ts       # MSW worker setup
    handlers.ts      # API mock handlers
  types/
    order.ts         # TypeScript type definitions
  styles/
    globals.css      # Tailwind + CSS variables
tests/
  unit/              # Unit tests (Vitest)
  e2e/               # E2E tests (Playwright)
data/
  shipments.json     # Provided dataset
```

## 🧪 Testing

The project includes comprehensive test coverage:

- **Unit Tests**: Vitest with Testing Library for component and utility testing
- **E2E Tests**: Playwright for end-to-end user flows
- **Test Files**:
  - `status.spec.ts` - Status computation logic
  - `explainer.spec.ts` - Status explanation generation
  - `relativeDayLabel.spec.ts` - Timezone-aware date labeling
  - Component tests for OrderHeader, ParcelSummary, DeliveryEstimate
  - E2E tests for user workflows

Run tests with:
```bash
pnpm test          # Unit tests
pnpm test:watch    # Watch mode
pnpm test:e2e      # E2E tests
pnpm test:e2e:ui   # E2E tests with UI
```

## 🔌 Mocked API

The application uses MSW (Mock Service Worker) for API mocking in development:

- **Endpoint**: `GET /orders/:orderNumber?zip=:zipCode`
- **Returns**: 
  - `404` if order not found
  - `403` if zip mismatch
  - `200` with order data otherwise
- **No server needed**: MSW intercepts requests in the browser

## 📝 Design Philosophy

The design was kept simple and focused on readability and deliverability:

- **Clean, modern UI**: Minimal design that doesn't distract from information
- **Clear information hierarchy**: Most important information (status, next action) is prominent
- **Accessible**: WCAG-compliant components and semantic HTML
- **Responsive**: Works well on mobile devices (majority of users)
- **Performance-first**: Optimized for fast loading and smooth interactions

## 🐛 Known Issues & Future Improvements

- Code splitting could be added for larger features
- Virtual scrolling could be implemented for orders with 100+ checkpoints
- Additional status patterns could be added for more carrier variations
- Enhanced accessibility features (keyboard navigation improvements)

## 📄 License

© parcelLab — May your commits be atomic and your parcels always delivered.
