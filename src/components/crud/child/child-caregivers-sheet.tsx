"use client"

import * as React from "react"
import axios from "axios"
import { HeartHandshake, Trash2, UserPlus } from "lucide-react"
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

interface ChildCaregiversSheetProps {
  child: Child
}

export function ChildCaregiversSheet({ child }: ChildCaregiversSheetProps) {
  const [open, setOpen] = React.useState(false)
  const [records, setRecords] = React.useState<CaregiverChildRecord[]>([])
  const [allCaregivers, setAllCaregivers] = React.useState<Caregiver[]>([])
  const [loading, setLoading] = React.useState(false)
  const [selectedCaregiverId, setSelectedCaregiverId] = React.useState("")
  const [relationship, setRelationship] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  const load = React.useCallback(() => {
    setLoading(true)
    Promise.all([
      apiClient.get<CaregiverChildRecord[]>("caregiver-children"),
      apiClient.get<Caregiver[]>("caregivers"),
    ])
      .then(([cc, cg]) => {
        setRecords(cc.data.filter((r) => r.childId === child.id))
        setAllCaregivers(cg.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [child.id])

  React.useEffect(() => {
    if (open) load()
  }, [open, load])

  const assignedIds = new Set(records.map((r) => r.caregiverId))
  const availableCaregivers = allCaregivers.filter((c) => !assignedIds.has(c.id))

  async function handleAssign() {
    if (!selectedCaregiverId || !relationship.trim()) return
    setSaving(true)
    try {
      await apiClient.post("caregiver-children", {
        caregiverId: Number(selectedCaregiverId),
        childId: child.id,
        relationship: relationship.trim(),
      })
      toast.success("Cuidador asignado correctamente")
      setSelectedCaregiverId("")
      setRelationship("")
      load()
    } catch {
      toast.error("Error al asignar el cuidador")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(recordId: number) {
    try {
      await apiClient.delete(`caregiver-children/${recordId}`)
      toast.success("Cuidador eliminado")
      setRecords((prev) => prev.filter((r) => r.id !== recordId))
    } catch {
      toast.error("Error al eliminar el cuidador")
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" title="Gestionar cuidadores">
          <HeartHandshake className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle>
            Cuidadores de {child.firstName} {child.lastName}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-5">
          {/* Assign form */}
          <div className="rounded-md border p-4 space-y-3">
            <p className="text-sm font-medium flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Asignar cuidador
            </p>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Cuidador</Label>
                <Select value={selectedCaregiverId} onValueChange={setSelectedCaregiverId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un cuidador" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCaregivers.length === 0 ? (
                      <SelectItem value="none" disabled>No hay cuidadores disponibles</SelectItem>
                    ) : (
                      availableCaregivers.map((c) => (
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
              disabled={!selectedCaregiverId || !relationship.trim() || saving}
              onClick={handleAssign}
            >
              {saving ? "Asignando..." : "Asignar"}
            </Button>
          </div>

          <Separator />

          {/* Current caregivers */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Cuidadores actuales</p>
              <Badge variant="outline">{records.length}</Badge>
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-6">Cargando...</p>
            ) : records.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Este niño no tiene cuidadores registrados.
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
                      <TableCell className="font-medium">{r.caregiverName}</TableCell>
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

