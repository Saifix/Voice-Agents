import React from "react";

/* ------------------------------------------------------------------ *
 *  Minimal line icons (stroke = currentColor). No emojis anywhere.
 * ------------------------------------------------------------------ */
const ICONS = {
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </>
  ),
  nodes: (
    <>
      <circle cx="6" cy="6.5" r="2.1" />
      <circle cx="18" cy="7.5" r="2.1" />
      <circle cx="12" cy="18" r="2.1" />
      <path d="M8 7.4l8 .6M7.4 8.4 10.8 16M16.3 9.2 13 16" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 16 9 5 9-5" />
    </>
  ),
  chart: (
    <>
      <path d="M4 5v14h16" />
      <path d="m7 14 3-4 3 2 4-6" />
    </>
  ),
  arrowRight: <path d="M5 12h13M13 6l6 6-6 6" />,
  arrowDown: <path d="M12 5v13M6 12l6 6 6-6" />,
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  award: (
    <>
      <circle cx="12" cy="9" r="5" />
      <path d="M9 13.3 7.5 21l4.5-2.6L16.5 21 15 13.3" />
    </>
  ),
  star: (
    <path d="M12 2c.5 5 1.5 6 8 6.5-6.5.5-7.5 1.5-8 8-.5-6.5-1.5-7.5-8-8 6.5-.5 7.5-1.5 8-6.5Z" />
  ),
  cloud: (
    <path d="M7.5 18a4 4 0 0 1-.4-7.97 5.5 5.5 0 0 1 10.68-.6A3.6 3.6 0 0 1 17 18H7.5Z" />
  ),
  database: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v12c0 1.66 3.13 3 7 3s7-1.34 7-3V6" />
      <path d="M5 12c0 1.66 3.13 3 7 3s7-1.34 7-3" />
    </>
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />,
  code: <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16" />,
};

export function Icon({ name, size = 24, className = "", strokeWidth = 1.6 }) {
  const node = ICONS[name];
  if (!node) return null;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {node}
    </svg>
  );
}

/* LinkedIn reads better as a solid glyph. */
export function LinkedInIcon({ size = 18, className = "" }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M4.98 3.5A2 2 0 1 1 3 5.48 2 2 0 0 1 4.98 3.5ZM3.2 8.5h3.5V21H3.2zM9.2 8.5h3.35v1.7h.05c.47-.85 1.6-1.75 3.3-1.75 3.53 0 4.18 2.2 4.18 5.06V21h-3.5v-5.2c0-1.24-.02-2.84-1.9-2.84-1.9 0-2.19 1.35-2.19 2.75V21H9.2z" />
    </svg>
  );
}
