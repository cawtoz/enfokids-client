"use client"

import * as React from "react"
import {
  Activity,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Users,
  Baby,
  Heart,
  Calendar,
  ClipboardList,
  TrendingUp,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"

const data = {
  teams: [
    {
      name: "Administrador",
      logo: GalleryVerticalEnd,
      plan: "Modo admin",
    },
    {
      name: "Terapeuta",
      logo: AudioWaveform,
      plan: "Modo terapeuta",
    },
    {
      name: "Cuidador",
      logo: Command,
      plan: "Modo cuidador",
    },
  ],
  navMain: [
    {
      title: "Actividades",
      url: "/actividades",
      icon: Activity,
    },
    {
      title: "Planes",
      url: "/planes-actividades",
      icon: ClipboardList,
    },
    {
      title: "Asignaciones",
      url: "/asignaciones",
      icon: Calendar,
    },
    {
      title: "Usuarios",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Terapeutas",
          url: "/terapeutas",
          icon: AudioWaveform,
        },
        {
          title: "Niños",
          url: "/ninos",
          icon: Baby,
        },
        {
          title: "Cuidadores",
          url: "/cuidadores",
          icon: Heart,
        },
      ],
    },
    // Progreso eliminado
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    roles?: string[];
  }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const [currentPath, setCurrentPath] = React.useState<string>(() =>
    typeof window !== "undefined" ? window.location.pathname + window.location.search : ""
  )

  React.useEffect(() => {
    const getPath = () => window.location.pathname + window.location.search
    const onPop = () => setCurrentPath(getPath())
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [])

  const navMain = React.useMemo(() => {
    const isCaregiver = user?.roles?.includes("CAREGIVER")

    if (isCaregiver) {
      // Para cuidadores, no mostrar nada - el panel ya está en /inicio-cuidador
      return []
    }

    return data.navMain.map((item) => {
      const items = item.items?.map((si) => {
        const normalized = si.url.startsWith("/") ? si.url : `/${si.url}`
        return { ...si, url: normalized, isActive: normalized === currentPath }
      })

      const parentActive = items?.some((i) => i.isActive) ?? false
      return { ...item, items, isActive: parentActive || false }
    })
  }, [currentPath, user?.roles])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
