# Canonical Naming — URL & Naming Consistency

## Canonical Naming

**Practice/Interview:** Canonical = **"Practice"**

**Pricing/Upgrade:** Canonical = **"Pricing"** (page/section name), **"Upgrade"** (action verb)

**Rewrite:** Canonical = **"Answer Rewrite"** (feature name)

---

## Mapping (Old → New)

**Interview** → **Practice**
- Navigation tab: "Interview" → "Practice"
- Tab ID: `"interview"` → `"practice"`
- Route: `/interview` → `/practice`
- Page title: "AI Interview Coach" → "Practice Coach"
- Usage counter: "Today's interviews:" → "Today's practice:"
- Button: "Try Interview Practice (Free)" → "Try Practice (Free)"

**Practice** → **Practice** (already canonical, no change needed)
- Component: `PracticePage`
- Section ID: `"practice-section"`
- Headers: "Speaking Practice", "Voice Practice"

**Pricing** → **Pricing** (keep as-is)
- Navigation tab: "Pricing"
- Tab ID: `"pricing"`
- Route: `/pricing`
- Component: `PricingPage`

**Upgrade** → **Upgrade** (keep as-is for actions)
- Button: "Upgrade to Pro"
- Modal: `UpgradeModal`
- Function: `initiateUpgrade`
- Note: "Pricing" = page name, "Upgrade" = action verb (both correct)

**Answer rewrite** → **"Answer Rewrite"**
- Pricing: "answer rewrites" → "Answer Rewrites"
- Pricing: "Unlimited answer rewrites" → "Unlimited Answer Rewrites"
- Pricing: "3 answer rewrites per day" → "3 Answer Rewrites per day"
- UpgradeModal: "Unlimited interview answer rewrites" → "Unlimited Answer Rewrites"
- ProGuard: "Unlimited interview answer rewrites" → "Unlimited Answer Rewrites"

**Answer improvement** → **"Answer Rewrite"**
- UpgradeModal: "You've used your free answer improvements" → "You've used your free Answer Rewrites"
- UpgradeModal: "answer improvements" → "Answer Rewrites"

**"Better way to say it"** → **"Better Way to Say It"** (UI label for Answer Rewrite display section)
- PracticePage: "Better way to say it" → "Better Way to Say It"
- App.jsx: "Better way to say it" → "Better Way to Say It"

**"Fix my answer"** → **"Improve My Answer"** (button label)
- PracticePage: "✨ Fix my answer" → "✨ Improve My Answer"
- Paywall source: `"fix_answer"` → `"improve_answer"` (internal code)

**"Improve my answer"** → **"Improve My Answer"** (standardize capitalization)
- App.jsx: "✨ Improve my answer" → "✨ Improve My Answer"

---

## Additional Variants Found

- "interview answers" → "practice answers" (in context of practice feature)
- "interview question" → "practice question" (when referring to practice feature)
- "interview prep" → "practice" (in pricing context: "short-term interview prep" → "short-term practice")

