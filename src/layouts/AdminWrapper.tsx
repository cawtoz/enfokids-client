"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "next-themes"
import NavBreadcrumbs from "@/components/nav-breadcrumbs"
import ThemeToggle from "@/components/theme-toggle"
import { Toaster } from "@/components/ui/sonner"

interface Props {
    children: ReactNode;
    user?: {
        firstName: string;
        lastName: string;
        email: string;
    }
}

export default function AdminWrapper({ children, user }: Props) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
            <SidebarProvider className="bg-sidebar">
                <AppSidebar user={user} />
                <main className="bg-background min-h-screen flex-1 p-6 flex flex-col">
                    <div className="sticky top-0 z-10 flex items-center justify-between p-2 bg-background">
                        <div className="flex items-center gap-3">
                            <SidebarTrigger />
                            <NavBreadcrumbs />
                        </div>
                        <div>
                            <ThemeToggle />
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto">
                        {children}
                    </div>
                </main>
                <Toaster />
            </SidebarProvider>
        </ThemeProvider>
    )
}
