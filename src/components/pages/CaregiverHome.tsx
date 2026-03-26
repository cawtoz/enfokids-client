"use client"

import * as React from "react"
import axios from "axios"
import type { Child } from "@/types/user"
import { ChildAssignmentsContent } from "@/components/crud/child/child-assignments-sheet"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, RefreshCw, Eye, ClipboardList, ChevronRight } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
})

interface CaregiverChildRecord {
  id: number
  caregiverId: number
  caregiverName: string
  childId: number
  childName: string
  relationship: string
}

interface CaregiverHomeProps {
  user: {
    id: number
    firstName: string
    lastName: string
    email: string
  }
}

export function CaregiverHome({ user }: CaregiverHomeProps) {
  const [caregiverChildren, setCaregiverChildren] = React.useState<CaregiverChildRecord[]>([])
  const [children, setChildren] = React.useState<Child[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [caregiverChildRes, childrenRes] = await Promise.all([
        apiClient.get<CaregiverChildRecord[]>("caregiver-children"),
        apiClient.get<Child[]>("children"),
      ])

      const allCaregiverChildren = caregiverChildRes.data || []
      const allChildren = childrenRes.data || []

      const thisCaregiverChildren = allCaregiverChildren.filter(
        (cc) => cc.caregiverId === user.id
      )

      const childIds = new Set(thisCaregiverChildren.map((cc) => cc.childId))
      const filteredChildren = allChildren.filter((c) => childIds.has(c.id))

      setCaregiverChildren(thisCaregiverChildren)
      setChildren(filteredChildren)
    } catch (err) {
      console.error("Error fetching caregiver data:", err)
      setError("No se pudieron cargar los datos. Por favor, intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const getCaregiverChildRelationship = (childId: number): string => {
    const record = caregiverChildren.find((cc) => cc.childId === childId)
    return record?.relationship || "Cuidador"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="space-y-4 text-center">
          <div className="animate-spin">
            <RefreshCw className="h-8 w-8 mx-auto text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="w-full max-w-md border-destructive">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-destructive text-center">{error}</p>
              <Button
                onClick={fetchData}
                variant="outline"
                className="w-full"
              >
                Intentar de nuevo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (children.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="space-y-4 text-center">
          <Heart className="h-12 w-12 text-muted-foreground/50 mx-auto" />
          <p className="text-muted-foreground">
            Aún no tienes niños asignados bajo tu cuidado.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Niños bajo tu cuidado
        </h1>
        <p className="text-muted-foreground">
          Tienes {children.length} {children.length === 1 ? "niño" : "niños"} a cargo
        </p>
      </div>

      {/* Children Grid - Larger Cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        {children.map((child) => {
          const relationship = getCaregiverChildRelationship(child.id)
          return (
            <Card
              key={child.id}
              className="overflow-hidden hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary"
            >
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Child Name and Info */}
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">
                      {child.firstName} {child.lastName}
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-sm py-1">
                        {relationship}
                      </Badge>
                      {child.diagnosis && (
                        <Badge variant="outline" className="text-sm py-1">
                          {child.diagnosis}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-border" />

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3">
                    <Button
                      asChild
                      className="w-full bg-primary hover:bg-primary/90 text-white"
                    >
                      <a
                        href={`/nino/${child.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Ver como niño (nueva ventana)
                      </a>
                    </Button>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <ClipboardList className="h-4 w-4 mr-2" />
                          Ver actividades y progreso
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-6">
                        <SheetHeader className="mb-4">
                          <SheetTitle>
                            Actividades — {child.firstName} {child.lastName}
                          </SheetTitle>
                        </SheetHeader>
                        <ChildAssignmentsContent child={child} />
                      </SheetContent>
                    </Sheet>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
