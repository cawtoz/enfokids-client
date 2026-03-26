"use client"

import * as React from "react"
import axios from "axios"
import { TrendingUp, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
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
import { toast } from "sonner"
import type { Assignment, AssignmentStatus } from "@/types/assignment"
import { AssignmentStatus as AssignmentStatusEnum } from "@/types/assignment"

const apiClient = axios.create({ baseURL: "/api", headers: { "Content-Type": "application/json" } })

interface ProgressRecord {
  id: number
  assignmentId: number
  notes: string
  date: string
  completed: boolean
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-PE", {
    day: "2-digit", month: "2-digit", year: "numeric",
  })
}

interface ProgressFormProps {
  assignment: Assignment
  onSaved?: (newStatus: AssignmentStatus) => void
}

// ─── PROGRESS FORM (reutilizable) ───
export function ProgressForm({ assignment, onSaved }: ProgressFormProps) {
  const [date, setDate] = React.useState(() => new Date().toISOString().split("T")[0])
  const [notes, setNotes] = React.useState("")
  const [completed, setCompleted] = React.useState(false)
  const [saving, setSaving] = React.useState(false)

  async function handleAdd() {
    if (!date) return
    setSaving(true)
    try {
      const progressRes = await apiClient.get<ProgressRecord[]>("progress", {
        params: { assignmentId: assignment.id }
      })
      const allRecords = progressRes.data
      const newCompletedCount = allRecords.filter((r) => r.completed).length

      let newStatus: AssignmentStatus = assignment.status
      if (newCompletedCount === 0) {
        newStatus = AssignmentStatusEnum.PENDING
      } else if (newCompletedCount >= assignment.repetitions) {
        newStatus = AssignmentStatusEnum.COMPLETED
      } else {
        newStatus = AssignmentStatusEnum.IN_PROGRESS
      }

      if (newStatus !== assignment.status) {
        await apiClient.put(`assignments/${assignment.id}`, {
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
        })
      }

      await apiClient.post("progress", {
        assignmentId: assignment.id,
        notes: notes.trim(),
        date: `${date}T00:00:00`,
        completed,
      })

      toast.success("Progreso registrado")
      setDate("")
      setNotes("")
      setCompleted(false)
      onSaved?.(newStatus)
    } catch {
      toast.error("Error al registrar el progreso")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-md border p-4 space-y-3">
      <p className="text-sm font-medium flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Registrar progreso
      </p>
      <div className="space-y-1">
        <Label className="text-xs">Fecha</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Notas</Label>
        <Textarea
          placeholder="Observaciones de la sesión..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="completed"
          checked={completed}
          onChange={(e) => setCompleted(e.target.checked)}
          className="h-4 w-4 rounded border"
        />
        <Label htmlFor="completed" className="text-sm cursor-pointer">
          Actividad completada en esta sesión
        </Label>
      </div>
      <Button
        size="sm"
        className="w-full"
        disabled={!date || saving}
        onClick={handleAdd}
      >
        {saving ? "Guardando..." : "Registrar"}
      </Button>
    </div>
  )
}

interface AssignmentProgressSheetProps {
  assignment: Assignment
  onAssignmentUpdated?: (updatedAssignment: Assignment) => void
}

export function AssignmentProgressSheet({ assignment, onAssignmentUpdated }: AssignmentProgressSheetProps) {
  const [open, setOpen] = React.useState(false)
  const [records, setRecords] = React.useState<ProgressRecord[]>([])
  const [loading, setLoading] = React.useState(false)

  const load = React.useCallback(() => {
    setLoading(true)
    apiClient
      .get<ProgressRecord[]>("progress", { params: { assignmentId: assignment.id } })
      .then((res) => setRecords(res.data))
      .catch(() => setRecords([]))
      .finally(() => setLoading(false))
  }, [assignment.id])

  React.useEffect(() => {
    if (open) load()
  }, [open, load])

  async function handleDelete(id: number) {
    try {
      await apiClient.delete(`progress/${id}`)
      toast.success("Registro eliminado")
      setRecords((prev) => prev.filter((r) => r.id !== id))
    } catch {
      toast.error("Error al eliminar el registro")
    }
  }

  const handleSaved = (newStatus: AssignmentStatus) => {
    const updatedAssignment = { ...assignment, status: newStatus }
    onAssignmentUpdated?.(updatedAssignment)
    load()
  }

  const completedCount = records.filter((r) => r.completed).length
  const isCompleted = assignment.status === AssignmentStatusEnum.COMPLETED

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" title="Ver progreso">
          <TrendingUp className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle>Progreso — {assignment.activityTitle}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-5">
          {/* Register form */}
          {isCompleted ? (
            <div className="rounded-md border border-green-300 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                <span className="text-lg">✅</span>
                Actividad completada
              </p>
              <p className="text-xs text-green-700 mt-1">
                Se han registrado todos los {assignment.repetitions} progreso(s) necesarios.
              </p>
            </div>
          ) : (
            <ProgressForm assignment={assignment} onSaved={handleSaved} />
          )}

          <Separator />

          {/* History */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Historial</p>
              <Badge variant="outline">{records.length} registro(s)</Badge>
              {completedCount > 0 && (
                <Badge className="bg-green-100 text-green-800 border-green-300">
                  {completedCount} completado(s)
                </Badge>
              )}
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-6">Cargando...</p>
            ) : records.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No hay registros de progreso aún.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Notas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap">{formatDate(r.date)}</TableCell>
                      <TableCell className="max-w-[180px] truncate text-sm text-muted-foreground">
                        {r.notes || "—"}
                      </TableCell>
                      <TableCell>
                        {r.completed
                          ? <Badge className="bg-green-100 text-green-800 border-green-300">Completado</Badge>
                          : <Badge variant="secondary">Parcial</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(r.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
