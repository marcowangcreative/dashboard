# Wang Work Brain: Project Context

_Snapshot: April 17, 2026. This is a digest of my in-progress photography and wedding-tech projects. Use it to understand how they connect before helping with any single one._

## At a glance

- **Building now (6):** Travel Planning Tool, Photobox Gallery Creator, Flowed: Hair & Makeup Scheduler, Floweready: Training Portal, Floweft: Hair Line E-commerce, Jordan Wang: Education & Coaching
- **On the light table / ideas (3):** Wedding Shoot Itinerary Maker, Wedding Team Portal, Flowe Collective: Website Redesign
- **Live (2):** Marco Wang Photography: Website Redesign, TimeWellSpent

- **By business:** Photo (3) · Weddings/joint (3) · Hair (4) · Misc (1)

## Photo business (MWP / Marco Wang Creative)

### 01 · Travel Planning Tool
*Trip + shoot-day planner for destination weddings*

- **Status:** Building
- **Stack:** Vercel
- **Next action:** Lock the scope: client-facing, or personal tool only?
- **Links:**
  - Repo: https://github.com/marcowangcreative/travel
  - Host: https://vercel.com/mwp-projects
- **Connects to:** Wedding Shoot Itinerary Maker, Wedding Team Portal, Marco Wang Photography: Website Redesign
- **Notes:**
  > Decide: standalone, or feeds into the wedding itinerary maker? Hosted under MWP Projects on Vercel.

### 02 · Photobox Gallery Creator
*Client-facing photo delivery with favorites & downloads*

- **Status:** Building
- **Stack:** Supabase, Vercel
- **Next action:** Test one real gallery end-to-end: upload, client link, download.
- **Links:**
  - Live: https://box.marcowang.com/
  - Repo: https://github.com/marcowangcreative/photobox
  - DB: https://qlzyanmfhtjkiwunpwwa.supabase.co
  - Host: https://vercel.com/mwp-projects
- **Connects to:** Marco Wang Photography: Website Redesign
- **Notes:**
  > Needs: watermarking, password protection, download controls, favorites.

### 03 · Marco Wang Photography: Website Redesign
*Full portfolio refresh with booking flow*

- **Status:** Live
- **Stack:** Vercel
- **Next action:** Pick 3 reference sites you love. Style direction first, code second.
- **Links:**
  - Repo: https://github.com/marcowangcreative/marcowangphotography
  - Host: https://vercel.com/mwp-projects
- **Connects to:** Photobox Gallery Creator, Wedding Team Portal, Wedding Shoot Itinerary Maker, Travel Planning Tool
- **Notes:**
  > Think about: bookings, about page, local SEO for wedding traffic.

## Weddings: the joint surface where Jordan (hair) + Marco (photo) work together

### 04 · Wedding Shoot Itinerary Maker
*Auto-generates timelines for wedding day photography*

- **Status:** Idea
- **Next action:** Sketch the couple-facing output. PDF? Shared web page? Both?
- **Connects to:** Travel Planning Tool, Flowed: Hair & Makeup Scheduler, Marco Wang Photography: Website Redesign
- **Notes:**
  > Inputs: ceremony time, locations, family shot list, golden hour. Feeds into the Wedding Team Portal.

### 05 · Wedding Team Portal
*Shared workspace where photo + hair teams coordinate a wedding*

- **Status:** Idea
- **Next action:** Decide the thesis: software product for other wedding vendors, or the operating layer for a joint Jordan + Marco wedding brand?
- **Connects to:** Flowed: Hair & Makeup Scheduler, Travel Planning Tool, Floweft: Hair Line E-commerce, Flowe Collective: Website Redesign, Marco Wang Photography: Website Redesign
- **Notes:**
  > Strategic flagship. The hinge between MWP (Marco, photo) and Flowe Collective (Jordan, hair). Jordan + Marco often shoot the same weddings; this portal is their shared surface.
  >
  > Probable surfaces: couple-facing dashboard, vendor-facing task board, shared timeline, day-of comms, gallery delivery handoff to Photobox.
  >
  > Benchmark: https://lovelykindbeauty.com/ (Houston/Austin + destinations). Premium wedding hair+makeup service. Featured Vogue, Martha Stewart, The Knot. 3-step funnel: inquire, consultation, booking link. Key insight: Lovelykind is a SERVICE brand with no software layer. Where we can differentiate: (1) photo + hair combined under one brand, (2) real software tooling (Flowed, Itinerary, Photobox), (3) vendor coordination is a product feature, not a spreadsheet.

### 06 · Flowed: Hair & Makeup Scheduler
*Backward-plans getting-ready from ceremony time*

- **Status:** Building
- **Stack:** Supabase
- **Next action:** List every input you currently ask vendors by hand. That's the form.
- **Links:**
  - Repo: https://github.com/flowecollective/flowed
  - DB: https://supabase.com/dashboard/project/azddbdhnriqagvoyooqs
