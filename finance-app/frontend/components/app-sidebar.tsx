"use client"

import * as React from "react"
import {
    AudioWaveform,
    BookOpen,
    Bot,
    Command,
    Frame,
    GalleryVerticalEnd,
    Map,
    PieChart,
    Settings2,
    Wallet,
    CreditCard,
    LayoutDashboard,
} from "lucide-react"

import { useUser } from "@/hooks/use-user"
import { NavMain } from "@/components/nav-main"
import { NavBottom } from "@/components/nav-bottom"
import { TeamSwitcher } from "@/components/team-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
    user: {
        name: "User",
        email: "user@example.com",
        avatar: "/placeholder-user.jpg",
    },
    teams: [
        {
            name: "Personal Finance",
            logo: Wallet,
            plan: "Pro",
        },
    ],
    navMain: [
        {
            group: "Platform",
            title: "Dashboard",
            url: "/",
            icon: LayoutDashboard,
            isActive: true,
            items: [
                {
                    title: "Overview",
                    url: "/",
                },
            ],
        },
        {
            group: "Finance",
            title: "Finance",
            url: "#",
            icon: CreditCard,
            items: [
                {
                    title: "New Category",
                    url: "/categories/new",
                },
                {
                    title: "New Transaction",
                    url: "/transactions/new",
                },
                {
                    title: "New Account",
                    url: "/accounts/new",
                },
                {
                    title: "Transactions",
                    url: "/transactions",
                },
                {
                    title: "Accounts",
                    url: "/accounts",
                },
                {
                    title: "Categories",
                    url: "/categories",
                },
                {
                    title: "Budget",
                    url: "/budget",
                },
                {
                    title: "Stocks",
                    url: "/stocks",
                },
            ],
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user } = useUser();

    const userData = {
        name: user?.email.split("@")[0] || "User",
        email: user?.email || "user@example.com",
        avatar: "/placeholder-user.jpg",
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={data.teams} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                {user && <NavBottom user={userData} />}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
