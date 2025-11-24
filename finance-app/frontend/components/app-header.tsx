"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { usePathname } from "next/navigation"

export function AppHeader() {
    const pathname = usePathname()

    const getTitle = (path: string) => {
        if (path === "/") return "Dashboard"
        const segments = path.split("/").filter(Boolean)
        if (segments.length === 0) return "Dashboard"

        // Capitalize the first segment
        return segments[0].charAt(0).toUpperCase() + segments[0].slice(1)
    }

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger />
            <div className="w-full flex-1">
                <h1 className="text-lg font-semibold">{getTitle(pathname)}</h1>
            </div>
            <div className="flex items-center gap-4">
                <ModeToggle />
            </div>
        </header>
    )
}
