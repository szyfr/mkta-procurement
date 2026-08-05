"use client";

import { BuildingIcon } from "lucide-react";
import Link from "next/link";
import type * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { appIdentity, mainNav } from "@/data/navigation";
import type { AuthenticatedUser } from "@/modules/auth";

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: AuthenticatedUser }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      {/* The brand block is a fixed 56px so it lines up with the 56px top bar
          across the sidebar border. */}
      <SidebarHeader className="h-14 justify-center px-3 py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="h-auto gap-2.5 p-0 hover:bg-transparent active:bg-transparent"
              render={<Link href="/dashboard" />}
            >
              <div className="flex aspect-square size-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <BuildingIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-bold">
                  {appIdentity.name}
                </span>
                <span className="truncate text-[11px] text-muted-foreground">
                  {appIdentity.organization}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-1.5">
        <NavMain groups={mainNav} />
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
