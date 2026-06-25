import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select"
import { useState } from "react"
import { BG_RUBROS } from "@/_constants"

type RubroType = { nombre: string; sectores: string }

export function RubroSectorSelects({
  rubros,
  rubro,
  sector,
  onRubroChange,
  onSectorChange,
}: {
  rubros: RubroType[] | undefined
  rubro?: string
  sector?: string
  onRubroChange: (value: string | undefined) => void
  onSectorChange: (value: string | undefined) => void
}) {
  const [rubroValue, setRubroValue] = useState(rubro || "")
  const [sectorValue, setSectorValue] = useState(sector || "")

  const rubrosNombreArray = [
    "todos",
    ...(rubros?.map(element => element.nombre) || []),
  ]

  const getSectoresFromRubro = () => {
    if (!rubroValue || !rubros) return []
    const selectedRubro = rubros.find(r => r.nombre === rubroValue)
    if (!selectedRubro || !selectedRubro.sectores) return []
    return selectedRubro.sectores.split(" ")
  }

  const sectoresDisponibles = ["todos", ...getSectoresFromRubro()]

  return (
    <>
      <div className="flex items-center justify-center gap-3">
        <Label htmlFor="rubro">Rubro</Label>
        <Select
          defaultValue="todos"
          value={rubroValue}
          onValueChange={value => {
            setRubroValue(value)
            setSectorValue("todos")
            onRubroChange(value === "todos" ? undefined : value)
          }}
        >
          <SelectTrigger
            className={`w-30 ${BG_RUBROS[rubroValue as keyof typeof BG_RUBROS] || "bg-background"}`}
          >
            <SelectValue placeholder={rubroValue || "todos"} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {rubrosNombreArray.map(rubro => (
                <SelectItem
                  key={rubro}
                  value={rubro}
                  className={BG_RUBROS[rubro as keyof typeof BG_RUBROS]}
                >
                  {rubro}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Label htmlFor="sector">Sector</Label>
        <Select
          defaultValue="todos"
          value={sectorValue}
          onValueChange={value => {
            setSectorValue(value)
            onSectorChange(value === "todos" ? undefined : value)
          }}
        >
          <SelectTrigger className="w-30 bg-background">
            <SelectValue placeholder={sectorValue || "todos"} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {sectoresDisponibles.map(sector => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </>
  )
}
