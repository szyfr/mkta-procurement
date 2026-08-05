import { Card, CardContent } from "@/components/ui/card";
import { kpis } from "@/data/dashboard";

/** Summary counts across the top of the dashboard. */
export function KpiCards() {
  return (
    <dl className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {kpis.map((kpi) => (
        <Card key={kpi.id}>
          <CardContent className="flex flex-col-reverse gap-2">
            <dd className="text-[26px] leading-none font-bold text-foreground tabular-nums">
              {kpi.value}
            </dd>
            <dt className="text-xs text-muted-foreground">{kpi.label}</dt>
          </CardContent>
        </Card>
      ))}
    </dl>
  );
}
