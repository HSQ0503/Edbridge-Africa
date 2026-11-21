import { isRegion } from "@/lib/beneficiaries";
import type { ReportFilters } from "@/server/beneficiaries/reports";

// Report filters are not personal data, so they live in the URL and the page can be bookmarked or shared.
export function readReportFilters(params: Record<string, string | string[] | undefined>): ReportFilters {
  const one = (key: string) => (typeof params[key] === "string" ? (params[key] as string) : "");
  const day = (value: string) => (/^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) ? new Date(`${value}T00:00:00Z`) : undefined);
  const to = day(one("to"));
  return {
    region: isRegion(one("region")) ? one("region") : undefined,
    programmeId: /^[0-9a-f-]{36}$/i.test(one("programme")) ? one("programme") : undefined,
    from: day(one("from")),
    // Inclusive of the whole "to" day.
    to: to && new Date(to.getTime() + 24 * 60 * 60 * 1000),
  };
}
