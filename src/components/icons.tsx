function Icon({
  label,
  path,
  size,
}: {
  label: string;
  path: string;
  size: string;
}) {
  return (
    <svg
      className={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <title>{label}</title>
      <path d={path} />
    </svg>
  );
}

const BULB = "M9 18h6m-5 3h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2Z";
const INFO = "M12 11v5m0-8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z";
const FLASH = "M13 2 4 14h7l-1 8 9-12h-7l1-8Z";
const POWER = "M12 3v9m5.7-6.7a8 8 0 1 1-11.4 0";
const POWER_OFF = "M12 3v4m6.4 1.6A8 8 0 1 1 6.3 5.3M4 3l16 18";

export function TestIcon() {
  return <Icon label="Test" path={BULB} size="size-[14px]" />;
}

export function DetailsIcon() {
  return <Icon label="Details" path={INFO} size="size-[14px]" />;
}

export function FlashIcon() {
  return <Icon label="Flash" path={FLASH} size="size-4 shrink-0" />;
}

export function PowerOnIcon() {
  return <Icon label="On" path={POWER} size="size-4 shrink-0" />;
}

export function PowerOffIcon() {
  return <Icon label="Off" path={POWER_OFF} size="size-4 shrink-0" />;
}
