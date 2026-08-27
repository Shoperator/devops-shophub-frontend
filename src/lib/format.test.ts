import { formatDateTime } from "./format";

describe("formatDateTime", () => {
  it("renders the timestamp in UTC, whatever the machine's time zone is", () => {
    expect(formatDateTime("2026-01-01T10:00:00.000Z")).toBe(
      "1 Jan 2026, 10:00 UTC",
    );
  });

  it("falls back to a dash for a value that is not a date", () => {
    expect(formatDateTime("not-a-date")).toBe("—");
  });
});
