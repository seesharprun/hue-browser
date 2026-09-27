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
const CLOSE = "M6 6l12 12M18 6 6 18";
const ROOMS = "M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5M10 21v-6h4v6";
const ZONES = "M12 3 3 8l9 5 9-5-9-5Zm9 8-9 5-9-5m18 5-9 5-9-5";
const FLAT = "M4 6h16M4 12h16M4 18h16";
const REFRESH =
  "M3 12a9 9 0 0 1 15.3-6.4L21 8M21 4v4h-4M21 12a9 9 0 0 1-15.3 6.4L3 16M3 20v-4h4";
const WARNING =
  "M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z";
const ERROR = "M15 9l-6 6m0-6 6 6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z";
const SUCCESS = "m8 12.5 2.7 2.7L16 9.8M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z";
const EDIT = "M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Zm10-13 4 4";
const SAVE = "m5 13 4 4L19 7";

export function SaveIcon() {
  return <Icon label="Save" path={SAVE} size="size-[14px]" />;
}

export function EditIcon() {
  return <Icon label="Edit" path={EDIT} size="size-[14px]" />;
}

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

export function CloseIcon() {
  return <Icon label="Close" path={CLOSE} size="size-[14px]" />;
}

export function RefreshIcon() {
  return <Icon label="Refresh" path={REFRESH} size="size-[14px]" />;
}

const groupings = { room: ROOMS, zones: ZONES, none: FLAT };

const tones = {
  info: INFO,
  success: SUCCESS,
  warning: WARNING,
  error: ERROR,
};

export function ToneIcon({
  tone,
  label,
}: {
  tone: keyof typeof tones;
  label: string;
}) {
  return <Icon label={label} path={tones[tone]} size="size-5 shrink-0" />;
}

export function GroupIcon({
  name,
  label,
  size = "size-4 shrink-0",
}: {
  name: keyof typeof groupings;
  label: string;
  size?: string;
}) {
  return <Icon label={label} path={groupings[name]} size={size} />;
}
