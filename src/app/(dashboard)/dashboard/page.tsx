import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { PageHeader } from "@/components/shared/page-header";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  actionableRequests,
  pendingQuotations,
  recentActivity,
  upcomingDeadlines,
} from "@/data/dashboard";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your procurement workload"
        actions={
          <Button
            variant="outline"
            render={<Link href="/purchase-requests/new" />}
          >
            <PlusIcon data-icon="inline-start" />
            New Purchase Request
          </Button>
        }
      />

      <KpiCards />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 border-b">
              <CardTitle>Requests Requiring Action</CardTitle>
              <span className="text-xs text-muted-foreground">
                {actionableRequests.length} items
              </span>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">PR No.</TableHead>
                    <TableHead scope="col">Requester</TableHead>
                    <TableHead scope="col">Department</TableHead>
                    <TableHead scope="col">Amount</TableHead>
                    <TableHead scope="col">Step</TableHead>
                    <TableHead scope="col">Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actionableRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="px-4 font-medium">
                        <Link
                          href={`/purchase-requests/${request.id}`}
                          className="hover:underline"
                        >
                          {request.id}
                        </Link>
                      </TableCell>
                      <TableCell>{request.requester}</TableCell>
                      <TableCell>{request.department}</TableCell>
                      <TableCell>{formatCurrency(request.amount)}</TableCell>
                      <TableCell>
                        <StatusBadge tone={request.stepTone}>
                          {request.step}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="px-4">
                        <PriorityBadge priority={request.priority} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <ActivityFeed entries={recentActivity} />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Pending Quotations</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <ul className="divide-y">
                {pendingQuotations.map((quotation) => (
                  <li
                    key={quotation.id}
                    className="flex flex-col gap-0.5 px-4 py-3"
                  >
                    <Link
                      href={`/canvassing/${quotation.id}`}
                      className="text-sm hover:underline"
                    >
                      {quotation.summary}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {quotation.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <ul className="divide-y">
                {upcomingDeadlines.map((deadline) => (
                  <li
                    key={deadline.id}
                    className="flex items-center justify-between gap-2 px-4 py-3"
                  >
                    <span className="text-sm">{deadline.label}</span>
                    {deadline.overdue ? (
                      <StatusBadge tone="danger">{deadline.due}</StatusBadge>
                    ) : (
                      <Badge variant="outline">{deadline.due}</Badge>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
