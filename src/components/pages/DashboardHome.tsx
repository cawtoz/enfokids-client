"use client"

import * as React from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users, Brain, HeartHandshake, ClipboardList,
  Activity, TrendingUp, CheckCircle2, Clock, AlertCircle, XCircle,
} from "lucide-react"

interface Props {
  user?: { firstName?: string; lastName?: string; email?: string }
}

interface Stats {
  children: number
  therapists: number
  caregivers: number
  activities: number
  assignments: {
    total: number
    PENDING: number
    IN_PROGRESS: number
    COMPLETED: number
    CANCELLED: number
  }
}

interface RecentAssignment {
  id: number
  activityTitle?: string
  childFirstName?: string
  childLastName?: string
  status: string
  startDate?: string
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pendiente",
  IN_PROGRESS: "En progreso",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
}

const STATUS_VARIANT: Record<string, string> = {
  PENDING:     "bg-yellow-100 text-yellow-800 border-yellow-300",
  IN_PROGRESS: "bg-blue-100 text-blue-800 border-blue-300",
  COMPLETED:   "bg-green-100 text-green-800 border-green-300",
  CANCELLED:   "bg-red-100 text-red-800 border-red-300",
}

const STATUS_BAR: Record<string, string> = {
  PENDING:     "bg-yellow-400",
  IN_PROGRESS: "bg-blue-400",
  COMPLETED:   "bg-green-400",
  CANCELLED:   "bg-red-400",
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  PENDING:     <Clock className="w-3 h-3" />,
  IN_PROGRESS: <TrendingUp className="w-3 h-3" />,
  COMPLETED:   <CheckCircle2 className="w-3 h-3" />,
  CANCELLED:   <XCircle className="w-3 h-3" />,
}

function StatCard({ icon, label, value, description }: {
  icon: React.ReactNode
  label: string
  value: number | string
  description?: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}

function StatSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

export function DashboardHome({ user }: Props) {
  const [stats, setStats] = React.useState<Stats | null>(null)
  const [recent, setRecent] = React.useState<RecentAssignment[]>([])
  const [loading, setLoading] = React.useState(true)

  const firstName = user?.firstName ?? "Usuario"
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches"

  React.useEffect(() => {
    async function load() {
      try {
        const [children, therapists, caregivers, activities, assignments] = await Promise.allSettled([
          axios.get("/api/children"),
          axios.get("/api/therapists"),
          axios.get("/api/caregivers"),
          axios.get("/api/activities"),
          axios.get("/api/assignments"),
        ])

        const get = (r: PromiseSettledResult<any>) =>
          r.status === "fulfilled" ? r.value.data : []

        const assignmentList: RecentAssignment[] = get(assignments)
        const counts = { total: 0, PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 }
        assignmentList.forEach((a: any) => {
          counts.total++
          if (a.status in counts) counts[a.status as keyof typeof counts]++
        })

        setStats({
          children: get(children).length,
          therapists: get(therapists).length,
          caregivers: get(caregivers).length,
          activities: get(activities).length,
          assignments: counts,
        })

        const sorted = [...assignmentList]
          .sort((a: any, b: any) => (b.id ?? 0) - (a.id ?? 0))
          .slice(0, 6)
        setRecent(sorted)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Aquí tienes un resumen del estado actual del sistema.
        </p>
      </div>

      <Separator />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon={<Users className="h-4 w-4" />}         label="Niños registrados" value={stats?.children ?? 0}   description="Total en el sistema" />
            <StatCard icon={<Brain className="h-4 w-4" />}          label="Terapeutas"        value={stats?.therapists ?? 0} description="Total en el sistema" />
            <StatCard icon={<HeartHandshake className="h-4 w-4" />} label="Cuidadores"        value={stats?.caregivers ?? 0} description="Total en el sistema" />
            <StatCard icon={<Activity className="h-4 w-4" />}       label="Actividades"       value={stats?.activities ?? 0} description="Total en el sistema" />
          </>
        )}
      </div>

      {/* Asignaciones breakdown + recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Estado de asignaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4" />
              Asignaciones
            </CardTitle>
            <CardDescription>Estado general del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full rounded" />)
            ) : (
              <>
                {(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const).map((s) => {
                  const count = stats?.assignments[s] ?? 0
                  const total = stats?.assignments.total || 1
                  const pct = Math.round((count / total) * 100)
                  return (
                    <div key={s} className="space-y-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          {STATUS_ICON[s]}
                          {STATUS_LABEL[s]}
                        </span>
                        <span className="font-semibold">{count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${STATUS_BAR[s]}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
                <Separator />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Total asignaciones</span>
                  <span className="font-bold text-foreground">{stats?.assignments.total ?? 0}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Asignaciones recientes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Asignaciones recientes
            </CardTitle>
            <CardDescription>Las últimas asignaciones registradas en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-40" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                <AlertCircle className="w-8 h-8 opacity-40" />
                <p className="text-sm">No hay asignaciones registradas</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recent.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                      {(a.childFirstName?.[0] ?? "?").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {a.activityTitle ?? `Actividad #${a.id}`}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {a.childFirstName} {a.childLastName}
                        {a.startDate && ` · ${a.startDate.split("T")[0]}`}
                      </p>
                    </div>
                    <Badge variant="outline" className={`shrink-0 text-xs flex items-center gap-1 ${STATUS_VARIANT[a.status] ?? ""}`}>
                      {STATUS_ICON[a.status]}
                      {STATUS_LABEL[a.status] ?? a.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Accesos rápidos */}
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-3">Accesos rápidos</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { href: "/ninos",        icon: <Users className="h-4 w-4" />,         label: "Niños" },
            { href: "/terapeutas",   icon: <Brain className="h-4 w-4" />,          label: "Terapeutas" },
            { href: "/cuidadores",   icon: <HeartHandshake className="h-4 w-4" />, label: "Cuidadores" },
            { href: "/actividades",  icon: <Activity className="h-4 w-4" />,       label: "Actividades" },
            { href: "/asignaciones", icon: <ClipboardList className="h-4 w-4" />,  label: "Asignaciones" },
          ].map((item) => (
            <Button key={item.href} variant="outline" className="h-auto flex-col gap-2 py-4" asChild>
              <a href={item.href}>
                {item.icon}
                <span className="text-xs">{item.label}</span>
              </a>
            </Button>
          ))}
        </div>
      </div>

    </div>
  )
}
