# Chrome Web Store Listing — ExpressMyself

> Last Updated: 2026-09-23

## Store Listing

**Extension Name** [REQUIRED]
<!-- Must match manifest.json "name". Max 75 characters. -->
ExpressMyself

**Short Description** [REQUIRED]
<!-- Max 132 characters. Shown in search results and tiles. Be specific about function. -->
Learn everyday idioms and expressions in 10 languages with a daily phrase, speech playback, and a searchable saved library.

**Detailed Description** [REQUIRED]
<!-- Max 16,000 characters. Written from the user's perspective, no implementation details.
     CWS strips markdown, so this is plain text with line breaks — paste it verbatim. -->
ExpressMyself helps you build a more natural feel for everyday language through short, useful phrase cards in 10 languages.

Get a fresh expression every day, hear how it sounds with built-in speech playback, and save the phrases you want to remember. Browse a larger library, filter by language or topic, and keep a compact saved list for quick review. Your language choice and saved phrases stay in sync with the ExpressMyself website, so you can pick up right where you left off.

How to use it:
Open the popup for today's expression and tap to reveal its meaning. Use Prev and Next to flip through more, and copy or save any phrase with a click. Open the full page to search the whole library, apply topic filters, and review everything you've saved. Turn on the optional daily reminder to keep a light practice habit going.

Your privacy comes first. ExpressMyself keeps your language choice and saved phrases in your own browser and never sends them to a server. It does not track your browsing or read the pages you visit.

Questions or feedback? Email expressmyselflabs@gmail.com — we'd love to hear from you.

