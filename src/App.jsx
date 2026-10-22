import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import WorldMap from "./components/WorldMap.jsx";
import Plane from "./components/Plane.jsx";
import {
  QUESTIONS, PLACES, HOME, SECONDS, BASE, CATEGORIES, MODES,
  buildDeck, markSeen, km, fmt, flagUrl, store,
} from "./lib.js";

const initial = () => ({
  phase: "home", mode: "quick", cats: CATEGORIES, deck: [], i: 0, left: SECONDS,
  score: 0, streak: 0, bestStreak: 0, km: 0, lives: 0, at: HOME, legs: [], log: [],
  picked: null, flight: null,
});

function reducer(s, a) {
  switch (a.type) {
    case "mode": return { ...s, mode: a.mode };
    case "cat": {
      const has = s.cats.includes(a.cat);
      const cats = has ? s.cats.filter((c) => c !== a.cat) : [...s.cats, a.cat];
      return { ...s, cats: cats.length ? cats : s.cats };
    }
    case "allcats": return { ...s, cats: CATEGORIES };
    case "start": {
      const m = MODES[s.mode];
      const deck = buildDeck(s.cats).slice(0, m.flights === Infinity ? undefined : m.flights);
      return { ...initial(), mode: s.mode, cats: s.cats, phase: "play", deck, lives: m.lives || 0 };
    }
    case "tick": return s.phase === "play" && s.picked == null ? { ...s, left: Math.max(0, s.left - 1) } : s;
    case "answer": {
      if (s.picked != null) return s;
      const q = s.deck[s.i];
      const ok = a.index === q.answer;
      const streak = ok ? s.streak + 1 : 0;
      const mult = Math.min(2, 1 + 0.2 * (streak - 1));
      const pts = ok ? Math.round((BASE[q.diff] + s.left * 5) * mult) : 0;
      const dist = km(s.at, q.to);
      const legs = [...s.legs, { from: s.at, to: q.to, ok }];
      const log = [...s.log, { n: s.i + 1, from: s.at, to: q.to, ok, pts, km: dist, cat: q.cat, timeout: a.index === -1 }];
      return {
        ...s, picked: a.index, score: s.score + pts, streak, bestStreak: Math.max(s.bestStreak, streak),
        km: s.km + dist, at: q.to, legs, log, lives: ok ? s.lives : Math.max(0, s.lives - 1),
        flight: { from: s.at, to: q.to, key: s.i },
      };
    }
    case "next": {
      const over = s.i + 1 >= s.deck.length || (MODES[s.mode].lives && s.lives <= 0);
      if (over) return { ...s, phase: "end", flight: null };
      return { ...s, i: s.i + 1, picked: null, left: SECONDS, flight: null };
    }
    case "home": return { ...initial(), mode: s.mode, cats: s.cats };
    default: return s;
  }
}

function Flag({ code, big }) {
  const src = flagUrl(code);
  if (!src) return null;
  return <img className={big ? "flag flag-big" : "flag"} src={src} alt="" loading="lazy" />;
}

