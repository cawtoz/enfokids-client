"use client"

import * as React from "react"
import axios from "axios"
import { Users, UserPlus, Trash2, Baby } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import type { Caregiver, Child } from "@/types/user"

const apiClient = axios.create({ baseURL: "/api", headers: { "Content-Type": "application/json" } })

interface CaregiverChildRecord {
  id: number
  caregiverId: number
  caregiverName: string
  childId: number
  childName: string
  relationship: string
}

interface CaregiverChildrenSheetProps {
  caregiver: Caregiver
}

export function CaregiverChildrenSheet({ caregiver }: CaregiverChildrenSheetProps) {
  const [open, setOpen] = React.useState(false)
  const [records, setRecords] = React.useState<CaregiverChildRecord[]>([])
  const [allChildren, setAllChildren] = React.useState<Child[]>([])
  const [loading, setLoading] = React.useState(false)
  const [selectedChildId, setSelectedChildId] = React.useState("")
  const [relationship, setRelationship] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  const load = React.useCallback(() => {
    setLoading(true)
    Promise.all([
      apiClient.get<CaregiverChildRecord[]>("caregiver-children"),
      apiClient.get<Child[]>("children"),
    ])
      .then(([cc, ch]) => {
        setRecords(cc.data.filter((r) => r.caregiverId === caregiver.id))
        setAllChildren(ch.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [caregiver.id])

  React.useEffect(() => {
    if (open) load()
  }, [open, load])

  const assignedChildIds = new Set(records.map((r) => r.childId))
  const availableChildren = allChildren.filter((c) => !assignedChildIds.has(c.id))

  async function handleAssign() {
    if (!selectedChildId || !relationship.trim()) return
    setSaving(true)
    try {
      await apiClient.post("caregiver-children", {
        caregiverId: caregiver.id,
        childId: Number(selectedChildId),
        relationship: relationship.trim(),
      })
      toast.success("Niño asignado correctamente")
      setSelectedChildId("")
      setRelationship("")
      load()
    } catch {
      toast.error("Error al asignar el niño")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(recordId: number) {
    try {
      await apiClient.delete(`caregiver-children/${recordId}`)
      toast.success("Asignación eliminada")
      setRecords((prev) => prev.filter((r) => r.id !== recordId))
    } catch {
      toast.error("Error al eliminar la asignación")
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" title="Gestionar niños a cargo">
          <Baby className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle>
            Niños a cargo de {caregiver.firstName} {caregiver.lastName}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-5">
          {/* Assign form */}
          <div className="rounded-md border p-4 space-y-3">
            <p className="text-sm font-medium flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Asignar niño
            </p>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Niño</Label>
                <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un niño" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableChildren.length === 0 ? (
                      <SelectItem value="none" disabled>No hay niños disponibles</SelectItem>
                    ) : (
                      availableChildren.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.firstName} {c.lastName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Relación</Label>
                <Input
                  placeholder="Ej: Madre, Padre, Abuelo..."
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                />
              </div>
            </div>
            <Button
              size="sm"
              className="w-full"
              disabled={!selectedChildId || !relationship.trim() || saving}
              onClick={handleAssign}
            >
              {saving ? "Asignando..." : "Asignar"}
            </Button>
          </div>

          <Separator />

          {/* Current children */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Niños actuales</p>
              <Badge variant="outline">{records.length}</Badge>
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-6">Cargando...</p>
            ) : records.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Este cuidador no tiene niños a cargo.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Relación</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.childName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{r.relationship}</Badge>
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


interface CaregiverChildrenSheetProps {
  caregiver: Caregiver
}
