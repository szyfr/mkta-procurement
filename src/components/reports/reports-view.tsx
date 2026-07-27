"use client";

import * as React from "react";

import { ReportWorkspace } from "@/components/reports/report-workspace";
import { FilterSelect } from "@/components/shared/filter-select";
import { useDepartments, useVendors } from "@/hooks/reference";
import { dateRanges } from "@/lib/reports/presentation";
import type { ReportFilters } from "@/types";

/**
 * Owns the report filters so they actually reach the query. They used to sit on
 * the page as display-only selects that nothing read.
 */
export function ReportsView() {
  const { data: departments = [] } = useDepartments();
  const { data: vendors = [] } = useVendors();

  const [filters, setFilters] = React.useState<ReportFilters>({});

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect
          label="Date Range: Last 90 days"
          options={dateRanges}
          value={filters.dateRange ?? null}
          onValueChange={(dateRange) =>
            setFilters((current) => ({
              ...current,
              dateRange: dateRange ?? undefined,
            }))
          }
        />
        <FilterSelect
          label="Department"
          options={departments}
          value={filters.department ?? null}
          onValueChange={(department) =>
            setFilters((current) => ({
              ...current,
              department: department ?? undefined,
            }))
          }
        />
        <FilterSelect
          label="Vendor"
          options={vendors}
          value={filters.vendor ?? null}
          onValueChange={(vendor) =>
            setFilters((current) => ({
              ...current,
              vendor: vendor ?? undefined,
            }))
          }
        />
      </div>

      <ReportWorkspace filters={filters} />
    </>
  );
}
