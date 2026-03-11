import SectionContainer from "@/components/layout/section-container"
import PagosList from "@/components/pagos/pagos-list"
import { createFileRoute, Link } from "@tanstack/react-router"

export const Route = createFileRoute("/admin/")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<SectionContainer>
			<div className="flex gap-4">
				<Link
					className="border px-2 py-1 rounded-lg bg-accent"
					to="/admin/create-pago"
				>
					Crear Pago
				</Link>
				<Link
					className="border px-2 py-1 rounded-lg bg-accent"
					to="/admin/create-rubro"
				>
					Crear Rubro
				</Link>
			</div>
			<PagosList />
		</SectionContainer>
	)
}
