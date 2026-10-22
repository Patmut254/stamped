import { useEffect, useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath, geoGraticule10, geoInterpolate } from "d3-geo";
import { feature } from "topojson-client";
import topo from "world-atlas/countries-110m.json";
import { PLACES } from "../lib.js";
import { PLANE_PATH } from "./Plane.jsx";

const W = 960, H = 500;
const land = feature(topo, topo.objects.countries).features;
const projection = geoNaturalEarth1().fitExtent([[6, 6], [W - 6, H - 6]], { type: "Sphere" });
const path = geoPath(projection);
const graticule = path(geoGraticule10());
const sphere = path({ type: "Sphere" });
const ll = (code) => [PLACES[code].lon, PLACES[code].lat];
const reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * legs:   [{from, to, ok}]  completed routes (country codes)
 * flight: {from, to, key}   the route the plane is flying now
 * target: country code to highlight
 */
export default function WorldMap({ legs, flight, target, visited }) {
  const [t, setT] = useState(1);
  const raf = useRef(0);

  useEffect(() => {
    if (!flight) return;
    if (reduced()) { setT(1); return; }
    const span = Math.min(2400, 900 + Math.hypot(...ll(flight.from).map((v, i) => v - ll(flight.to)[i])) * 6);
    let start = 0;
    const step = (now) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / span);
      setT(1 - Math.pow(1 - p, 3)); // ease-out
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    setT(0);
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [flight?.key]);

  const plane = useMemo(() => {
    const at = flight ? null : legs.length ? legs[legs.length - 1].to : "GBR";
    if (!flight) {
      const [x, y] = projection(ll(at));
      return { x, y, angle: 45, trail: null };
    }
    const interp = geoInterpolate(ll(flight.from), ll(flight.to));
    const [x, y] = projection(interp(t));
    const [x2, y2] = projection(interp(Math.min(1, t + 0.01)));
    const [x0, y0] = projection(interp(Math.max(0, t - 0.01)));
    const dx = t < 0.99 ? x2 - x : x - x0, dy = t < 0.99 ? y2 - y : y - y0;
    const angle = Math.abs(dx) > 200 ? 90 : (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    const trail = path({ type: "LineString", coordinates: [ll(flight.from), interp(t)] });
    return { x, y, angle, trail };
  }, [flight, t, legs]);

  const targetId = target ? PLACES[target]?.id : null;
  const visitedIds = useMemo(() => new Set([...visited].map((c) => PLACES[c]?.id)), [visited]);
  const landed = !flight || t >= 1;

  return (
    <svg className="map" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="World map showing your flight routes">
      <path d={sphere} className="m-water" />
      <path d={graticule} className="m-grid" />
      {land.map((f) => (
        <path key={f.id ?? f.properties.name} d={path(f)}
          className={`m-land${visitedIds.has(f.id) ? " m-visited" : ""}${landed && f.id === targetId ? " m-target" : ""}`} />
      ))}
      <path d={sphere} className="m-edge" />
      {legs.slice(0, flight ? -1 : undefined).map((l, i) => (
        <path key={i} d={path({ type: "LineString", coordinates: [ll(l.from), ll(l.to)] })}
          className={`m-route${l.ok ? "" : " m-miss"}`} />
      ))}
      {plane.trail && <path d={plane.trail} className="m-route m-live" />}
      {[...new Set(legs.flatMap((l) => [l.from, l.to]))].map((c) => {
        const [x, y] = projection(ll(c));
        return <circle key={c} cx={x} cy={y} r={3.2} className="m-airport" />;
      })}
      {landed && target && (() => {
        const [x, y] = projection(ll(target));
        return (
          <g className="m-pin">
            <circle cx={x} cy={y} r={14} className="m-ring" />
            <text x={Math.min(Math.max(x, 60), W - 60)} y={y < 40 ? y + 34 : y - 20} textAnchor="middle" className="m-label">
              {PLACES[target].n.toUpperCase()}
            </text>
          </g>
        );
      })()}
      <g transform={`translate(${plane.x} ${plane.y}) rotate(${plane.angle}) translate(-14 -14)`} className="m-plane">
        <path d={PLANE_PATH} transform="scale(1.17)" />
      </g>
    </svg>
  );
}
