"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { settingsNav } from "@/data/navigation";
import { cn } from "@/lib/utils";

/** Panel switcher for the settings section. */
export function SettingsNav() {
    const pathname = usePathname();

    return (
        <nav aria-label="Settings">
            <ul className="flex gap-1 lg:flex-col">
                {settingsNav.map((entry) => {
                    const isActive = pathname === entry.url;

                    return (
                        <li key={entry.url}>
                            <Link
                                href={entry.url}
                                aria-current={isActive ? "page" : undefined}
                                className={cn(
                                    "block rounded-lg px-3 py-2 text-sm transition-colors",
                                    isActive
                                        ? "bg-card font-medium text-foreground ring-1 ring-foreground/10"
                                        : "text-muted-foreground hover:bg-muted",
                                )}
                            >
                                {entry.title}
                                {entry.adminOnly ? (
                                    <span className="text-muted-foreground">
                                        {" "}
                                        (Admin)
                                    </span>
                                ) : null}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