export default function App() {
  const [s, dispatch] = useReducer(reducer, undefined, initial);
  const [best, setBest] = useState(() => store.get("stamped:best", {}));
  const q = s.deck[s.i];
  const mode = MODES[s.mode];

  // countdown
  useEffect(() => {
    if (s.phase !== "play" || s.picked != null) return;
    if (s.left <= 0) { dispatch({ type: "answer", index: -1 }); return; }
    const id = setTimeout(() => dispatch({ type: "tick" }), 1000);
    return () => clearTimeout(id);
  }, [s.phase, s.picked, s.left]);

  useEffect(() => { if (s.picked != null && q) markSeen(q.id); }, [s.picked]);

  useEffect(() => {
    if (s.phase !== "end") return;
    if (s.score > (best[s.mode] || 0)) { const b = { ...best, [s.mode]: s.score }; setBest(b); store.set("stamped:best", b); }
  }, [s.phase]);

  // keyboard: 1 to 4 to answer, Enter for next flight
  useEffect(() => {
    const onKey = (e) => {
      if (s.phase !== "play") return;
      if (s.picked == null && /^[1-4]$/.test(e.key)) dispatch({ type: "answer", index: +e.key - 1 });
      else if (s.picked != null && e.key === "Enter" && document.activeElement?.tagName !== "BUTTON") dispatch({ type: "next" });
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [s.phase, s.picked]);

  const visited = useMemo(() => new Set(s.legs.filter((l) => l.ok).map((l) => l.to)), [s.legs]);
  const nextRef = useRef(null);
  useEffect(() => { if (s.picked != null) nextRef.current?.focus({ preventScroll: true }); }, [s.picked]);

  return (
    <div className="app">
      <header className="top">
        <button className="brand" onClick={() => dispatch({ type: "home" })} aria-label="Stamped, back to start">
          <span className="logo"><Plane size={20} angle={45} /></span>
          <span>Stamped</span>
        </button>
        <dl className="hud">
          <div><dt>Score</dt><dd>{fmt(s.score)}</dd></div>
          <div><dt>Streak</dt><dd>{s.streak}{s.streak > 1 && <small>×{Math.min(2, 1 + 0.2 * (s.streak - 1)).toFixed(1)}</small>}</dd></div>
          <div><dt>Km</dt><dd>{fmt(s.km)}</dd></div>
          <div className="hud-best"><dt>Best</dt><dd>{fmt(best[s.mode] || 0)}</dd></div>
        </dl>
      </header>

      <main className={`layout${s.phase === "play" ? " playing" : ""}`}>
        <section className="chart" aria-label="Flight map">
          <div className="chart-head">
            <div className="route-row">
              <div className="stop"><small>From</small><b>{s.phase === "play" ? (s.flight ? s.flight.from : s.at) : "GBR"}</b></div>
              <div className="line" aria-hidden="true"><i /><Plane size={18} angle={90} /><i /></div>
              <div className="stop end"><small>To</small><b>{s.phase === "play" && s.picked != null ? q.to : "???"}</b></div>
            </div>
            <span className="muted">{s.legs.length ? `${s.legs.length} ${s.legs.length === 1 ? "flight" : "flights"}, ${visited.size} landed` : "Departing London"}</span>
          </div>
          <WorldMap legs={s.legs} flight={s.flight} target={s.picked != null ? q?.to : null} visited={visited} />
          {s.phase === "play" && <Progress s={s} mode={mode} />}
        </section>

        <section className="panel" aria-live="polite">
          {s.phase === "home" && <Home s={s} dispatch={dispatch} best={best} />}
          {s.phase === "play" && q && <Question s={s} q={q} dispatch={dispatch} nextRef={nextRef} />}
          {s.phase === "end" && <Results s={s} dispatch={dispatch} best={best} />}
        </section>
      </main>

      {s.log.length > 0 && <Logbook log={s.log} />}

      <footer className="foot">
        {fmt(QUESTIONS.length)} questions across {Object.keys(PLACES).length} countries
      </footer>
    </div>
  );
}

function Progress({ s, mode }) {
  if (mode.lives) {
    return (
      <div className="progress" aria-label={`${s.lives} lives left`}>
        <span className="muted">Lives</span>
        {Array.from({ length: mode.lives }, (_, i) => (
          <Plane key={i} size={22} className={i < s.lives ? "p-on" : "p-off"} />
        ))}
        <span className="muted push">Flight {s.i + 1}</span>
      </div>
    );
  }
  return (
    <div className="progress" aria-label={`Flight ${s.i + 1} of ${s.deck.length}`}>
      {s.deck.map((_, i) => {
        const l = s.log[i];
        const cls = l ? (l.ok ? "p-ok" : "p-bad") : i === s.i ? "p-now" : "p-off";
        return <Plane key={i} size={s.deck.length > 12 ? 14 : 20} className={cls} />;
      })}
    </div>
  );
}

function Home({ s, dispatch, best }) {
  return (
    <div className="stack">
      <p className="eyebrow">{fmt(QUESTIONS.length)} questions</p>
      <h1 className="headline">Answer, fly and land</h1>
      <p className="lede">Get it right to land in the country. Answer fast for more points.</p>

      <fieldset className="field">
        <legend>Mode</legend>
        <div className="modes">
          {Object.entries(MODES).map(([k, m]) => (
            <button key={k} className={`mode${s.mode === k ? " on" : ""}`} onClick={() => dispatch({ type: "mode", mode: k })} aria-pressed={s.mode === k}>
              <b>{m.label}</b><span>{m.blurb}</span><small>Best {fmt(best[k] || 0)}</small>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="field">
        <legend>Topics <button className="link" onClick={() => dispatch({ type: "allcats" })}>All</button></legend>
        <div className="chips">
          {CATEGORIES.map((c) => (
            <button key={c} className={`chip${s.cats.includes(c) ? " on" : ""}`} aria-pressed={s.cats.includes(c)} onClick={() => dispatch({ type: "cat", cat: c })}>
              {c}
            </button>
          ))}
        </div>
      </fieldset>

      <button className="cta" onClick={() => dispatch({ type: "start" })}>
        <Plane size={20} angle={90} /> Board flight
      </button>
      <p className="muted small keys">Press 1 to 4 to answer and Enter for the next flight</p>
    </div>
  );
}

function Question({ s, q, dispatch, nextRef }) {
  const answered = s.picked != null;
  const last = s.log[s.log.length - 1];
  const flagOnly = q.options.every((o) => o.flagOnly);
  return (
    <div className="stack">
      <div className="qhead">
        <span className="eyebrow">{q.cat} <span className="dots" aria-label={`Difficulty ${q.diff} of 3`}>{"●".repeat(q.diff)}{"○".repeat(3 - q.diff)}</span></span>
        <span className="code">Q{String(q.id).padStart(4, "0")}</span>
      </div>
      <div className="clock" aria-label={`${s.left} seconds left`}>
        <i style={{ width: `${(s.left / SECONDS) * 100}%` }} className={s.left <= 5 ? "warn" : ""} />
        <span>{s.left}s</span>
      </div>
      {q.big && <Flag code={q.flag} big />}
      <h2 className="prompt">{!q.big && q.flag && q.type !== "capital-rev" && <Flag code={q.flag} />}{q.prompt}</h2>

      <div className={`opts${flagOnly ? " opts-flags" : ""}`}>
        {q.options.map((o, i) => {
          let cls = "opt";
          if (answered) cls += i === q.answer ? " right" : i === s.picked ? " wrong" : " dim";
          return (
            <button key={i} className={cls} disabled={answered} onClick={() => dispatch({ type: "answer", index: i })}
              aria-label={flagOnly && !answered ? `Option ${i + 1}` : undefined}>
              <span className="key">{i + 1}</span>
              {o.flag && <Flag code={o.flag} big={flagOnly} />}
              {(!flagOnly || answered) && <span className="label">{o.label}</span>}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className={`verdict ${last.ok ? "ok" : "no"}`}>
          <b>{last.ok ? `Landed, +${fmt(last.pts)} points` : last.timeout ? "Too slow" : "Wrong"}</b>
          <p>{q.fact}.{last.km ? ` You flew ${fmt(last.km)} km.` : ""}</p>
          <button ref={nextRef} className="cta" onClick={() => dispatch({ type: "next" })}>
            <Plane size={18} angle={90} />
            {MODES[s.mode].lives && s.lives <= 0 ? "Results" : s.i + 1 >= s.deck.length ? "Results" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}

function Results({ s, dispatch, best }) {
  const correct = s.log.filter((l) => l.ok).length;
  const pct = s.log.length ? Math.round((correct / s.log.length) * 100) : 0;
  const rank = pct >= 90 ? "Captain" : pct >= 70 ? "First officer" : pct >= 45 ? "Navigator" : "Passenger";
  const cats = [...new Set(s.log.map((l) => l.cat))].map((c) => {
    const rows = s.log.filter((l) => l.cat === c);
    return { c, n: rows.length, ok: rows.filter((r) => r.ok).length };
  });
  const share = `Stamped ✈ ${rank}\n${correct}/${s.log.length} landed, ${fmt(s.score)} points, ${fmt(s.km)} km\n${s.log.map((l) => (l.ok ? "🟪" : "⬜")).join("")}`;
  const [copied, setCopied] = useState("");
  const shareRef = useRef(null);
  const copy = () => {
    const sel = () => { const r = document.createRange(); r.selectNodeContents(shareRef.current); const g = getSelection(); g.removeAllRanges(); g.addRange(r); setCopied("Press Ctrl+C"); };
    try { navigator.clipboard.writeText(share).then(() => setCopied("Copied"), sel); } catch { sel(); }
  };
  return (
    <div className="stack">
      <p className="eyebrow">{MODES[s.mode].label}</p>
      <h1 className="headline">{rank}</h1>
      <div className="stats">
        <div><b>{fmt(s.score)}</b><span>{s.score >= (best[s.mode] || 0) && s.score > 0 ? "new best" : "points"}</span></div>
        <div><b>{pct}%</b><span>accuracy</span></div>
        <div><b>{fmt(s.km)}</b><span>km</span></div>
        <div><b>{s.bestStreak}</b><span>best streak</span></div>
      </div>
      <div className="bars">
        {cats.map((r) => (
          <div key={r.c} className="bar">
            <span>{r.c}</span>
            <i><em style={{ width: `${(r.ok / r.n) * 100}%` }} /></i>
            <span className="code">{r.ok}/{r.n}</span>
          </div>
        ))}
      </div>
      <pre className="share" ref={shareRef}>{share}</pre>
      <div className="row">
        <button className="ghost" onClick={copy}>{copied || "Copy"}</button>
        <button className="cta" onClick={() => dispatch({ type: "start" })}><Plane size={18} angle={90} /> Play again</button>
        <button className="link" onClick={() => dispatch({ type: "home" })}>Menu</button>
      </div>
    </div>
  );
}

function Logbook({ log }) {
  const rows = log.slice(-8).reverse();
  return (
    <section className="logbook" aria-label="Pilot logbook">
      <h2>Flight log</h2>
      <div className="table-wrap">
        <table>
          <thead><tr><th>#</th><th>Route</th><th>Destination</th><th className="num">Km</th><th className="num">Points</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.n}>
                <td className="code c-n">{String(l.n).padStart(2, "0")}</td>
                <td className="code c-route">{l.from} → {l.to}</td>
                <td className="c-dest">{flagUrl(PLACES[l.to].f) && <img className="flag" src={flagUrl(PLACES[l.to].f)} alt="" />}{PLACES[l.to].n}</td>
                <td className="num c-km">{fmt(l.km)}<span className="unit"> km</span></td>
                <td className="num c-pts">{l.pts ? `+${fmt(l.pts)}` : "0"}</td>
                <td className="c-status"><span className={`pill ${l.ok ? "ok" : "no"}`}>{l.ok ? "Landed" : l.timeout ? "Late" : "Missed"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
