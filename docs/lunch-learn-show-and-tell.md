# Carbondale Bike Project: Lunch & Learn Show & Tell


## Section 1: The Setup (2 min)

**What to show:** Browser → live site homepage. Click around briefly — About, Programs, Contact, back to Home.

**Talking points:**

This is the Carbondale Bike Project. It's a local nonprofit. They take donated bikes, refurbish them, and get them to people who need them. As a relatively unskilled bike mechanic who could fix a flat, put a chain back together, and maybe adjust an v-brake, I learned a lot about the maintenance of modern bicycles. Beyond derailleurs to adjust there were hydraulic brakes to drain, hidden cables, complex hub assemblies, and, worst of all, hydraulic shock systems that were often not owner serviceable. While these things enable all kinds of biking, they’re a maintenance nightmare.

If this website site were a bike it would be a sleek, black Surly Steamroller: fixed gear, no suspension, and old-school cantilever brakes. This would be a bike with the minimum possible things to maintain and the ability for a volunteer to maintain at the Bike Project—a bike where I can understand and maintain every part by myself.

Jen Witkowski designed this site in Figma six years ago after a lean research phase. I built and maintain it. The original version used just Sass (for CSS) and AlpineJs for JavaScript.

Zero budget for infrastructure. One volunteer developer — me — who touches this project maybe once a month, sometimes less. Every technology choice has to justify itself against one question: does this make the site harder for a solo volunteer to maintain?

Here's the thing I want you to take away from this talk: almost every interesting decision on this project was a removal. We removed Alpine.js. We removed a paid form service. We removed the gallery when we saw it wasn’t getting page views. We removed analytics. The site got better in terms of performance, maintenance, and cost each time something came out. I want to show you what's left, and why what's left is enough.

---

## Section 2: The Stack (4 min)

**What to show:** Switch to Cursor. Open the sidebar showing the project structure briefly, then open `_includes/header.html`.

**Talking points:**

The stack is Jekyll for static site generation, Tailwind for CSS, vanilla JavaScript — not React, not Alpine, vanilla — Firebase Hosting, and GitHub Actions for CI/CD. That's it. There's no CMS. There's no database. There's no server. Notice how short that list is. That's on purpose.

Honestly, Tailwind is probably next when I get the time, but I haven't seen AI be as good at vanilla CSS as it is at Tailwind.

### Why Jekyll

