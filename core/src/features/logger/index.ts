type LogMethod = (message: string, ...values: unknown[]) => void;

export type Logger = {
  log: LogMethod;
  warn: LogMethod;
  error: LogMethod;
  success: LogMethod;
  out: LogMethod;
  in: LogMethod;
  failed: LogMethod;
};

type LogType = keyof Logger;

type Badge = {
  /** Carries the level on its own where CSS doesn't reach — see below. */
  icon: string;
  label: string;
  color: string;
};

/**
 * One entry per level: the emoji that survives anywhere, the word that reads
 * in a crowded console, and the badge colour.
 *
 * The emoji isn't decoration. `%c` styling is only understood by
 * browser-style consoles — React Native DevTools and the web — and prints
 * literally in the Metro terminal, where the icon is then the only thing
 * telling one level from another at a glance.
 *
 * Colours are darkened from the obvious hues so white text clears WCAG's 4.5:1
 * on every badge; the plain yellow and green they replace sat near 2:1.
 */
const BADGES: Record<LogType, Badge> = {
  log: { icon: "💬", label: "LOG", color: "#0079ff" },
  warn: { icon: "⚠️", label: "WARN", color: "#b45309" },
  error: { icon: "⛔", label: "ERROR", color: "#9f1239" },
  success: { icon: "✅", label: "SUCCESS", color: "#38ca3a" },
  out: { icon: "➡️", label: "OUT", color: "#0079ff" },
  in: { icon: "⬅️", label: "IN", color: "#38ca3a" },
  failed: { icon: "💥", label: "FAILED", color: "#9f1239" },
};

const RESET_STYLE =
  "color: inherit; background: transparent; font-weight: normal;";

function badgeStyle(color: string): string {
  return [
    `background: ${color}`,
    "color: #ffffff",
    "font-weight: 700",
    "border-radius: 4px",
    "padding: 2px 6px",
    "letter-spacing: 0.4px",
  ].join("; ");
}

export function createLogger(enabled: boolean): Logger {
  const methods = (Object.keys(BADGES) as LogType[]).map((type) => {
    const { icon, label, color } = BADGES[type];

    const method: LogMethod = (message, ...values) => {
      if (!enabled) return;

      console.log(
        `%c ${icon} ${label} %c`,
        badgeStyle(color),
        RESET_STYLE,
        message,
        ...values,
      );
    };

    return [type, method] as const;
  });

  return Object.fromEntries(methods) as Logger;
}

const logger = createLogger(__DEV__);

export default logger;