**Category** [REQUIRED]
<!-- Language-learning tool. "Education" is the accurate Chrome Web Store category
     (the store's live category list includes it). -->
Education

**Single Purpose** [REQUIRED]
<!-- One sentence. Narrow and easy to understand. -->
Presents everyday-language idioms and expressions for reference and review, with a daily phrase and a saved list.

**Primary Language** [REQUIRED]
English


## Graphics & Assets

Primary listing art is the **v2 "mocha" promo set** in `extension/store-assets/promos-v2/`
(Windscribe-inspired: bold headline + a floating product-UI mockup on a warm mocha
canvas, with the Georgia-serif ExpressMyself wordmark and the unboxed speech-bubble
mark). A darker near-black variant of the same set lives in
`extension/store-assets/promos/` (v1); the older light "mockup" screenshots in
`extension/store-assets/screenshots/` are kept as a second alternate.

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `extension/assets/icon-128.png` |
| Screenshot 1 [REQUIRED] | 1280×800 | ✅ Ready | `extension/store-assets/promos-v2/1-daily.png` |
| Screenshot 2 [RECOMMENDED] | 1280×800 | ✅ Ready | `extension/store-assets/promos-v2/2-languages.png` |
| Screenshot 3 [RECOMMENDED] | 1280×800 | ✅ Ready | `extension/store-assets/promos-v2/3-library.png` |
| Screenshot 4 | 1280×800 | ✅ Ready | `extension/store-assets/promos-v2/4-listen.png` |
| Screenshot 5 | 1280×800 | ✅ Ready | `extension/store-assets/promos-v2/5-streak.png` |
| Small Promo Tile [RECOMMENDED] | 440×280 | ✅ Ready | `extension/store-assets/promos-v2/small-tile.png` |
| Marquee Promo Tile | 1400×560 | ✅ Ready | `extension/store-assets/promos-v2/marquee.png` |

<!-- Status options: ⬜ Not created | 🟡 Needs update | ✅ Ready -->

### Screenshot Notes
Promo set (source: `assets-src/store-promos/promos.html`; rebuild with
`node ./scripts/generate-store-promos.mjs`):
- `1-daily.png` — hero: "One fresh expression, every single day" beside the daily popup card (phrase of the day, literal, Save/Listen, streak).
- `2-languages.png` — "Ten languages. Real idioms" beside a Languages list showing native labels, per-language counts, and the 780-expression total.
- `3-library.png` — "Search the whole library in a tap" with the search field, topic filters, and result cards.
- `4-listen.png` — "Hear exactly how it should sound" with the speech-playback control and waveform.
- `5-streak.png` — "Save what clicks. Keep the streak alive" with the streak banner and saved shelf.
- `marquee.png` (1400×560) and `small-tile.png` (440×280) — dark brand tiles.

Alternate light set (source: `scripts/generate-extension-assets.py`):
`extension/store-assets/screenshots/{popup-daily,library-view,saved-view}.png`
and `extension/store-assets/store-marquee.png`.
- Optional to add later: a shot of the daily-reminder notification.


## Permissions Justification

<!-- Every permission needs a specific, user-facing justification. "Required for functionality"
     will be rejected. -->

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Saves the user's selected language and the list of phrases they mark to save, so those persist between sessions. Stored locally; no account or server. |
| `alarms` | permissions | Schedules the optional once-a-day practice reminder so the extension can prompt a review even when the popup is closed. Only active when the user enables the reminder. |
| `notifications` | permissions | Displays the optional daily practice reminder as a browser notification. Used only for the reminder the user turns on. |
| `https://expressmyself.vercel.app/*` | host_permissions | A content script runs only on the ExpressMyself website to sync the user's saved-phrase list and selected language between the extension and the site, on the user's own device. It does not read any other page content or run on any other site. |

<!-- Note: the host access above is declared via the content_scripts "matches" entry in
     manifest.json, not a host_permissions key, but reviewers evaluate it the same way. -->


## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** No

<!-- The extension stores a small amount of user-chosen data (selected language, saved phrase
     IDs) locally in the browser and never transmits it off-device. The content script only
     copies that same data between the extension and the ExpressMyself site on the user's own
     machine. Nothing is sent to a server or third party. The table is filled for completeness. -->

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Personally identifiable info | No | No | — | No |
| Health info | No | No | — | No |
| Financial info | No | No | — | No |
| Authentication info | No | No | — | No |
| Personal communications | No | No | — | No |
| Location | No | No | — | No |
| Web history | No | No | — | No |
| User activity | Stored locally only | No | Remember the phrases the user chooses to save | No |
| Website content | No | No | — | No |

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes


## Privacy Policy

**Privacy Policy URL** [REQUIRED]
<!-- Must be a publicly accessible URL. Source lives at PRIVACY.md; confirm the public link
     resolves before submitting. Suggested (repo is public on the default branch): -->
https://github.com/erichaberzettl/ExpressMyself/blob/main/PRIVACY.md
<!-- ⚠️ CONFIRM this URL is reachable, or host PRIVACY.md at a stable URL (GitHub Pages, the
     ExpressMyself site, etc.) before submission. -->


## Distribution

**Visibility**: Public
**Regions**: All regions


## Developer Info

**Publisher Name** [REQUIRED]
<!-- ⚠️ CONFIRM. "ExpressMyself Labs" is inferred from the contact address; set the real
     Chrome Web Store publisher account name. -->
ExpressMyself Labs

**Contact Email** [REQUIRED]
<!-- Displayed publicly on the store listing. -->
expressmyselflabs@gmail.com

**Support URL / Email** [RECOMMENDED]
expressmyselflabs@gmail.com

**Homepage URL** [RECOMMENDED]
https://expressmyself.vercel.app


## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 0.1.1 | 2026-09-23 | Extension hardening (popup, storage, service worker); habit features (practice streak, toolbar badge, daily reminder); practice mode; popup quick-wins (tap-to-reveal, Prev/Next, copy, keyboard shortcuts). Listing prepared. | Draft |
| 0.1.2 | 2026-09-26 | New Windscribe-style store promo art (v2 "mocha" set: 5 screenshots + marquee + small tile). Added French idiom "Il pleut des cordes" (780 expressions total). | Draft |


## Review Notes

### Known Issues / Limitations
- The `expressmyself.vercel.app` host access is the most review-sensitive item; the justification above states the narrow, on-device sync purpose and that no other page content is read.
- `alarms` + `notifications` exist only for the opt-in daily reminder — make sure the code path stays gated behind the user enabling it, so behavior matches this disclosure.
- Confirm the Privacy Policy URL resolves publicly before submitting.
- This file supersedes `extension/STORE_LISTING.md` as the canonical listing record; keep the two consistent (or retire the older one) to avoid drift.

### Rejection History
<!-- If applicable:
| Date | Reason | Fix Applied | Resubmitted |
|------|--------|-------------|-------------|
-->
