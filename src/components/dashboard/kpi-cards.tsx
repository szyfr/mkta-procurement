import { Card, CardContent } from "@/components/ui/card";
import { kpis } from "@/data/dashboard";

/** Summary counts across the top of the dashboard. */
export function KpiCards() {
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
