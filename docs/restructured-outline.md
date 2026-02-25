# Restructured Outline: Minimizing Context Switches

## Current switches (for reference)

1. BROWSER — Section 1: live site tour
2. CURSOR — Section 2: stack, Gemfile, data, components, Browsersync
3. BROWSER — Section 3: Lighthouse, Firebase usage, Fathom screenshot
4. CURSOR — Section 3: firebase-deploy.yml
5. BROWSER — Section 3: GitHub Actions tab
6. TALK — Section 4 Act 1: the Before
7. CURSOR — Section 4 Act 2: Memory Bank, cursor rules, git diff
8. BROWSER — Section 5: contact form on live site, Google Sheet
9. CURSOR — Section 5: AppScript code, analytics.mdc
10. TALK — Section 5 closer, Section 6, Section 7

That's ~10 app switches in 30 minutes. Every switch costs the audience a few seconds to reorient.

---

## Proposed: 3 phases, 2 major switches

### PHASE 1: BROWSER (~8 min)
*"Here's what the site is, and the proof that simplicity works"*

**Setup + tour (Section 1 content)**
- Live site: click through pages
- Bike metaphor, Wirth quote, thesis: "every interesting decision was a removal"

**The Proof (Section 3 content, moved earlier)**
- Run Lighthouse in DevTools (talk through why you expect good numbers while it runs)
- Show scores
- Firebase Console: usage dashboard, $0/month hosting
- Cost arc: used to be $20/month, now $15 every two years
- Fathom screenshot: what we learned before removing it

**Contact form + Google Sheet (from Section 5)**
- Show the contact form on the live site
- Show the Google Sheet receiving submissions
- Quick mention: "I'll show you the backend code in a minute"

**Deployment proof (from Section 3)**
- GitHub Actions tab: show a recent green-checkmark run
- "Push to main, site is live. I'll show you the 83 lines that make this happen."

> **SWITCH TO CURSOR** (one time)

### PHASE 2: CURSOR (~14 min)
*"Here's how it's built, and how AI helps me maintain it"*

**The Stack (Section 2 content)**
- Project structure in sidebar, config.yml, package.json
- Gemfile walkthrough, Why Jekyll, 11ty alternative
- Data directory: testimonials.yml → testimonials.html

**Components + Dev Experience (Section 2 content)**
- Donate button: 31 lines, co-location
- Browsersync live demo: change bg-teal-700 → bg-red-700, undo
  (Browsersync browser is side-by-side, not a full app switch)
- Contact page: 631 lines, Locality of Behavior
- default.html: 18 lines

**The Backend Code (from Sections 3 + 5)**
- firebase-deploy.yml: "Here's that deployment pipeline — 83 lines of YAML, AI wrote it"
- google-apps-script-code.js: "Here's the backend for the Google Sheet you just saw"
- analytics.mdc: "Here's how we documented removing Fathom"

**The Before story (Section 4 Act 1 — talk over Cursor)**
- Pause the code tour. Talk to the audience.
- Ruby dependency hell, re-learning the project, Alpine syntax
- "Then Jerad introduced me to Cursor and memory-bank."

**The After: Memory Bank + AI (Section 4 Act 2)**
- memory-bank/ folder, activeContext.md, systemPatterns.md, techContext.md
- memory-bank.mdc, core.mdc, dev-workflow.mdc
- Git diff: Alpine → vanilla JS migration
- navigation.js: 46 lines, the only JS shipped
- Claude.md mention
- "It lets me continue to say yes to a volunteer project over six years"

> **DONE WITH CURSOR** (put live site back on screen as backdrop)

### PHASE 3: TALK (~8 min)
*"The subtraction story, and what it means for us"*

**Subtracting Our Way to a Better Site (Section 5 closer)**
- Calendar widget: Full Calendar for static hours
- Formspree → Google Sheets: "you already saw the sheet and the code"
- Fathom: GA is 19KB/46KB, even Fathom adds weight, we had enough data
- Gallery: wasn't getting views, removed it
- "Could I just not?" — five removals, four years, fixed gear bike

**So What for Lullabot (Section 6)**
- Right-sizing, PostHog GitHub CMS reference
- Free infrastructure
- AI and the maintenance equation

**Discussion (Section 7)**
- Questions + prompts

---

## What this restructure gains

- **2 major switches** instead of 10 (Browser → Cursor → Talk)
- Browser block is self-contained: everything the audience sees as a "user" is front-loaded
- Cursor block is uninterrupted: you stay in the editor for the entire technical deep dive
- The "Before" story happens verbally while Cursor is on screen — no switch needed, just a pause in the code tour before revealing Memory Bank
- Talk block needs no screen at all (live site as backdrop is optional)

## What moves around

- Lighthouse/Firebase/Fathom screenshot move from Section 3 to Phase 1 (earlier)
- Contact form live demo + Google Sheet move from Section 5 to Phase 1 (earlier)
- GitHub Actions green checkmark moves from Section 3 to Phase 1 (earlier)
- Deployment YAML + AppScript code + analytics.mdc move into the Cursor block
- The "Before" pain story stays right before the Memory Bank reveal (same dramatic arc, just happens inside the Cursor phase)
- The subtraction narrative (calendar, Formspree summary, Fathom summary) becomes a verbal recap in Phase 3, referencing things the audience has already seen

## Trade-off

The subtraction stories in Phase 3 become "remember when I showed you..." callbacks instead of live demos. The contact form and Google Sheet have already been shown in Phase 1, and the AppScript code has been shown in Phase 2. You're summarizing and connecting the dots rather than showing new things. For the calendar widget and gallery, those were always verbal stories anyway — no live demo needed.
