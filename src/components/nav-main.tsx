"use client";

import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    SidebarGroup,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export interface NavItem {
    title: string;
    url: string;
    icon?: React.ComponentType<{ className?: string }>;
    items?: { title: string; url: string }[];
}

export function NavMain({ items }: { items: NavItem[] }) {
    const pathname = usePathname();

    /** A section is active for its own route and anything nested under it. */
    const isActive = (url: string) =>
        pathname === url || pathname.startsWith(`${url}/`);

    return (
        <SidebarGroup>
            <SidebarMenu>
                {items.map((item) => {
                    const Icon = item.icon;

                    // Leaf item — render a plain link rather than a collapsible section.
                    if (!item.items?.length) {
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    tooltip={item.title}
                                    isActive={isActive(item.url)}
                                    render={<Link href={item.url} />}
                                >
                                    {Icon ? <Icon /> : null}
                                    <span>{item.title}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    }

                    return (
                        <Collapsible
                            key={item.title}
                            defaultOpen={isActive(item.url)}
                            className="group/collapsible"
                            render={<SidebarMenuItem />}
                        >
                            <CollapsibleTrigger
                                render={
                                    <SidebarMenuButton tooltip={item.title} />
                                }
                            >
                                {Icon ? <Icon /> : null}
                                <span>{item.title}</span>
                                <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <SidebarMenuSub>
                                    {item.items.map((subItem) => (
                                        <SidebarMenuSubItem key={subItem.title}>
                                            <SidebarMenuSubButton
                                                isActive={
                                                    pathname === subItem.url
                                                }
                                                render={
                                                    <Link href={subItem.url} />
                                                }
                                            >
                                                <span>{subItem.title}</span>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    ))}
                                </SidebarMenuSub>
                            </CollapsibleContent>
                        </Collapsible>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
