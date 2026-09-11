# GitHub asset policy — v0.2.2

## Source
Existing MOB QUEST GitHub artwork is the live visual source. The resolver tries:
1. `https://raw.githubusercontent.com/cbmob0329/MOB-QUEST/main/<path>`
2. GitHub Pages `https://cbmob0329.github.io/MOB-QUEST/<path>`
3. `master` branch fallback
4. same-site relative path fallback

## Used
- `back/` — HOME, STORY and battle backgrounds
- `enemy/` — standard/elite monster art
- `boss/` — boss monster art
- `spenemy/` — special/event boss monster art
- `play/` — only where the exact character artwork is verified and needed
- `skill/`, `skill2/` — technique animation frames

## Explicitly excluded
Figure-family, weapon and armor art are blocked by the runtime asset resolver and are not used by the MOB MONSTERS UI.

## Missing exact monster art
A few design-master candidates do not have an exact non-figure MOB QUEST battle image path in the source ZIP. Those deliberately keep the text/symbol fallback rather than silently substituting a different monster.
