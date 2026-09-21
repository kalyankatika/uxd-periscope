const icons = {
  chevronDown: <path d="m6 9 6 6 6-6" />,
  arrowRight: (
    <>
      <path d="M4 12h16m-6-6 6 6-6 6" />
    </>
  ),
  arrowLeft: (
    <>
      <path d="M20 12H4m6-6-6 6 6 6" />
    </>
  ),
  arrowUpRight: (
    <>
      <path d="M6 18 18 6M6 6h12v12" />
    </>
  ),
  arrowUp: (
    <>
      <path d="M12 20V4m-6 6 6-6 6 6" />
    </>
  ),
  arrowDown: (
    <>
      <path d="M12 4v16m-6-6 6 6 6-6" />
    </>
  ),
  sort: (
    <>
      <path d="M8 20V4m-4 4 4-4 4 4m4-4v16m-4-4 4 4 4-4" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  minus: (
    <>
      <path d="M5 12h14" />
    </>
  ),
  close: (
    <>
      <path d="m6 6 12 12M6 18 18 6" />
    </>
  ),
  expand: (
    <>
      <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />
    </>
  ),
  collapse: (
    <>
      <path d="M3 8h5V3m8 0v5h5M8 21v-5H3m18 0h-5v5" />
    </>
  ),
  check: (
    <>
      <path d="m5 12 4 4L19 6" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M21 21l-5-5" />
    </>
  ),
  diamond: (
    <>
      <path d="m12 3 9 9-9 9-9-9Z" />
    </>
  ),
  grip: (
    <>
      <path d="M8 5h.01M16 5h.01M8 12h.01M16 12h.01M8 19h.01M16 19h.01" />
    </>
  ),
  alert: (
    <>
      <path d="M12 8v5m0 4h.01M12 3 2 21h20Z" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
    </>
  ),
  connections: (
    <>
      <path d="m7 7 10 3M7 7l3 10m7-7-7 7" />
      <circle cx="6" cy="6" r="3" />
      <circle cx="18" cy="10" r="3" />
      <circle cx="10" cy="18" r="3" />
    </>
  ),
  overview: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 10h18M10 10v11" />
    </>
  ),
  teams: (
    <>
      <rect x="9" y="3" width="6" height="5" rx="1" />
      <rect x="2" y="16" width="6" height="5" rx="1" />
      <rect x="16" y="16" width="6" height="5" rx="1" />
      <path d="M12 8v4M5 16v-4h14v4" />
    </>
  ),
  compare: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    </>
  ),
  capacity: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  cutline: (
    <>
      <path d="m3 6 1 1 2-2m-3 7 1 1 2-2m-3 7 1 1 2-2M10 6h11M10 12h11M10 18h11" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m3 11v-3a6 6 0 0 0-2-4.5" />
    </>
  ),
};

export default function UiIcon({
  name,
  className = "nav-icon",
}: {
  name: keyof typeof icons;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {icons[name]}
    </svg>
  );
}
