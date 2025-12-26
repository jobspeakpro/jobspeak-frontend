# Design Tokens - Marketing Pages

This document defines the exact design tokens used by marketing pages (Pricing, How It Works, etc.) to match the Stitch HTML reference. These tokens are the single source of truth and must not be changed without explicit approval.

## Colors

### Primary Colors
- **primary**: `#136dec` - Main brand color for buttons, links, and accents
- **background-light**: `#f6f7f8` - Light background color for marketing pages
- **background-dark**: `#101822` - Dark background color (for dark mode support)

### Slate Color Palette (Tailwind defaults used)
Marketing pages use Tailwind's slate color scale for text and borders:
- **slate-900** (`#0f172a`): Primary text color (`text-slate-900`)
- **slate-600** (`#475569`): Secondary text color (`text-slate-600`)
- **slate-500** (`#64748b`): Tertiary text color (`text-slate-500`)
- **slate-400** (`#94a3b8`): Muted text color (`text-slate-400`)
- **slate-200** (`#e2e8f0`): Border color (`border-slate-200`)
- **slate-700** (`#334155`): Dark mode border color (`border-slate-700`)

### Blue Color Variants
- **blue-600**: Used for buttons and hover states (`bg-blue-600`, `hover:bg-blue-600`)
- **blue-700**: Hover state for buttons (`hover:bg-blue-700`)
- **blue-100**: Background for icon containers (`bg-blue-100`)
- **blue-200**: Shadow color for primary buttons (`shadow-blue-200`)

## Typography

### Font Family
- **Primary Font**: `Inter` (via `font-display` class)
- **Fallback Stack**: `Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"`

### Font Weights
- **font-normal**: 400
- **font-medium**: 500
- **font-semibold**: 600
- **font-bold**: 700
- **font-black**: 900

### Font Sizes (as used in marketing pages)
- **text-xs**: 0.75rem (12px)
- **text-sm**: 0.875rem (14px)
- **text-base**: 1rem (16px)
- **text-lg**: 1.125rem (18px)
- **text-xl**: 1.25rem (20px)
- **text-2xl**: 1.5rem (24px)
- **text-3xl**: 1.875rem (30px)
- **text-4xl**: 2.25rem (36px)
- **text-5xl**: 3rem (48px)

## Border Radius

- **DEFAULT**: `0.25rem` (4px) - Used via `rounded` class
- **lg**: `0.5rem` (8px) - Used via `rounded-lg` class
- **xl**: `0.75rem` (12px) - Used via `rounded-xl` class
- **2xl**: `1rem` (16px) - Used via `rounded-2xl` class
- **full**: `9999px` - Used via `rounded-full` class

## Shadows

Marketing pages use these shadow utilities:

- **shadow-sm**: Small shadow for cards and subtle elevation
  - Used on: Pricing cards, How It Works cards, buttons
- **shadow-md**: Medium shadow for hover states
  - Used on: Card hover states (`hover:shadow-md`)
- **shadow-lg**: Large shadow for prominent elements
  - Used on: Primary CTA buttons
- **shadow-xl**: Extra large shadow for featured elements
  - Used on: Featured pricing card (Annual plan)
- **shadow-blue-100**: Colored shadow for primary buttons
- **shadow-blue-200**: Colored shadow for primary buttons (darker variant)

## Spacing Conventions

Marketing pages use consistent spacing patterns:

### Horizontal Padding
- **px-4**: 1rem (16px) - Mobile default
- **px-6**: 1.5rem (24px) - Standard padding
- **px-8**: 2rem (32px) - Larger padding
- **md:px-10**: 2.5rem (40px) - Medium breakpoint padding
- **lg:px-8**: 2rem (32px) - Large breakpoint padding
- **lg:px-40**: 10rem (160px) - Large breakpoint wide padding (header/footer)

### Vertical Padding
- **py-4**: 1rem (16px)
- **py-10**: 2.5rem (40px)
- **py-16**: 4rem (64px)

### Gaps
- **gap-2**: 0.5rem (8px)
- **gap-3**: 0.75rem (12px)
- **gap-4**: 1rem (16px)
- **gap-6**: 1.5rem (24px)
- **gap-8**: 2rem (32px)
- **gap-10**: 2.5rem (40px)
- **gap-12**: 3rem (48px)
- **gap-16**: 4rem (64px)

### Margins
- **mb-2**: 0.5rem (8px)
- **mb-4**: 1rem (16px)
- **mb-8**: 2rem (32px)
- **mb-12**: 3rem (48px)
- **mb-16**: 4rem (64px)

## Layout

### Max Widths
- **max-w-2xl**: 42rem (672px)
- **max-w-3xl**: 48rem (768px)
- **max-w-4xl**: 56rem (896px)
- **max-w-5xl**: 64rem (1024px)
- **max-w-6xl**: 72rem (1152px)
- **max-w-7xl**: 80rem (1280px)

### Grid Columns
- **grid-cols-1**: Single column (mobile)
- **md:grid-cols-2**: Two columns (medium breakpoint)
- **lg:grid-cols-3**: Three columns (large breakpoint)
- **lg:grid-cols-4**: Four columns (large breakpoint)

## Usage Notes

- All marketing pages must use these exact token values
- Do not create new color variants or spacing values without updating this document
- When in doubt, reference the Stitch HTML implementation
- These tokens are enforced via `/src/theme/marketingTokens.js` and Tailwind config

