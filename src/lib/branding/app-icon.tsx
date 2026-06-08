/** Matches header logo: brand square + Lucide Calculator */
export const APP_ICON_BRAND = "#1a4d8c";

type AppIconSvgProps = {
  size: number;
  iconSize: number;
  radius: number;
};

export function AppIconSvg({ size, iconSize, radius }: AppIconSvgProps) {
  const offset = (size - iconSize) / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={size} height={size} rx={radius} fill={APP_ICON_BRAND} />
      <g
        transform={`translate(${offset} ${offset}) scale(${iconSize / 24})`}
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="16" height="20" x="4" y="2" rx="2" />
        <line x1="8" x2="16" y1="6" y2="6" />
        <line x1="16" x2="16" y1="14" y2="18" />
        <path d="M16 10h.01" />
        <path d="M12 10h.01" />
        <path d="M8 10h.01" />
        <path d="M12 14h.01" />
        <path d="M8 14h.01" />
        <path d="M12 18h.01" />
        <path d="M8 18h.01" />
      </g>
    </svg>
  );
}
