"use client"

import * as React from "react"
import {
  type ColumnDef as TanStackColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Plus, ChevronDown } from "lucide-react"

// Re-export TanStack ColumnDef for use in other files
export type ColumnDef<T> = TanStackColumnDef<T>

export interface TableCRUDProps<T extends { id: number | string }> {
  title: string
  description?: string
  columns: ColumnDef<T>[]
  data: T[]
  createButtonLabel?: string
  isLoading?: boolean
  onCreateOpen?: () => void
  onEditOpen?: (item: T) => void
  onDelete?: () => Promise<void>
  deleteId?: number | string | null
  onDeleteCancel?: () => void
  createForm?: React.ReactNode
  editForm?: React.ReactNode
  isCreateOpen?: boolean
  isEditOpen?: boolean
  onCreateClose?: () => void
  onEditClose?: () => void
  // Nuevas props para configurar filtros y búsqueda
  searchColumn?: string
  searchPlaceholder?: string
}

export function TableCRUD<T extends { id: number | string }>({
  title,
  description,
  columns,
  data,
  createButtonLabel = "Crear Nuevo",
  isLoading = false,
  onCreateOpen,
  onDelete,
  deleteId: externalDeleteId,
  onDeleteCancel,
  createForm,
  editForm,
  isCreateOpen = false,
  isEditOpen = false,
  onCreateClose,
  onEditClose,
  searchColumn,
  searchPlaceholder = "Buscar...",
}: TableCRUDProps<T>) {
  const [internalDeleteId, setInternalDeleteId] = React.useState<number | string | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  // Usa el deleteId externo si se proporciona, sino el interno
  const deleteId = externalDeleteId !== undefined ? externalDeleteId : internalDeleteId
  const handleCancelDelete = onDeleteCancel || (() => setInternalDeleteId(null))

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const handleDelete = async () => {
    if (!deleteId || !onDelete) return
    
    setIsDeleting(true)
    try {
      await onDelete()
    } catch (error) {
      console.error("Error deleting:", error)
    } finally {
      handleCancelDelete()
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {onCreateOpen && (
          <Button onClick={onCreateOpen}>
            <Plus />
            {createButtonLabel}
          </Button>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        {searchColumn && (
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(searchColumn)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columnas <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Cargando...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay registros
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <>
              {table.getFilteredSelectedRowModel().rows.length} de{" "}
              {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
            </>
          )}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>

      {/* Create Dialog */}
      {createForm && (
        <Dialog open={isCreateOpen} onOpenChange={onCreateClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear {title}</DialogTitle>
              <DialogDescription>
                Completa el formulario para crear un nuevo registro
              </DialogDescription>
            </DialogHeader>
            {createForm}
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {editForm && (
        <Dialog open={isEditOpen} onOpenChange={onEditClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar {title}</DialogTitle>
              <DialogDescription>
                Modifica los campos que desees actualizar
              </DialogDescription>
            </DialogHeader>
            {editForm}
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={handleCancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El registro será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