**[Show the `Gemfile` in Cursor — it's 7 lines.]**

Before I show components, let me talk about why Jekyll specifically. Here's the entire Gemfile — seven gems:

- `jekyll` — the static site generator itself. Markdown and Liquid templates in, HTML out.
- `jekyll-feed` — generates an RSS feed automatically.
- `jekyll-seo-tag` — handles meta tags, Open Graph, structured data. I don't think about SEO plumbing, it just works.
- `jekyll-responsive-image` — generates multiple image sizes at build time. That's how we get seven breakpoints for the hero banner without manually creating each one.
- `jekyll-redirect-from` — handles URL redirects in YAML front matter instead of server config.
- `nokogiri` — HTML/XML parser that Jekyll uses under the hood. This is actually the gem that causes the most dependency pain — it compiles native C extensions, which is where the "Saturday afternoon debugging `bundle install`" stories come from.
- `webrick` — the local development server. 

That's it. Seven gems. Compare that to a `package.json` for a Next.js project.

The reason I chose Jekyll over, say, Next.js or Gatsby is stability. Jekyll has been around since 2008. The documentation is excellent. The templating language — Liquid — is simple enough that you can learn it in an afternoon. And critically, it doesn't update that often. For a project I touch once a month, that's a feature, not a bug. I don't come back to find that the framework shipped a major version while I was absent and now my build is breaking for untold reasons.

If I were starting fresh today, I'd probably look at 11ty. It's philosophically similar — simple, stable, great docs, convention over configuration — but it runs on Node, which would eliminate the Ruby dependency entirely. No more `bundle install` headaches, no more nokogiri. But Jekyll works, it's proven.

### Data in Jekyll: The `_data` Directory

**[Open `_data/testimonials.yml` in Cursor — show the first few entries.]**

One useful thing about Jekyll is the `_data` directory. You put YAML files here and they're available in your templates as `site.data`. This is `testimonials.yml` — an array of objects, each with an `author` and a `quote`.

**[Now open `_includes/testimonials.html` — it's 28 lines.]**

And here's how it's consumed. This template iterates over `site.data.testimonials` with a Liquid `{% for %}` loop, builds a JavaScript array from the YAML data, and then picks a random testimonial to display on each page load. Data file, template, done. No API call, no database query, no GraphQL schema. YAML in, HTML out.

This pattern works for anything you'd store in a simple database table — the testimonials, image galleries, video embeds. For this site, it's enough. I update a YAML file, push to git, and the site rebuilds.

### Component Demo: The Donate Button

**[Open `_includes/donate-button.html` in Cursor. Let the audience read it — it's only 31 lines.]**

I want to start with the simplest component on the site, because it tells the whole story. This is the donate button. Thirty-one lines. Let me walk through what's here.

Line 1: a div with Tailwind utility classes — shadow, fixed height, flex shrink. I use Tailwind's implementation of Flexbox for most of the layout. That's the container.

Line 2-6: an anchor tag. The `href` goes to Venmo. The classes handle everything visual — `bg-teal-700` for the brand color, `hover:bg-gray-900` for the hover state, `transition duration-150` for the animation. Look at what's NOT here: no separate CSS file, no SCSS partial, no BEM class names. The styling is declared right where it's used.

Lines 8-28: an inline SVG arrow icon. Not an icon font. Not a React component. Not an import. The actual SVG paths, right here in the HTML.

That's the whole component. Markup, styling, icon, behavior — all in one file. If I need to change the button color, I change one class. If I need to change the icon, I change the SVG paths. If I need to understand what this component does, I open one file. This is what you get when you take things away. No framework means no component abstraction layer. No build step for JS means no import system. What's left is just HTML.

### Live Dev Demo: Browsersync

**[IMPORTANT: Before the talk, make sure `npm run dev` is already running in a terminal tab. Have the Browsersync local URL (`http://localhost:4000`) open in a browser window side-by-side with Cursor, or on a second monitor. The audience needs to see both the code and the browser at the same time.]**

Let me show you what the development experience actually feels like. I've got `npm run dev` running — that's Gulp building Jekyll, processing Tailwind through PostCSS, and serving the site through Browsersync with live reload.

**[Position Cursor and the browser so both are visible. In Cursor, find line 6 in `_includes/donate-button.html` — the line with `bg-teal-700`. Change it to `bg-red-700`. Save the file.]**

Watch the browser. I'm changing the donate button from teal to red — just swapping one Tailwind class.

**[The browser should auto-reload within a second or two, showing the red button.]**

There it is. I saved the file, Browsersync detected the change, Jekyll rebuilt, the browser refreshed — all automatically. When I was building this site, this feedback loop was everything. Change a class, see it instantly. No waiting for a build. No refreshing manually. You're just iterating in real-time. When I start on a component, I often pull a prototype from tailwindui.com and then work on it with live reloading on play.tailwindcss.com

**[Now hit Cmd+Z to undo the change in Cursor. Save again. The button goes back to teal.]**

And undo puts it back. 

### Scaling Up: The Contact Page

**[Show `30-contact.html`]** — Now here's the same pattern at a bigger scale. The contact page is a single file, 631 lines, but it contains everything: the markup, the layout, the form, the client-side validation, the form submission handler, the honeypot spam protection. Scroll through it. Everything about how this page works lives in one place.

There's a principle called "Locality of Behavior" — the idea that "when your components are pretty simple, it's usually better to be able to see everything at once." That's what you're looking at. This is the co-location pattern taken to its logical conclusion. You don't have to hunt across five files to understand what a component does. Trade-off? Yeah, a 631-line file isn't ideal if you have a team of ten working on it. But I don't. I have me, and I might not look at this code for a month. When I come back, I open one file and I know everything.

**[Show `_layouts/default.html` briefly]** — And the whole layout layer is this. 18 lines. Conditional banners, a `<main>` content wrapper, conditional homepage sections, footer. Jekyll does what it does well — templates and includes — and gets out of the way.

---

## Section 3: The Proof (4 min)

**What to show:** Switch to Chrome. Tab 1 (homepage). Open DevTools → Lighthouse. Run a Performance + Accessibility audit on mobile. While it runs, talk through why you expect good scores.

**Talking points:**

Let me just run Lighthouse live. While it's working, let me tell you why I expect good numbers, and you can check my work.

Static HTML on a CDN. That's the whole performance story. There's no server rendering, no hydration step, no client-side routing. The browser gets HTML and renders it. You don't optimize your way to scores like these. You get there by not adding the things that make sites slow in the first place.

**[While Lighthouse runs]** Let me count the JavaScript this site ships. One file. `navigation.js`, 46 lines, about 1.6 kilobytes before minification. It handles the mobile hamburger menu toggle. That's all the JavaScript on this entire site. There's no framework, no bundle, no code splitting because there's nothing to split.

Images — the hero banner uses `<picture>` elements with WebP and responsive `srcset` at seven breakpoints from 150px to 1280px. The critical hero image has `fetchpriority="high"` and `loading="eager"`. Everything below the fold gets `loading="lazy"`. Inline SVGs for all the icons — no Font Awesome, no icon font network request.

The only external script is reCAPTCHA, and it only loads on the Contact page. Check `_includes/head.html` — there's a Liquid conditional: `{% if page.title == 'Contact' %}` — so the homepage never even requests it.

So there are your numbers.

**[Switch to Firebase Console Usage tab — `console.firebase.google.com/project/woc-bike-project-org/usage`]** — And here's the infrastructure cost. This is the Firebase usage dashboard. You can see the bandwidth, storage, and request counts charted against the free tier limits. Firebase Spark plan gives you 10GB storage and 10G/month downloads. Look at where our usage sits relative to those limits — we're barely a rounding error. Hosting is free.

But it wasn't always this cheap. The site used to run about $20 a month — Formspree for the contact form was around $8, Fathom Analytics was another $14. Those are both good services, and I don't regret using them. But over time I replaced Formspree with Google Sheets and AppScript — free — and removed Fathom entirely once we'd learned what we needed. So the monthly cost went from $20 to zero. The only thing I pay for now is the domain name renewal at Namecheap, which is something like $15 every two years. That's the entire operating cost of a production website. Each removal made the next one easier to justify. Once Formspree was gone and the bill dropped, removing Fathom was obvious. The savings compound in better performance.

Here’s the last Fathom dashboard from September 2025. Fathom helped us realize no one used the photo gallery, that we had about 50% more mobile users than Desktop users, and how many conversions we were roughly seeing.

### How It Gets Deployed

**[Switch to Cursor. Open `.github/workflows/firebase-deploy.yml`.]**

And here's how code gets from my local to that Firebase CDN. This is the entire deployment pipeline — 83 lines of YAML. AI wrote this. I described what I needed and it generated the whole workflow.

Here's how it works: whenever any code is pushed or merged into `main` on GitHub, this Actions workflow fires automatically. It spins up an Ubuntu server, installs Ruby and Node, pulls down all the dependencies, injects the secret keys — Firebase credentials, the webhook URL for the contact form — builds the site with `npm run build:production`, and deploys it to Firebase Hosting. That's it. Push to main, site is live.

**[Switch to the GitHub Actions tab in the browser. Show a recent green-checkmark run. Click into it briefly to show the step names.]**

Here's a recent run. You can see the steps — checkout, install dependencies, build, deploy. The whole thing takes a couple minutes. No staging environment, no manual approval, no deploy button to click. For a bike shop website with one maintainer, this is exactly the right amount of process.

The important thing here is that I didn't have to learn GitHub Actions syntax to set this up. I told the AI what I wanted — "deploy to Firebase when I push to main, inject these secrets during build" — and it wrote the workflow. That YAML file is 83 lines I've barely read. It just works.

---

## Section 4: Before & After — How AI Changed Everything (8-10 min)

**This is the centerpiece. Take your time here.**

### Act 1: The Before (3 min)

**What to show:** Nothing specific — talk to the camera/audience. Maybe show the Gemfile briefly.

**Talking points:**

It used to be harder to maintain this site, even though I understood the code. I'd get a request from the bike project — update the hours, add a news story, fix the donate button. Simple stuff. But I hadn't touched the project in three weeks, and that's where the pain started.

First: Ruby dependency hell. Every time I came back, something had broken. Nokogiri needed a new native extension. A gem version conflicted. Bundler wanted a different Ruby version than what my local provide on a new version of MacOS and xCode. I'd spend an hour just getting `bundle install` to work before I could change a single line of content. For a volunteer project. On a Saturday afternoon. Usually, this would end in a call to James Sansbury to help fix my local.

Second: re-learning the project. Where are the templates? What's the include structure? What layout does this page use? How does the donation component work? Every time I opened this codebase cold, I'd spend a few minutes poking around, re-reading files, remembering how Jekyll works, before I could start the actual task.

Third: building components. The site used to use Alpine.js for interactive behavior. Alpine is like the Tailwind of JS frameworks, a cool micro-framework that can live inside the markup. We used to have a photo gallery with some more complex interactions. That meant writing Alpine directives — `x-data`, `x-show`, `@click` inside the HTML. Once that was gone, carrying Alpine for a mobile menu toggle seemed exccessive. Every new component meant digging through the Alpine bindings to remember the syntax. (Once I had AI to help I was able to just rewrite all behaviors with vanilla Javascript.)

### Act 2: The After (5-7 min)

**What to show:** This is the big reveal. Switch to Cursor. Walk through Memory Bank and cursor rules live.

**Talking points:**

Then Jerad Bitner introduced me to Cursor and memory-bank.

**[Open the Cursor sidebar. Click on the `memory-bank/` folder to show all 7 files.]**

This is the Memory Bank. Seven markdown files that capture everything an AI assistant needs to know about this project. Let me show you what Cursor sees when I open this project cold after three weeks away.

**[Open `memory-bank/activeContext.md`]**

This is `activeContext.md`. It's the "what are we working on right now" file. Look — it tells you the contact form was migrated from Formspree to Google Sheets. It tells you about the honeypot spam protection. It tells you the Kickstand Club progress bar is at 105 of 120 bikes. It lists what's next. If you read this one file, you know exactly where the project stands.

**[Open `memory-bank/systemPatterns.md`]**

This is `systemPatterns.md`. Architecture decisions. It documents the form submission flow — client-side validation, honeypot field, Google Apps Script webhook, how the webhook URL gets injected via GitHub Secrets during build. If I ask the AI "how does the contact form work," it doesn't have to read every file — it already knows.

**[Open `memory-bank/techContext.md`]**

Tech context — the dependency list, the build commands, the external services. This is the stuff I used to have to re-discover every time.

**[Now open `.cursor/rules/memory-bank.mdc`]**

But here's the key. This cursor rule — `memory-bank.mdc` — this is what makes it all work. Read the first paragraph: "I am Cursor, an expert software engineer with a unique characteristic: my memory resets completely between sessions." It tells the AI to read ALL memory bank files at the start of EVERY task. Not optional. It defines the file hierarchy, the update workflow, when to write back to the files.

The Memory Bank solves my re-learning problem. I don't have to remember anything. The AI doesn't have to remember anything. The documentation is the memory.

**[Open `.cursor/rules/core.mdc`]**

And this is the Plan/Act mode rule. It says: start in Plan mode. Gather information. Don't change anything until I type "ACT." This prevents the AI from just charging ahead and breaking things.

**[Open `.cursor/rules/dev-workflow.mdc`]**

And this encodes the git workflow — feature branches, naming conventions, build verification steps. The AI follows the same process a human developer would.

**[Now switch to terminal. Run the git diff command.]**

```bash
git diff f92cc63^..f92cc63 -- _includes/header.html _includes/head.html
```

Here's a concrete example. This diff is the Alpine.js to vanilla JavaScript migration. Look at what changed in `header.html`: `x-data="{ isOpen: false }"` became nothing. `@click="isOpen = !isOpen"` became an ID that vanilla JS can grab. `:class` bindings became simple class toggles.

**[Show `src/js/navigation.js`]**

And here's the replacement. Forty-six lines of vanilla JavaScript. `addEventListener`, `classList.toggle`, `getElementById`. No framework, no build dependency, no CDN request. The AI wrote this in a single prompt. Check the commit message:

```bash
git show f92cc63 --stat
```

"Replace Alpine.js with vanilla JavaScript. Six files changed, 76 insertions, 9 deletions. One prompt, one migration.

So for me, the AI thing isn't really about writing code faster. It's that it eliminated the maintenance tax that was making volunteer work unsustainable. The Memory Bank means zero re-learning time. The cursor rules mean the AI follows my project's conventions. Components that used to take 30-60 minutes now come from a single prompt. And entire migrations — like Alpine to vanilla JS — happen in minutes instead of hours.

I was easily able to update my Claude.md file from this memory-bank for when I just want to work in Claude Code, which is increasingly common now that the Desktop version is available.

It lets me continue to say yes to a volunteer project and actually sustain it over six years.

---

## Section 5: Subtracting Our Way to a Better Site (5-6 min)

**Talking points:**

I said at the beginning that almost every interesting decision on this project was a removal. Let me show you three of them, and then I want to talk about why that pattern keeps working.

### Formspree → Google Sheets + AppScript

**What to show:** Browser → contact form on the live site. Fill in a test submission (or just show the form). Then switch to the Google Sheet tab showing submissions. Then switch to Cursor and show `docs/google-apps-script-code.js`.

**[Show the contact form on the live site]**

The contact form used to use Formspree. Formspree is fine — it's a form backend service, about $8/month for the plan we'd need. But we were only getting 1-2 contact requests in a month. Plus, the Carbondale Bike Project already uses Google Workspace. They live in Google Sheets. So the question became: can we just send form submissions directly to a Google Sheet?

**[Switch to the Google Sheet tab]**

Yes. That's it. Timestamp, name, email, phone, message. The org checks this the same way they check everything else — by opening a Google Sheet.

**[Show `docs/google-apps-script-code.js` in Cursor]**

Here's the backend. It's a Google Apps Script — about 100 lines of JavaScript that runs as a webhook. It receives POST requests, parses the JSON, validates required fields, and appends a row to the sheet. The contact form submits directly to this.

The interesting engineering bit: we send the data as `text/plain` instead of `application/json`. That makes it a "simple request" under CORS rules, which means no preflight OPTIONS request. We fought CORS issues for several commits before landing on that — you can see it in the git history. The AI and I worked through that together, and the Memory Bank captured the solution so we'd never have to figure it out again.

Total cost: zero. Maintained by Google's infrastructure. The org already knows how to use it.

### Dropping the Calendar Widget

This one's my favorite because it's so obvious in hindsight. For a long time, the site had a calendar application that displayed a detailed calendar view of the shop hours. A full interactive calendar uses calendar.js from Full Calendar. For hours that were the same every single week. We were loading a calendar dependency to show something that could be — and now is — a few lines of static text. That's the "could I just not?" question at its purest. Do I need a widget for this, or do I just need words on a page?

### Dropping Analytics Entirely

**What to show:** Show `.cursor/rules/analytics.mdc` in Cursor — it documents exactly what was removed and how to re-enable it.

**Talking points:**

**[Show `analytics.mdc`]**

We ran Fathom Analytics for about a year. Fathom is privacy-focused and way lighter than Google Analytics — but "lighter" is relative. Even Fathom adds JavaScript to every page load. The go-to alternative, Google Analytics, is 19KB of JavaScript, 46KB uncompressed. Fathom is smaller, but it's still weight. We tracked two events: donate button clicks and contact form submissions. We learned what we needed to learn — how many people visit, where they come from, which pages matter (the gallery did not), and how many conversions we were getting in a month.

And then we removed it. Completely. Not replaced it, removed it.

Look at this cursor rule — `analytics.mdc`. It documents exactly what was removed, from which files, and exactly how to re-enable it if they ever want to. That's the Memory Bank earning its keep again — we didn't just delete code, we documented the decision so the next person (or the next AI session) understands why.

**[Show screenshot of Fathom Analytics from September 2025]**

But the decision itself is what I want to talk about. In an industry that defaults to "collect everything," we asked: what does "enough" look like? We had enough data. The site wasn't going to change strategy based on an extra six months of analytics. So we stopped collecting it. One fewer external script. One fewer vendor dependency. Slightly better performance.

That's the pattern running through all of this: "could I just not?" Could I just not have analytics? Could I just not use a form service? Could I just not run a framework for a menu toggle? Every time the answer was yes, and every time the site got a little simpler, a little cheaper, a little easier to come back to after a month away.

Alpine.js, Formspree, Fathom, the calendar widget, the photo gallery. Five removals over four years. The site didn't get worse. It got better. Faster, cheaper, fewer things to break. What's left is a site I built myself, I understand all of it, and it runs on a static file host. Like a fixed gear bike.

---

## Section 6: So What? (5 min)

So why am I showing you a Jekyll site when we build complex Drupal platforms for state governments? Good question! I don't know. (Kidding, mostly.)

Three reasons.

First: (and most obvious) right-sizing. We should be the agency that tells clients "you don't need a CMS for this when that makes sense." Not every project needs Drupal. Not every project needs a headless architecture. Some projects need a static site, a good deploy pipeline, and content as markdown files in Github. I think this is great for small, poor, mission-driven non-profits. But for our clients, it’s also great for microsites. The client initially edited the Github markdown directly with Prose.io as their "CMS." PostHog wrote a whole blog post about why they use GitHub as their CMS — their argument is that people don't want to spend time in a CMS, they want to use tools they already know. For this project, that turned out to be true. Maybe there's contexts where this could work for our clients too. It's fast and cheap to produce, and even cheaper to maintain.

Second: Most of you know this, but free infrastructure is real, and it's good. Firebase free tier, Cloudflare Pages, Github Pages, Netlify, Vercel — the hosting options for static sites are really good and actually free. GitHub Actions for CI/CD is free for public repos and generous for private ones. Do we know this landscape well enough to recommend it when it's the right fit? Because some of our clients have microsites, campaign pages, landing pages that absolutely do not need the infrastructure we'd normally recommend.

Third: AI and the maintenance equation. The Memory Bank and Plan/Act pattern I showed is useful in a lot of contexts. Mateu's AI task manager is a much more sophisticated version of this. Claude Code can also be toggled into Plan mode. I always make a plan now before I start anything with AI now. Setting up context early and managing it well has helped me a lot. And, in this case, it helps on a project where you have intermittent contributors — open source projects, volunteer work, rotating team members, client projects where you come back for Phase 2 six months later — the maintenance tax is real and AI can help with that.

---

## Section 7: Discussion (5 min)

**Any questions:**

**[If there's time left]**


## Useful Articles
- https://posthog.com/blog/github-cms
- https://dev.to/ralphcone/new-hot-trend-locality-of-behavior-1g9k
- https://benhoyt.com/writings/the-small-web-is-beautiful/

## Top 6 "Show, Don't Tell" Moments

These are the places where showing actual code makes the argument better than any slide could.

### 1. The Donate Button: A Complete Component in 31 Lines

**What:** Open `_includes/donate-button.html`. Read it top to bottom. Then click the button on the live site.
**Why it works:** This is the easiest way into the co-location argument. Everyone in the room — designers, developers, PMs — can read 31 lines of HTML and understand the entire component in under a minute. Markup, Tailwind classes, inline SVG icon, link target. No abstractions, no indirection, nothing to look up. It grounds the whole "everything in one file" narrative in something concrete before you scale up to the 631-line contact page. Start small, then go big.

### 2. The Alpine.js → Vanilla JS Diff

**What:** `git diff f92cc63^..f92cc63 -- _includes/header.html`
**Why it works:** The before/after is immediately legible. Alpine directives disappear, replaced by plain HTML attributes. The audience sees the complexity leaving in real-time. The commit message ("Co-Authored-By: Claude") proves the AI did the migration.

### 3. The Memory Bank Cold Open

**What:** Open Cursor fresh, expand the `memory-bank/` folder, open `activeContext.md`.
**Why it works:** Every developer in the room has felt the pain of returning to a project after weeks away. Seeing a structured, current snapshot of project state — maintained by AI — clicks right away.

### 4. The Contact Form: Everything in One File

**What:** Open `30-contact.html`, scroll through it slowly.
**Why it works:** 631 lines, one file: markup, layout, validation, submission handler, spam protection, error handling. For a team that debates component architecture daily, seeing radical co-location working in practice is worth chewing on. The contrast with the donate button is the point — same pattern, different scale, both work.

### 5. One JavaScript File

**What:** Open `src/js/navigation.js` (46 lines). Say: "This is all the JavaScript this site ships."
**Why it works:** In a world of multi-megabyte bundles, a fully functional production website shipping 1.6KB of JavaScript is a punchline that lands.

### 6. The Firebase Usage Dashboard

**What:** Open `console.firebase.google.com/project/woc-bike-project-org/usage` and show the usage charts.
**Why it works:** Numbers on a slide are abstract. A live dashboard showing your production site's bandwidth sitting at a fraction of the free tier — that's concrete. The audience can see the gap between "what we use" and "what we'd have to pay for" in real-time. It backs up the $0/month claim in a way that's hard to argue with.

### 7. The dependency chart that tells the whole story

The entire production dependency tree for the end user is: one HTML file, one CSS file, one 46-line JS file, and images. Everything else (Jekyll, Gulp, Tailwind, PostCSS, Babel) is build-time only. The deployed site has zero runtime dependencies. Compare that to a typical modern web project's `node_modules` folder.


## Pre-Show Checklist

**Browser tabs (Chrome):**

1. Live site: `https://carbondalebikeproject.org` (homepage)
2. Live site: `https://carbondalebikeproject.org/contact/` (contact form)
3. GitHub repo: `https://github.com/sethlbrown/woc-bike` → Actions tab open
4. Firebase Console Usage: `https://console.firebase.google.com/project/woc-bike-project-org/usage` (this is the direct link to the usage dashboard — shows bandwidth, storage, and request counts against free tier limits)
5. PageSpeed Insights: `https://pagespeed.web.dev/` — have it loaded with the site URL ready as a backup, but plan to run Lighthouse locally in DevTools during the talk. If live Lighthouse is slow or flaky on conference Wi-Fi, switch to this tab with pre-run results.
6. Google Sheet receiving form submissions (have it open, show the column headers and a few rows)
7. Jekyll Documentation: `https://jekyllrb.com/docs/` — for reference if anyone asks about static site details or build process

**Cursor (have these files open in tabs, in order):**

1. `Gemfile` — open in editor (the Jekyll intro)
2. `_data/testimonials.yml` — open in editor (structured data example)
3. `_includes/testimonials.html` — open in editor (template consuming data)
4. `_includes/donate-button.html` — open in editor (the component demo)
5. `_includes/header.html` — open in editor
6. `src/js/navigation.js` — open in editor
7. `30-contact.html` — open in editor
8. `_layouts/default.html` — open in editor
9. `memory-bank/` folder expanded in the sidebar (all 7 files visible)
10. `memory-bank/activeContext.md` — open in editor
11. `.cursor/rules/memory-bank.mdc` — open in editor
12. `.cursor/rules/core.mdc` — open in editor
13. `.cursor/rules/dev-workflow.mdc` — open in editor
14. `.github/workflows/firebase-deploy.yml` — open in editor
15. `firebase.json` — open in editor
16. `docs/google-apps-script-code.js` — open in editor

**Terminal (Cursor integrated terminal):**

1. **`npm run dev` must be running before the talk starts.** Start it a few minutes early so the initial build is done. Verify Browsersync is serving at `http://localhost:4000` and that changes to an HTML file trigger a reload. You'll use this for the live color-change demo in Section 2.
2. Have a second browser window open to `http://localhost:4000` — position it so you can see it alongside Cursor during the donate button demo.

Have this git command ready to paste (don't run it yet):

```bash
git show f92cc63 --stat
```

And this one for the actual diff:

```bash
git diff f92cc63^..f92cc63 -- _includes/header.html _includes/head.html
```

---