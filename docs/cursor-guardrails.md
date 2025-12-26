# Cursor Guardrails - Marketing Styling

## ⚠️ CRITICAL RULES

**Never change styling unless explicitly requested by the user.**

This document establishes guardrails to prevent accidental styling changes to marketing pages that must match the Stitch HTML reference exactly.

## Core Principles

1. **Marketing pages must match Stitch HTML exactly**
   - Pricing page (`/src/pages/marketing/PricingPage.jsx`)
   - How It Works page (`/src/pages/marketing/HowItWorksPage.jsx`)
   - All other marketing pages

2. **When asked to "fix look/consistency", only adjust tokens/config**
   - Do NOT change component structure
   - Do NOT modify existing classes
   - Do NOT alter markup
   - ONLY update design tokens in `/src/theme/marketingTokens.js` or Tailwind config

3. **Prefer token fixes over class edits**
   - If styling needs adjustment, update tokens first
   - Only modify component classes if tokens cannot solve the issue
   - Always document token changes in `/docs/design-tokens.md`

## Pre-Change Checklist

Before making ANY UI/styling change to marketing pages, you MUST:

- [ ] **Verify the change is explicitly requested** - User must clearly state what to change
- [ ] **Check if it's a token issue** - Can this be fixed by updating `/src/theme/marketingTokens.js`?
- [ ] **Review existing markup** - Do NOT change existing classes or structure
- [ ] **Confirm Stitch reference** - Does this match the original Stitch HTML?
- [ ] **Document token changes** - If tokens are modified, update `/docs/design-tokens.md`

## What NOT to Do

❌ **DO NOT** "helpfully redesign" or "improve" styling
❌ **DO NOT** change existing Tailwind classes on marketing pages
❌ **DO NOT** modify component structure or markup
❌ **DO NOT** change colors, spacing, radii, typography, or shadows without explicit request
❌ **DO NOT** "fix" styling inconsistencies by editing component files
❌ **DO NOT** add new design patterns without user approval

## What TO Do

✅ **DO** use design tokens from `/src/theme/marketingTokens.js`
✅ **DO** update tokens if user explicitly requests styling changes
✅ **DO** reference `/docs/design-tokens.md` for exact values
✅ **DO** ask for clarification if styling change request is ambiguous
✅ **DO** preserve all existing classes and markup structure

## Token Source of Truth

- **Design Tokens File**: `/src/theme/marketingTokens.js`
- **Token Documentation**: `/docs/design-tokens.md`
- **Tailwind Config**: `tailwind.config.js` (imports from marketingTokens.js)

## Marketing Layout Scoping

Marketing pages use scoped CSS via the `.marketing-root` class:
- Applied to outermost wrapper in `MarketingLayout.jsx`
- Defined in `/src/styles/globals.css`
- Ensures consistent font and background across all marketing pages

## Examples

### ❌ BAD: "Helpful" Redesign
```
User: "The pricing page looks off"
AI: *Changes classes, adds new styling, modifies structure*
```

### ✅ GOOD: Token-Based Fix
```
User: "The pricing page primary color should be darker"
AI: *Updates marketingTokens.js primary color, updates docs*
```

### ❌ BAD: Class Modification
```
User: "Make spacing more consistent"
AI: *Edits px-4 to px-6 in PricingPage.jsx*
```

### ✅ GOOD: Token Update
```
User: "Make spacing more consistent"
AI: *Checks if spacing tokens need updating, asks for clarification on which spacing*
```

## Emergency Override

If user explicitly says:
- "Change the styling on [page]"
- "Update the design of [component]"
- "Modify [specific element]"

Then and ONLY then, you may make styling changes, but:
1. Still prefer token updates over class changes
2. Document what changed
3. Verify it matches user intent

## Questions to Ask Yourself

Before making any styling change:
1. Did the user explicitly request this change?
2. Can this be solved by updating tokens instead of classes?
3. Will this break the Stitch HTML reference match?
4. Have I checked the design tokens documentation?
5. Am I preserving all existing markup and classes?

## Remember

**When in doubt, ask. When unsure, preserve. When requested, use tokens first.**

The goal is to freeze marketing styling so it never drifts. Every change must be intentional and documented.

