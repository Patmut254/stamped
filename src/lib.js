import QUESTIONS from "./data/questions.json";
import PLACES from "./data/places.json";

export { QUESTIONS, PLACES };
export const HOME = "GBR";
export const SECONDS = 20;
export const BASE = { 1: 100, 2: 150, 3: 200 };
export const CATEGORIES = [...new Set(QUESTIONS.map((q) => q.cat))];
export const MODES = {
  quick: { label: "Quick hop", flights: 10, blurb: "10 flights" },
  long: { label: "Long haul", flights: 25, blurb: "25 flights" },
  endless: { label: "Night flight", flights: Infinity, lives: 3, blurb: "Endless, 3 lives" },
};

// flag artwork from the flag-icons package, resolved to URLs by Vite
const flagFiles = import.meta.glob("/node_modules/flag-icons/flags/4x3/*.svg", { eager: true, query: "?url", import: "default" });
export const flagUrl = (code) => flagFiles[`/node_modules/flag-icons/flags/4x3/${code}.svg`];

export function shuffle(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function km(aCode, bCode) {
  const a = PLACES[aCode], b = PLACES[bCode];
  if (!a || !b) return 0;
  const r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)));
}

export const fmt = (n) => Math.round(n).toLocaleString("en-GB");

export const store = {
  get(key, fallback) { try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ } },
};

// Share of each game's questions per world region, so no single region dominates
export const REGION_WEIGHTS = { Europe: 0.26, Asia: 0.26, Americas: 0.26, Africa: 0.12, Oceania: 0.1 };

// Unseen questions first, then a weighted draw across regions
export function buildDeck(cats) {
  const seen = new Set(store.get("stamped:seen", []));
  const queues = {};
  for (const q of shuffle(QUESTIONS.filter((q) => cats.includes(q.cat)))) (queues[q.reg] ||= []).push(q);
  for (const r in queues) queues[r].sort((a, b) => seen.has(a.id) - seen.has(b.id));
  const deck = [];
  for (;;) {
    const open = Object.keys(queues).filter((r) => queues[r].length);
    if (!open.length) return deck;
    const total = open.reduce((t, r) => t + (REGION_WEIGHTS[r] || 0.1), 0);
    let roll = Math.random() * total, pick = open[0];
    for (const r of open) { roll -= REGION_WEIGHTS[r] || 0.1; if (roll <= 0) { pick = r; break; } }
    deck.push(queues[pick].shift());
  }
}
export function markSeen(id) {
  const seen = store.get("stamped:seen", []);
  if (!seen.includes(id)) { seen.push(id); store.set("stamped:seen", seen); }
}
