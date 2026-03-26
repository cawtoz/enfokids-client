"use client"

import * as React from "react"
import axios from "axios"
import { ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
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
import { AssignmentStatus, FrequencyUnit, type Assignment } from "@/types/assignment"
import type { Child } from "@/types/user"
import { AssignmentProgressSheet } from "@/components/crud/progress/assignment-progress-sheet"

const apiClient = axios.create({ baseURL: "/api", headers: { "Content-Type": "application/json" } })

type StatusFilter = AssignmentStatus | "ALL"

const statusConfig: Record<AssignmentStatus, { label: string; className: string }> = {
  [AssignmentStatus.PENDING]:     { label: "Pendiente",   className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
  [AssignmentStatus.IN_PROGRESS]: { label: "En progreso", className: "bg-blue-100 text-blue-800 border-blue-300" },
  [AssignmentStatus.COMPLETED]:   { label: "Completado",  className: "bg-green-100 text-green-800 border-green-300" },
}

const frequencyUnitLabel: Record<FrequencyUnit, string> = {
  [FrequencyUnit.DAY]:   "día",
  [FrequencyUnit.WEEK]:  "semana",
  [FrequencyUnit.MONTH]: "mes",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric" })
}

interface ChildAssignmentsSheetProps {
  child: Child
}

export function ChildAssignmentsContent({ child }: ChildAssignmentsSheetProps) {
  const [assignments, setAssignments] = React.useState<Assignment[]>([])
  const [loading, setLoading] = React.useState(false)
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("ALL")
  const [updatingId, setUpdatingId] = React.useState<number | null>(null)

  React.useEffect(() => {
    fetchAssignments()
  }, [child.id, statusFilter])

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = { childId: String(child.id) }
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

  const handleStatusChange = async (assignmentId: number, newStatus: AssignmentStatus) => {
    try {
      setUpdatingId(assignmentId)
      const assignment = assignments.find(a => a.id === assignmentId)
      if (!assignment) return

      // Enviar todos los datos de la asignación, solo cambiando el status
      const updateData = {
        therapistId: assignment.therapistId,
        childId: assignment.childId,
        activityId: assignment.activityId,
        startDate: assignment.startDate,
        endDate: assignment.endDate,
        frequencyUnit: assignment.frequencyUnit,
        frequencyCount: assignment.frequencyCount,
        repetitions: assignment.repetitions,
        estimatedDuration: assignment.estimatedDuration,
        status: newStatus,
      }

      await apiClient.put(`assignments/${assignmentId}`, updateData)
      // Actualizar el estado local
      setAssignments(assignments.map(a =>
        a.id === assignmentId ? { ...a, status: newStatus } : a
      ))
    } catch (error) {
      console.error("Error updating assignment status:", error)
    } finally {
      setUpdatingId(null)
    }
  }

  // Count per status for summary badges
  const counts = React.useMemo(() => {
    const all = assignments
    return {
      total: all.length,
      [AssignmentStatus.PENDING]:     all.filter((a) => a.status === AssignmentStatus.PENDING).length,
      [AssignmentStatus.IN_PROGRESS]: all.filter((a) => a.status === AssignmentStatus.IN_PROGRESS).length,
      [AssignmentStatus.COMPLETED]:   all.filter((a) => a.status === AssignmentStatus.COMPLETED).length,
    }
  }, [assignments])

  return (
    <div className="space-y-4">
          {/* Summary badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{counts.total} total</Badge>
            {counts[AssignmentStatus.PENDING] > 0 && (
              <Badge className={statusConfig[AssignmentStatus.PENDING].className}>{counts[AssignmentStatus.PENDING]} pendiente(s)</Badge>
            )}
            {counts[AssignmentStatus.IN_PROGRESS] > 0 && (
              <Badge className={statusConfig[AssignmentStatus.IN_PROGRESS].className}>{counts[AssignmentStatus.IN_PROGRESS]} en progreso</Badge>
            )}
            {counts[AssignmentStatus.COMPLETED] > 0 && (
              <Badge className={statusConfig[AssignmentStatus.COMPLETED].className}>{counts[AssignmentStatus.COMPLETED]} completado(s)</Badge>
            )}
          </div>

          {/* Status filter */}
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
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Cargando...</p>
          ) : assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {statusFilter === "ALL"
                ? "Este niño no tiene asignaciones registradas."
                : "No hay asignaciones con ese estado."}
            </p>
          ) : (
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
                  const isUpdating = updatingId === a.id
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.activityTitle}</TableCell>
                      <TableCell>
                        <Select
                          value={a.status}
                          onValueChange={(val) => handleStatusChange(a.id, val as AssignmentStatus)}
                          disabled={isUpdating || a.status === AssignmentStatus.COMPLETED}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={AssignmentStatus.PENDING}>Pendiente</SelectItem>
                            <SelectItem value={AssignmentStatus.IN_PROGRESS}>En progreso</SelectItem>
                            <SelectItem value={AssignmentStatus.COMPLETED}>Completado</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <AssignmentProgressSheet
                          assignment={a}
                          onAssignmentUpdated={(updated) => {
                            setAssignments(assignments.map((item) =>
                              item.id === updated.id ? updated : item
                            ))
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
    </div>
  )
}

export function ChildAssignmentsSheet({ child }: ChildAssignmentsSheetProps) {
  const [open, setOpen] = React.useState(false)

  function handleOpenChange(val: boolean) {
    setOpen(val)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" title="Ver asignaciones">
          <ClipboardList className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle>
            Asignaciones — {child.firstName} {child.lastName}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <ChildAssignmentsContent child={child} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
