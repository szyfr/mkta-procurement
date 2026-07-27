import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface Kpi {
  id: string;
  value: number;
  label: string;
}

/** Summary counts across the top of the dashboard. */
export function KpiCards({ kpis }: { kpis: Kpi[] }) {
  return (
    <dl className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {kpis.map((kpi) => (
        <Card key={kpi.id}>
          <CardContent className="flex flex-col gap-1">
            <dd className="text-2xl font-semibold text-foreground">
              {kpi.value}
            </dd>
            <dt className="text-xs text-muted-foreground">{kpi.label}</dt>
          </CardContent>
        </Card>
      ))}
    </dl>
  );
}

export function KpiCardsSkeleton() {
  return (
    <div
      aria-live="polite"
      aria-busy="true"
      className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5"
    >
      <span className="sr-only">Loading summary counts…</span>
      {Array.from({ length: 5 }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder list, never reordered
        <Card key={`kpi-${index}`}>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-7 w-10" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
