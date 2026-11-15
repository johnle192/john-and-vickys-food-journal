# AGENTS.md

Guardrails for AI agents working in this repo. Every rule here points at
something real in the code. If you find a rule that no longer matches the code,
update this file instead of following it blindly.

The owner is a backend-leaning dev learning frontend. Prefer small, explained
changes over clever ones, and say _why_ a frontend change works when it isn't
obvious.

## What this app is

A single-page map of restaurants John and Vicky have eaten at in Seattle.

- **Stack:** React 18 + TypeScript + Vite 6, Tailwind CSS 3, Mapbox GL JS 2,
  Embla Carousel (mobile only).
- **No backend.** Data is a static file: `src/data/restaurants.json`, imported
  directly in `src/App.tsx`. The old Payload CMS (`../food-journal-cms/`) is no
  longer used. Do not reintroduce a fetch to it or any other API.
- **Layout:** desktop is a list (2/5) next to a map (3/5). Mobile (below
  Tailwind's `lg` breakpoint, 1024px) shows one panel at a time, switched by the
  LIST/MAP pill, and the map view has a swipeable card carousel.

```
src/
  App.tsx                     state owner: activeId, showMap, theme
  common/types.ts             Restaurant type (the data contract)
  data/restaurants.json       all restaurant data
  components/Map.tsx          Mapbox map + markers
  components/RestaurantList.tsx  list + scroll tracking
  components/MobileCarousel.tsx  mobile carousel (Embla)
  css/                        MD3 color/typography tokens + theme files
scripts/geocode.js            one-off: fills in missing coordinates
```

## Commands

| Command | What it does | Status (checked 2026-10-29) |
| --- | --- | --- |
| `npm run dev` | Dev server at http://localhost:5173 | Works. |
| `npm run build` | `tsc` type check, then `vite build` | **Passes.** It warns that the bundle is over 500 kB (mostly mapbox-gl). That warning is expected. |
| `npm run lint` | ESLint with zero warnings allowed | **Passes.** It prints a "React version not specified" notice from eslint-plugin-react, which doesn't count as a warning. |
| `npx prettier --check src scripts` | Formatting check | 9 files are unformatted (see below). |

There are no tests and no CI. **`npm run build` is the only real safety net.**
Run it and `npm run lint` after any change to `.ts` or `.tsx` files.

**Visual changes need a visual check.** The build doesn't catch layout or color
bugs. Run `npm run dev` and look at the page at desktop width and at phone width
(about 390px), in both light and dark mode. If you can't do that yourself, say
so and tell the owner what to look at.

## Data rules (`src/data/restaurants.json`)

- **The shape must match `Restaurant` in `src/common/types.ts`.** App.tsx casts
  the JSON with `as Restaurant[]`. That cast is not checked, so a typo in a
  field name passes the build and fails at runtime.
- **`name` is the unique ID.** It's the React `key`, the `activeId`, and the key
  into `listRefs` and the map markers. Two restaurants with the same name will
  break highlighting and scrolling. Check for duplicates before adding entries.
- **`coordinates` are `[lng, lat]`, longitude first.** That's Mapbox's order.
  Seattle is roughly `[-122.3, 47.6]`. If the first number is positive or around
  47, the values are swapped.
- **`area` values are snake_case** (`west_seattle`). The UI converts them to
  "West Seattle" for display.
- **Order matters.** The number shown on each card and marker is its position in
  the array.
- **To add restaurants:** append them without `coordinates`, then run
  `VITE_MAPBOX_TOKEN=pk.xxx node scripts/geocode.js`. Read the output: any
  "No result for" line means a bad address. If a restaurant is still missing
  coordinates, `Map.tsx` looks it up on every page load. That works, but costs a
  Mapbox request per visit, so don't leave it that way.
- The source of truth is the owner's Google Sheet "SEA food!". Only import rows
  where `Dined` is TRUE and `Address` is filled in. Map the columns to `name`,
  `city`, `area[]`, `cuisine`, `notes`, `address` and `dined`, and skip any name
  that's already in the JSON. Four rows were skipped during the first import
  because their data is bad. They're tracked in the owner's TickTick
  ("Food Journal: fix and re-import the 4 skipped restaurants"). Don't guess
  addresses for them.

## Styling rules

- **Use the theme color names, not raw Tailwind colors.** Write `bg-surface`,
  `text-on-surface`, `bg-primary`, `text-on-surface-variant`,
  `border-outline-variant`, and so on. These are defined in
  `tailwind.config.ts` and follow the Material Design 3 (MD3) naming scheme.
  They switch automatically in dark mode. Hardcoded colors like `bg-white` and
  `text-gray-900` don't, and the codebase already moved away from them.
  - Each `on-X` color is meant for content placed on top of `X`.
    `text-on-primary` belongs on `bg-primary`. On any other background it can be
    hard to read.
  - If you need a color that isn't in the list, add an alias to
    `tailwind.config.ts`. The CSS variable it points to must exist in
    `src/css/theme.light.css`, `theme.dark.css`, **and**
    `theme.override.css`. The manual dark-mode toggle only works through
    `theme.override.css`.
- **Tailwind only generates classes it can find as complete strings in the
  source.** `Map.tsx` builds marker class names in plain strings and toggles
  them with `classList`. That works only because each class appears in full in
  the file. Never build a class name from pieces, like `` `bg-${color}` ``.
- **Dark mode works in two layers.** `theme.css` follows the OS setting through
  `prefers-color-scheme`. `theme.override.css` overrides it based on
  `<html data-theme="...">`, which App.tsx sets from the toggle and saves to
  `localStorage`. Any change to theming must keep both layers working.
- **`src/index.css` still has leftover Vite starter styles** for `button`, `a`,
  `h1` and `body`. The global `button` rule sets `background-color: #1a1a1a`,
  and it comes after Tailwind's reset in the CSS. So any `<button>` without its
  own `bg-*` class shows up dark gray. This is why the inactive LIST/MAP pill
  segment is dark. Give buttons an explicit background, or clean up
  `index.css` deliberately in a separate change.
- Icons come from a **Font Awesome Pro kit** loaded in `index.html`
  (`fa-duotone fa-light ...`). There's no npm package for it, so icons won't
  show offline. Check that a new icon exists in FA Pro before using it.
- Formatting: Prettier (`.prettierrc.json`) uses single quotes, no trailing
  commas, and `prettier-plugin-tailwindcss` to sort class names. Only format the
  files you change. Reformatting `restaurants.json` or the `css/` token files
  would bury real changes in a huge diff.

## State and sync rules (the trickiest part of the app)

`activeId` (a restaurant name) lives in `App.tsx` and keeps three views in sync:

1. **List → map:** an IntersectionObserver in `RestaurantList.tsx` watches the
   middle 20% of the screen (`rootMargin: '-40% 0px -40% 0px'`). The card inside
   that band becomes active. Cards have `min-h-[60vh]` so the first and last
   cards can reach the band. Don't remove it without testing scroll highlighting
   at both ends of the list.
2. **Marker → list/carousel:** clicking a marker calls `handleMarkerClick`,
   which sets `activeId` and scrolls that card into view.
3. **Active → map:** `Map.tsx` colors the active marker, raises it above the
   others with `z-index`, and `flyTo`s it at zoom 14.
4. **Carousel ↔ active:** `MobileCarousel.tsx` scrolls to the active card, and
   swiping a card sets `activeId`.

Guardrails:

- Each view checks whether something actually changed before updating (for
  example, `selectedScrollSnap() !== idx`). Keep those checks. Without them,
  the views keep triggering each other in a loop.
- `Map.tsx` creates the Mapbox map once (`useEffect(..., [])`) and places
  markers once per map. The `eslint-disable` comments on those effects are
  deliberate: the data never changes while the page is open. If restaurants ever
  become dynamic, this has to be redone. Adding them to the dependency list
  would create duplicate markers.
- Markers are plain DOM elements, not React components. React doesn't
  re-render them, so any style change must go through the `classList` code in
  the `activeId` effect.
- `main.tsx` uses React `StrictMode`, which runs effects twice in development.
  Every effect that creates something (a map, an observer, an event listener)
  must clean it up in its return function.

## Secrets and external services

- `VITE_MAPBOX_TOKEN` lives in `.env.local`, which git ignores (via `*.local`).
  It's a public `pk.` token and is included in the built JS, which is normal for
  Mapbox. Never commit `.env.local`, and never paste the token into code or
  docs. Restrict the token to the site's URL in the Mapbox dashboard.
- Never commit a secret (`sk.`) Mapbox token anywhere.

## Known issues (don't "fix" these on the side)

Change these only when asked, each in its own focused change:

- Mapbox CSS is loaded twice: from a CDN at v2.8.1 in `index.html`, and through
  `import 'mapbox-gl/dist/mapbox-gl.css'` in `Map.tsx`. The installed package is
  v2.15.0.
- The code that formats `area` names is duplicated in `RestaurantList.tsx` and
  `MobileCarousel.tsx`.
- 9 files aren't Prettier-formatted.

## Working agreements

- Don't add dependencies, state libraries, routers, or a backend unless asked.
  Static JSON is a deliberate choice.
- Keep changes small, and match the style of the surrounding code: function
  components, props typed with an `interface`, and Tailwind classes inline.
- Don't commit unless asked. When you do, use `feat:` / `fix:` style messages to
  match the git history.
- Todos live in the owner's TickTick (📔Projects, tag `food-journal`), not in
  a file in the repo.
