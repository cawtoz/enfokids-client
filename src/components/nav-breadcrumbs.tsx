"use client"

import * as React from "react"
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function NavBreadcrumbs() {
    const [path, setPath] = React.useState<string>(() =>
        typeof window !== "undefined" ? window.location.pathname : "/"
    )

    React.useEffect(() => {
        const onPop = () => setPath(window.location.pathname)
        window.addEventListener("popstate", onPop)
        return () => window.removeEventListener("popstate", onPop)
    }, [])

    const rootPath = "/inicio"

    // Build segments but avoid duplicating the root segment when the route is /inicio
    let segments = path === "/" ? [] : path.split("/").filter(Boolean)
    let rootIsCurrent = false

    if (segments.length > 0 && segments[0] === rootPath.replace("/", "")) {
        // If the first segment is 'inicio', drop it from segments so we don't render it twice
        segments = segments.slice(1)
        rootIsCurrent = segments.length === 0
    } else if (path === "/") {
        rootIsCurrent = false
    }

    let cumulative = ""

    return (
        <Breadcrumb className="mr-2">
            <BreadcrumbList>
                <BreadcrumbItem>
                    {rootIsCurrent ? (
                        <BreadcrumbPage>Inicio</BreadcrumbPage>
                    ) : (
                        <BreadcrumbLink href={rootPath}>Inicio</BreadcrumbLink>
                    )}
                    <BreadcrumbSeparator />
                </BreadcrumbItem>
                {segments.map((seg, i) => {
                    cumulative += `/${seg}`
                    const isLast = i === segments.length - 1
                    const label = seg.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

                    return (
                        <BreadcrumbItem key={cumulative}>
                            {isLast ? (
                                <BreadcrumbPage>{label}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink href={cumulative}>{label}</BreadcrumbLink>
                            )}
                            {i < segments.length - 1 && <BreadcrumbSeparator />}
                        </BreadcrumbItem>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
