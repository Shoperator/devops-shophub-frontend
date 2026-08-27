/**
 * A fixed locale and time zone on purpose. The container runs with whatever
 * locale and zone the node happens to have and the browser with the visitor's
 * own, and a value formatted differently on the two sides is a React hydration
 * error. The zone is spelled out in the output so the reading is unambiguous.
 */
const LOCALE = "en-GB";

const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
  timeZoneName: "short",
});

export function formatDateTime(isoDate: string): string {
  const parsed = new Date(isoDate);
  return Number.isNaN(parsed.getTime()) ? "—" : dateTimeFormat.format(parsed);
}
