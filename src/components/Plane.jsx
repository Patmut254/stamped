// Top-down airliner silhouette, nose pointing up. Rotate with the `angle` prop (degrees).
export const PLANE_PATH =
  "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z";

export default function Plane({ size = 20, angle = 0, className = "", title }) {
  return (
    <svg className={`plane ${className}`} width={size} height={size} viewBox="0 0 24 24"
      style={{ transform: `rotate(${angle}deg)` }} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <path d={PLANE_PATH} fill="currentColor" />
    </svg>
  );
}
