"use client"

import * as React from "react"
import axios from "axios"
import { Users, Baby } from "lucide-react"
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
import type { Child, Therapist } from "@/types/user"
import { ChildAssignmentsSheet } from "@/components/crud/child/child-assignments-sheet"

const apiClient = axios.create({ baseURL: "/api", headers: { "Content-Type": "application/json" } })

interface TherapistChildrenSheetProps {
  therapist: Therapist
}

export function TherapistChildrenSheet({ therapist }: TherapistChildrenSheetProps) {
  const [open, setOpen] = React.useState(false)
  const [children, setChildren] = React.useState<Child[]>([])
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setLoading(true)
    apiClient
      .get<Child[]>("children", { params: { therapistId: therapist.id } })
      .then((res) => setChildren(res.data))
      .catch(() => setChildren([]))
      .finally(() => setLoading(false))
  }, [open, therapist.id])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" title="Ver niños asignados">
          <Baby className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle>
            Niños de {therapist.firstName} {therapist.lastName}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{children.length} niño(s)</Badge>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground text-center py-8">Cargando...</p>
          ) : children.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Este terapeuta no tiene niños asignados.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Apellido</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Diagnóstico</TableHead>
                  <TableHead>Asignaciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {children.map((child) => (
                  <TableRow key={child.id}>
                    <TableCell className="font-medium">{child.firstName}</TableCell>
                    <TableCell>{child.lastName}</TableCell>
                    <TableCell className="text-muted-foreground">{child.username}</TableCell>
                    <TableCell>
                      <span className="max-w-xs truncate block text-sm">{child.diagnosis}</span>
                    </TableCell>
                    <TableCell>
                      <ChildAssignmentsSheet child={child} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
