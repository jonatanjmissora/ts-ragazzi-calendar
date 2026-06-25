import { Suspense, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { rubrosQueryOptions } from "queries/rubros/rubros-query"
import { Filter, FunnelX } from "lucide-react"
import { Button } from "../ui/button"
import Periodo from "./periodo"
import { RubroSectorSelects } from "@/components/shared/rubro-sector-selects"

interface DashboardFilterProps {
	rubro?: string
	sector?: string
}

export default function DashboardFilter({
	rubro,
	sector,
}: DashboardFilterProps) {
	const [showFilter, setShowFilter] = useState(false)

	return (
		<div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-14">
			<div className=""></div>
			<Periodo />
			<div className="flex items-center gap-4 ">
				<Button
					variant="ghost"
					size="icon"
					onClick={() => setShowFilter(s => !s)}
					aria-label="Toggle filter"
				>
					{rubro || sector ? (
						<FunnelX className="size-5 text-amber-700" />
					) : (
						<Filter className="size-5" />
					)}
				</Button>
				{showFilter && (
					<Suspense fallback={<span>...</span>}>
						<FilterContent rubro={rubro} sector={sector} />
					</Suspense>
				)}
			</div>
		</div>
	)
}

function FilterContent({ rubro, sector }: DashboardFilterProps) {
	const navigate = useNavigate({ from: "/" })
	const { data: rubros } = useQuery(rubrosQueryOptions)

	return (
		<div className="flex items-center gap-10 flex-wrap">
			<RubroSectorSelects
				rubros={rubros}
				rubro={rubro}
				sector={sector}
				onRubroChange={value =>
					navigate({
						search: prev => ({ ...prev, rubro: value, sector: undefined }),
						replace: true,
					})
				}
				onSectorChange={value =>
					navigate({
						search: prev => ({ ...prev, sector: value }),
						replace: true,
					})
				}
			/>
		</div>
	)
}
