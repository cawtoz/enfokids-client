"use client"

import * as React from "react"
import axios from "axios"
import { ArrowLeft } from "lucide-react"
import { AssignmentStatus, FrequencyUnit, type Assignment } from "@/types/assignment"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AssignmentProgressSheet } from "@/components/crud/progress/assignment-progress-sheet"

const apiClient = axios.create({ baseURL: "/api", headers: { "Content-Type": "application/json" } })

type StatusFilter = AssignmentStatus | "ALL"

const statusConfig: Record<AssignmentStatus, { label: string; className: string }> = {
  [AssignmentStatus.PENDING]:     { label: "Pendiente",   className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  [AssignmentStatus.IN_PROGRESS]: { label: "En progreso", className: "bg-blue-100 text-blue-800 border-blue-300" },
  [AssignmentStatus.COMPLETED]:   { label: "Completado",  className: "bg-green-100 text-green-800 border-green-300" },
  [AssignmentStatus.CANCELLED]:   { label: "Cancelado",   className: "bg-red-100 text-red-800 border-red-300" },
}

const frequencyUnitLabel: Record<FrequencyUnit, string> = {
  [FrequencyUnit.DAY]:   "día",
  [FrequencyUnit.WEEK]:  "semana",
  [FrequencyUnit.MONTH]: "mes",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" })
}

interface ChildActivitiesViewProps {
  childId: number
  childName: string
}

export function ChildActivitiesView({ childId, childName }: ChildActivitiesViewProps) {
  const [assignments, setAssignments] = React.useState<Assignment[]>([])
  const [loading, setLoading] = React.useState(true)
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("ALL")

  React.useEffect(() => {
    fetchAssignments()
  }, [statusFilter])

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = { childId: String(childId) }
      if (statusFilter !== "ALL") params.status = statusFilter
      const res = await apiClient.get<Assignment[]>("assignments", { params })
      setAssignments(res.data || [])
    } catch (error) {
      console.error("Error fetching assignments:", error)
      setAssignments([])
    } finally {
      setLoading(false)
    }
  }

  const counts = React.useMemo(() => {
    const all = assignments
    return {
      total: all.length,
      [AssignmentStatus.PENDING]:     all.filter((a) => a.status === AssignmentStatus.PENDING).length,
      [AssignmentStatus.IN_PROGRESS]: all.filter((a) => a.status === AssignmentStatus.IN_PROGRESS).length,
      [AssignmentStatus.COMPLETED]:   all.filter((a) => a.status === AssignmentStatus.COMPLETED).length,
      [AssignmentStatus.CANCELLED]:   all.filter((a) => a.status === AssignmentStatus.CANCELLED).length,
    }
  }, [assignments])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => window.history.back()}
          className="hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Actividades de {childName}
          </h1>
          <p className="text-muted-foreground mt-1">
            Ver y registrar el progreso de las actividades asignadas
          </p>
        </div>
      </div>

      {/* Summary Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{counts.total} total</Badge>
        {counts[AssignmentStatus.PENDING] > 0 && (
          <Badge className={statusConfig[AssignmentStatus.PENDING].className}>
            {counts[AssignmentStatus.PENDING]} pendiente(s)
          </Badge>
        )}
        {counts[AssignmentStatus.IN_PROGRESS] > 0 && (
          <Badge className={statusConfig[AssignmentStatus.IN_PROGRESS].className}>
            {counts[AssignmentStatus.IN_PROGRESS]} en progreso
          </Badge>
        )}
        {counts[AssignmentStatus.COMPLETED] > 0 && (
          <Badge className={statusConfig[AssignmentStatus.COMPLETED].className}>
            {counts[AssignmentStatus.COMPLETED]} completado(s)
          </Badge>
        )}
        {counts[AssignmentStatus.CANCELLED] > 0 && (
          <Badge className={statusConfig[AssignmentStatus.CANCELLED].className}>
            {counts[AssignmentStatus.CANCELLED]} cancelado(s)
          </Badge>
        )}
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground shrink-0">Filtrar por estado:</span>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value={AssignmentStatus.PENDING}>Pendiente</SelectItem>
            <SelectItem value={AssignmentStatus.IN_PROGRESS}>En progreso</SelectItem>
            <SelectItem value={AssignmentStatus.COMPLETED}>Completado</SelectItem>
            <SelectItem value={AssignmentStatus.CANCELLED}>Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assignments Table */}
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">Cargando...</p>
      ) : assignments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {statusFilter === "ALL"
            ? "Este niño no tiene asignaciones registradas."
            : "No hay asignaciones con ese estado."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Actividad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Frecuencia</TableHead>
                <TableHead>Duración</TableHead>
                <TableHead>Progreso</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((a) => {
                const sc = statusConfig[a.status] ?? { label: a.status, className: "" }
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.activityTitle}</TableCell>
                    <TableCell>
                      <Badge className={sc.className}>{sc.label}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(a.startDate)}</TableCell>
                    <TableCell>{formatDate(a.endDate)}</TableCell>
                    <TableCell>
                      {a.frequencyCount}x {frequencyUnitLabel[a.frequencyUnit] ?? a.frequencyUnit}
                    </TableCell>
                    <TableCell>
                      {a.estimatedDuration ? `${a.estimatedDuration} min` : "—"}
                    </TableCell>
                    <TableCell>
                      <AssignmentProgressSheet assignment={a} />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
