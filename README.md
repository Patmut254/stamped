# Stamped ✈ World Flights

A geography game built with React and D3. Every question sends your plane to a country on a world chart. Answer correctly to land there; answer fast and keep a streak going to multiply your points.

- **1,964 questions** across 9 categories: capitals, flags, regions, internet & phone codes, money, languages, neighbours, geography and people
- **3 flight plans**: Quick hop (10 flights), Long haul (25) and Night flight (endless, three lives)
- Animated plane flying great-circle routes on a Natural Earth map projection
- Scoring by difficulty, time left and a streak multiplier (up to ×2)
- Pilot logbook, flight report with per-category accuracy, copyable result
- Unseen questions are served first, and best scores are saved in the browser
- Keyboard play (1 to 4 to answer, Enter for the next flight) and a layout that adapts to phones and tablets

## Tech

React 18, Vite 5, d3-geo, topojson-client, world-atlas, flag-icons and world-countries

## Run locally

```bash
npm install
npm run dev
```

## Deploy

**Vercel**: import the GitHub repo; Vercel detects Vite automatically (build `npm run build`, output `dist`).

**Netlify**: new site from Git, build command `npm run build`, publish directory `dist`. Or run `npm run build` and drag the `dist` folder into Netlify Drop.

**GitHub Pages**: run `npm run build` and publish the `dist` folder (the app uses relative paths, so it works from a repo sub-path).

## The question bank

Questions are generated from the `world-countries` dataset by `scripts/build-questions.mjs`, which writes `src/data/questions.json`. The script uses a fixed seed, so the bank is the same on every run. It also checks that every question has four unique options and exactly one correct answer (for example, a currency or language question only uses distractor countries that do not share that currency or language).

```bash
npm run questions   # regenerate the bank
```

To add a new question type, add another block inside the country loop in the script and run it again.

## Project structure

```
scripts/build-questions.mjs   question generator
src/data/                     generated questions + country coordinates
src/components/WorldMap.jsx   D3 map, routes and the animated plane
src/components/Plane.jsx      aeroplane icon
src/App.jsx                   game state, screens and scoring
src/lib.js                    helpers: deck, distance, storage, flags
src/styles.css                aviation-chart theme
```
