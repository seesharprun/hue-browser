/* The connect page scene, built from the same pendant recipe as the
   documentation hero so the two read as one piece of art. A shade body stays
   dark even when its light is on, because the glow escapes at the rim and the
   bulb rather than through the shade. Every color comes from the shared
   scene palette, which the hero mirrors as literals because it is loaded as
   an image and cannot inherit custom properties. */
const RAIL = 32;
const FRAME_BOTTOM = 430;
const RIM = 44;
const SHADE_HEIGHT = 58;

const pendants = {
  indigo: {
    shade: "var(--lofi-scene-shade-indigo)",
    rim: "var(--lofi-scene-rim-indigo)",
  },
  teal: {
    shade: "var(--lofi-scene-shade-teal)",
    rim: "var(--lofi-scene-rim-teal)",
  },
  amber: {
    shade: "var(--lofi-scene-shade-amber)",
    rim: "var(--lofi-scene-rim-amber)",
    bulb: "var(--lofi-scene-bulb-amber)",
  },
  peach: {
    shade: "var(--lofi-scene-shade-peach)",
    rim: "var(--lofi-scene-rim-peach)",
    bulb: "var(--lofi-scene-bulb-peach)",
  },
} as const;

type Tone = keyof typeof pendants;

export function NightWindow() {
  return (
    <svg
      viewBox="0 0 520 440"
      className="w-full"
      role="img"
      aria-label="Pendant lights hanging in front of a window at night"
    >
      <title>Pendant lights hanging in front of a window at night</title>
      <defs>
        <Bloom tone="amber" center="0.85" mid="0.28" />
        <Bloom tone="peach" center="0.7" mid="0.22" />
        <Cone tone="amber" opacity="0.34" />
        <Cone tone="peach" opacity="0.26" />
        <radialGradient id="scene-moon">
          <stop
            offset="0%"
            stopColor="var(--lofi-scene-rim-amber)"
            stopOpacity="0.4"
          />
          <stop
            offset="100%"
            stopColor="var(--lofi-scene-bloom-amber)"
            stopOpacity="0"
          />
        </radialGradient>
        <clipPath id="scene-frame">
          <rect x="20" y="70" width="480" height="360" rx="14" />
        </clipPath>
      </defs>

      <g clipPath="url(#scene-frame)">
        <rect
          x="20"
          y="70"
          width="480"
          height="360"
          fill="var(--lofi-scene-sky)"
        />
        <circle cx="440" cy="140" r="82" fill="url(#scene-moon)" />
        <circle cx="440" cy="140" r="36" fill="var(--lofi-scene-rim-amber)" />
        <LightCone x={160} drop={118} tone="amber" />
        <LightCone x={340} drop={158} tone="peach" />
        <Mullions />
      </g>

      <rect
        x="10"
        y={RAIL - 6}
        width="500"
        height="6"
        rx="3"
        fill="var(--lofi-scene-cord)"
      />
      <Pendant x={70} drop={62} tone="indigo" />
      <Pendant x={160} drop={118} tone="amber" />
      <Pendant x={250} drop={48} tone="teal" />
      <Pendant x={340} drop={158} tone="peach" />
    </svg>
  );
}

function Bloom({
  tone,
  center,
  mid,
}: {
  tone: "amber" | "peach";
  center: string;
  mid: string;
}) {
  return (
    <radialGradient id={`scene-bloom-${tone}`}>
      <stop
        offset="0%"
        stopColor={`var(--lofi-scene-rim-${tone})`}
        stopOpacity={center}
      />
      <stop
        offset="45%"
        stopColor={`var(--lofi-scene-bloom-${tone})`}
        stopOpacity={mid}
      />
      <stop
        offset="100%"
        stopColor={`var(--lofi-scene-bloom-${tone})`}
        stopOpacity="0"
      />
    </radialGradient>
  );
}

function Cone({ tone, opacity }: { tone: "amber" | "peach"; opacity: string }) {
  return (
    <linearGradient id={`scene-cone-${tone}`} x1="0" y1="0" x2="0" y2="1">
      <stop
        offset="0%"
        stopColor={`var(--lofi-scene-rim-${tone})`}
        stopOpacity={opacity}
      />
      <stop
        offset="100%"
        stopColor={`var(--lofi-scene-rim-${tone})`}
        stopOpacity="0"
      />
    </linearGradient>
  );
}

function Mullions() {
  return (
    <>
      <rect
        x="20"
        y="70"
        width="480"
        height="360"
        fill="none"
        stroke="var(--color-base-300)"
        strokeWidth="10"
      />
      <rect
        x="255"
        y="70"
        width="10"
        height="360"
        fill="var(--color-base-300)"
      />
      <rect
        x="20"
        y="245"
        width="480"
        height="10"
        fill="var(--color-base-300)"
      />
    </>
  );
}

/* The cone of light leaves the shade at its rim, so it starts as wide as the
   shade rather than at a single point. */
function LightCone({
  x,
  drop,
  tone,
}: {
  x: number;
  drop: number;
  tone: "amber" | "peach";
}) {
  const top = RAIL + drop + SHADE_HEIGHT;
  const spread = RIM + 40;
  return (
    <path
      d={`M${x - RIM} ${top} H${x + RIM} L${x + spread} ${FRAME_BOTTOM} H${x - spread} Z`}
      fill={`url(#scene-cone-${tone})`}
    />
  );
}

function Pendant({ x, drop, tone }: { x: number; drop: number; tone: Tone }) {
  const pendant = pendants[tone];
  const bulb = "bulb" in pendant ? pendant.bulb : null;
  const top = RAIL + drop;
  const base = top + SHADE_HEIGHT;
  return (
    <g>
      <rect
        x={x - 2}
        y={RAIL}
        width="4"
        height={drop}
        fill="var(--lofi-scene-cord)"
      />
      {bulb ? (
        <circle
          cx={x}
          cy={base + 14}
          r="54"
          fill={`url(#scene-bloom-${tone === "amber" ? "amber" : "peach"})`}
        />
      ) : null}
      <path
        d={`M${x} ${top} L${x + RIM} ${base} H${x - RIM} Z`}
        fill={pendant.shade}
      />
      <rect
        x={x - RIM}
        y={base - 4}
        width={RIM * 2}
        height="8"
        rx="4"
        fill={pendant.rim}
      />
      {bulb ? <circle cx={x} cy={base + 14} r="13" fill={bulb} /> : null}
    </g>
  );
}