- **Connects to:** Wedding Shoot Itinerary Maker, Floweready: Training Portal, Floweft: Hair Line E-commerce, Wedding Team Portal
- **Notes:**
  > Should eventually talk to the itinerary maker. Shares Supabase project with Floweready.

## Hair business (Flowe Collective, Jordan)

### 07 · Floweready: Training Portal
*Education platform for salon professionals*

- **Status:** Building
- **Stack:** Supabase
- **Next action:** Map out the course structure: modules, lessons, paywall gate.
- **Links:**
  - Repo: https://github.com/flowecollective/floweready
  - DB: https://supabase.com/dashboard/project/azddbdhnriqagvoyooqs
- **Connects to:** Flowed: Hair & Makeup Scheduler, Jordan Wang: Education & Coaching, Floweft: Hair Line E-commerce
- **Notes:**
  > Shares Supabase project with Flowed. Likely feeds content from Jordan Wang Education coaching.

### 08 · Floweft: Hair Line E-commerce
*Storefront for the Floweft hair product line*

- **Status:** Building
- **Next action:** Pick a commerce engine: Shopify headless, Stripe direct, or Medusa.
- **Links:**
  - Repo: https://github.com/flowecollective/floweft
- **Connects to:** Flowed: Hair & Makeup Scheduler, Floweready: Training Portal, Jordan Wang: Education & Coaching, Wedding Team Portal
- **Notes:**
  > Part of the Flowe Collective family of tools.

### 09 · Jordan Wang: Education & Coaching
*Personal brand site for salon coaching & education*

- **Status:** Building
- **Next action:** Decide: is this a marketing site, or does it host the coaching itself?
- **Links:**
  - Repo: https://github.com/flowecollective/Jordanwangco-
- **Connects to:** Floweready: Training Portal, Floweft: Hair Line E-commerce, Flowe Collective: Website Redesign
- **Notes:**
  > Umbrella personal brand. Ties into Floweready training and the broader Flowe Collective.

### 10 · Flowe Collective: Website Redesign
*Brand site refresh for the collective*

- **Status:** Idea
- **Next action:** Decide the role: storefront, services hub, or brand umbrella over Flowed + Floweready + Floweft?
- **Connects to:** Flowed: Hair & Makeup Scheduler, Floweready: Training Portal, Floweft: Hair Line E-commerce, Jordan Wang: Education & Coaching, Wedding Team Portal
- **Notes:**
  > Parallels the Marco Wang Photography redesign on the photo side. Needs to tell the story of the three sub-brands without burying any of them.

## Misc

### 11 · TimeWellSpent
*Mobile app, live on the App Store*

- **Status:** Live
- **Stack:** Vercel, Railway
- **Next action:** Decide what's next: v2 features, growth push, or let it run?
- **Links:**
  - Repo · App: https://github.com/marcowang-ai/timewellspentapp
  - Repo · Backend: https://github.com/marcowang-ai/timewellspent-backend
  - Host · Web: https://vercel.com/mwp-projects
  - Host · Backend: https://railway.com/project/924fd199-47c1-46c6-aee6-82df3e2375ec
- **Notes:**
  > Already shipped & live on the App Store.
  >
  > Split architecture: mobile app (timewellspentapp) + separate backend API (timewellspent-backend). Marketing/web on Vercel under MWP Projects. Backend server deployed on Railway.

## How things connect

- Travel Planning Tool ↔ Wedding Shoot Itinerary Maker
- Travel Planning Tool ↔ Wedding Team Portal
- Travel Planning Tool ↔ Marco Wang Photography: Website Redesign
- Photobox Gallery Creator ↔ Marco Wang Photography: Website Redesign
- Marco Wang Photography: Website Redesign ↔ Wedding Team Portal
- Marco Wang Photography: Website Redesign ↔ Wedding Shoot Itinerary Maker
- Wedding Shoot Itinerary Maker ↔ Flowed: Hair & Makeup Scheduler
- Wedding Team Portal ↔ Flowed: Hair & Makeup Scheduler
- Wedding Team Portal ↔ Floweft: Hair Line E-commerce
- Wedding Team Portal ↔ Flowe Collective: Website Redesign
- Flowed: Hair & Makeup Scheduler ↔ Floweready: Training Portal
- Flowed: Hair & Makeup Scheduler ↔ Floweft: Hair Line E-commerce
- Floweready: Training Portal ↔ Jordan Wang: Education & Coaching
- Floweready: Training Portal ↔ Floweft: Hair Line E-commerce
- Floweft: Hair Line E-commerce ↔ Jordan Wang: Education & Coaching
- Jordan Wang: Education & Coaching ↔ Flowe Collective: Website Redesign
- Flowe Collective: Website Redesign ↔ Flowed: Hair & Makeup Scheduler
- Flowe Collective: Website Redesign ↔ Floweready: Training Portal
- Flowe Collective: Website Redesign ↔ Floweft: Hair Line E-commerce

---
_When you help me with one of these, assume the others exist and may be affected. Flag any overlap or reuse opportunity you notice._
