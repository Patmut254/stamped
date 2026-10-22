// Generates the question bank from the world-countries dataset.
// Run: npm run questions   ->  writes src/data/questions.json and src/data/places.json
import { createRequire } from "module";
import { writeFileSync, mkdirSync } from "fs";
const require = createRequire(import.meta.url);
const all = require("world-countries");

// Seeded RNG so the bank is identical on every build
let seed = 20261022;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

const C = all.filter((c) => c.independent && c.latlng?.length === 2).map((c) => ({
  name: c.name.common,
  cca2: c.cca2.toLowerCase(),
  cca3: c.cca3,
  ccn3: c.ccn3,
  capital: c.capital?.[0],
  region: c.region,
  sub: c.subregion || c.region,
  lat: c.latlng[0], lon: c.latlng[1],
  area: c.area,
  landlocked: c.landlocked,
  borders: c.borders || [],
  tld: c.tld?.[0],
  currencies: Object.entries(c.currencies || {}).map(([code, v]) => ({ code, name: v.name, symbol: v.symbol })),
  languages: Object.values(c.languages || {}),
  demonym: c.demonyms?.eng?.m,
  idd: c.idd?.suffixes?.length === 1 ? c.idd.root + c.idd.suffixes[0] : null,
}));
const byCca3 = Object.fromEntries(C.map((c) => [c.cca3, c]));
const count = (arr) => arr.reduce((m, v) => (m[v] = (m[v] || 0) + 1, m), {});

const Q = [];
let seq = 0;
const fmtArea = (n) => Math.round(n).toLocaleString("en-GB");

// pick distractor countries, preferring the same subregion/region, filtered by `ok`
function pickOthers(subject, n, ok = () => true) {
  const same = shuffle(C.filter((c) => c !== subject && c.sub === subject.sub && ok(c)));
  const reg = shuffle(C.filter((c) => c !== subject && c.sub !== subject.sub && c.region === subject.region && ok(c)));
  const rest = shuffle(C.filter((c) => c !== subject && c.region !== subject.region && ok(c)));
  return [...same, ...reg, ...rest].slice(0, n);
}
function add(q) {
  const labels = q.options.map((o) => o.label);
  if (new Set(labels).size !== labels.length) return; // never duplicate options
  if (q.options.some((o) => !o.label)) return;
  const order = shuffle(q.options.map((_, i) => i));
  Q.push({
    id: ++seq, type: q.type, cat: q.cat, diff: q.diff, prompt: q.prompt,
    flag: q.flag, big: q.big, options: order.map((i) => q.options[i]), answer: order.indexOf(0),
    to: q.to, fact: q.fact,
  });
}
const cOpt = (c) => ({ label: c.name, flag: c.cca2 });

const capCount = count(C.map((c) => c.capital));
const tldCount = count(C.map((c) => c.tld));
const iddCount = count(C.map((c) => c.idd));
const demCount = count(C.map((c) => c.demonym));
const curCount = count(C.flatMap((c) => c.currencies.map((x) => x.name)));
const langCount = count(C.flatMap((c) => c.languages));

