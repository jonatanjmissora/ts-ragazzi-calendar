import { useQuery } from "@tanstack/react-query"
import { rubrosQueryOptions } from "queries/rubros/rubros-query"
import PagosFilterPeriodo from "./pagos-filter-periodo"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { RubroSectorSelects } from "@/components/shared/rubro-sector-selects"

export default function PagosFilter() {
	const { rubro, sector } = useSearch({ from: "/admin/pagos/" })
	const navigate = useNavigate({ from: "/admin/pagos/" })
	const { data: rubros } = useQuery(rubrosQueryOptions)

	return (
		<article className="flex items-center flex-col 2xl:flex-row gap-10 2xl:gap-14">
			<PagosFilterPeriodo />

			<div className="flex flex-col sm:flex-row items-center sm:gap-14 gap-4">
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
		</article>
	)
}