for (const c of C) {
  const fact = `Capital: ${c.capital || "none"}. Region: ${c.sub}`;

  if (c.capital && capCount[c.capital] === 1) {
    const o = pickOthers(c, 3, (x) => x.capital && capCount[x.capital] === 1);
    add({ type: "capital", cat: "Capitals", diff: 1, prompt: `What is the capital of ${c.name}?`, flag: c.cca2,
      options: [c, ...o].map((x) => ({ label: x.capital })), to: c.cca3, fact });
    add({ type: "capital-rev", cat: "Capitals", diff: 1, prompt: `${c.capital} is the capital of which country?`,
      options: [c, ...pickOthers(c, 3)].map(cOpt), to: c.cca3, fact });
  }

  add({ type: "flag", cat: "Flags", diff: 2, prompt: "Whose flag is this?", flag: c.cca2, big: true,
    options: [c, ...pickOthers(c, 3)].map((x) => ({ label: x.name })), to: c.cca3, fact });
  add({ type: "flag-pick", cat: "Flags", diff: 2, prompt: `Find the flag of ${c.name}`,
    options: [c, ...pickOthers(c, 3)].map((x) => ({ label: x.name, flag: x.cca2, flagOnly: true })), to: c.cca3, fact });

  add({ type: "region", cat: "Regions", diff: 2, prompt: `Where is ${c.name}?`, flag: c.cca2,
    options: [c.sub, ...shuffle([...new Set(C.map((x) => x.sub))].filter((s) => s !== c.sub)).slice(0, 3)].map((label) => ({ label })),
    to: c.cca3, fact });

  if (c.tld && tldCount[c.tld] === 1)
    add({ type: "tld", cat: "Internet & phone", diff: 3, prompt: `Whose web domain is ${c.tld}?`,
      options: [c, ...pickOthers(c, 3)].map(cOpt), to: c.cca3, fact });

  if (c.idd && iddCount[c.idd] === 1)
    add({ type: "idd", cat: "Internet & phone", diff: 3, prompt: `Whose dialling code is ${c.idd}?`,
      options: [c, ...pickOthers(c, 3)].map(cOpt), to: c.cca3, fact });

  if (c.demonym && demCount[c.demonym] === 1 && !c.demonym.toLowerCase().startsWith(c.name.toLowerCase().slice(0, 4)))
    add({ type: "demonym", cat: "People", diff: 2, prompt: `Where are people called ${c.demonym}?`,
      options: [c, ...pickOthers(c, 3, (x) => x.demonym !== c.demonym)].map(cOpt), to: c.cca3, fact });

  const uniqCur = c.currencies.find((x) => curCount[x.name] === 1);
  if (uniqCur) {
    const others = pickOthers(c, 3, (x) => !x.currencies.some((y) => y.name === uniqCur.name));
    add({ type: "currency", cat: "Money", diff: 2, prompt: `Who uses the ${uniqCur.name}?`,
      options: [c, ...others].map(cOpt), to: c.cca3, fact: `${fact}. Currency code: ${uniqCur.code}` });
  }

  const uniqLang = c.languages.find((l) => langCount[l] === 1 && !l.toLowerCase().startsWith(c.name.toLowerCase().slice(0, 4)));
  if (uniqLang)
    add({ type: "language", cat: "Languages", diff: 3, prompt: `Where is ${uniqLang} official?`,
      options: [c, ...pickOthers(c, 3, (x) => !x.languages.includes(uniqLang))].map(cOpt), to: c.cca3, fact });

  if (c.borders.length) {
    const nb = byCca3[c.borders[Math.floor(rnd() * c.borders.length)]];
    if (nb) {
      const others = pickOthers(c, 3, (x) => x !== nb && !c.borders.includes(x.cca3));
      add({ type: "border", cat: "Neighbours", diff: 2, prompt: `Which borders ${c.name}?`, flag: c.cca2,
        options: [nb, ...others].map(cOpt), to: nb.cca3, fact: `${c.name} borders ${c.borders.length} countr${c.borders.length > 1 ? "ies" : "y"}` });
    }
  } else {
    add({ type: "island", cat: "Neighbours", diff: 2, prompt: "Which has no land borders?",
      options: [c, ...pickOthers(c, 3, (x) => x.borders.length > 0)].map(cOpt), to: c.cca3, fact: `${c.name} has no land neighbours` });
  }

  if (c.landlocked)
    add({ type: "landlocked", cat: "Geography", diff: 2, prompt: "Which is landlocked?",
      options: [c, ...pickOthers(c, 3, (x) => !x.landlocked)].map(cOpt), to: c.cca3, fact: `${c.name} has no coastline` });

  // area: the biggest of four countries from the same broad region
  const four = [c, ...pickOthers(c, 3)];
  const big = four.reduce((a, b) => (b.area > a.area ? b : a));
  if (four.every((x) => x === big || big.area > x.area * 1.15))
    add({ type: "area", cat: "Geography", diff: 3, prompt: "Which is largest by area?",
      options: [big, ...four.filter((x) => x !== big)].map(cOpt), to: big.cca3, fact: `${big.name} covers about ${fmtArea(big.area)} km²` });
}

// final validation: every question must have 4 unique options and a valid answer
const bad = Q.filter((q) => q.options.length !== 4 || q.answer < 0);
if (bad.length) throw new Error(`${bad.length} invalid questions`);
Q.forEach((q, i) => (q.id = i + 1));

mkdirSync(new URL("../src/data/", import.meta.url), { recursive: true });
writeFileSync(new URL("../src/data/questions.json", import.meta.url), JSON.stringify(Q));
writeFileSync(new URL("../src/data/places.json", import.meta.url),
  JSON.stringify(Object.fromEntries(C.map((c) => [c.cca3, { n: c.name, id: c.ccn3, lat: c.lat, lon: c.lon, f: c.cca2 }]))));

const by = count(Q.map((q) => q.cat));
console.log(`Questions: ${Q.length}`, by);
