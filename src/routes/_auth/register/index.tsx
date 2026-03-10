import { createFileRoute } from "@tanstack/react-router"
import { RegisterForm } from "@/components/register-form"
import SectionContainer from "@/components/layout/section-container"

export const Route = createFileRoute("/_auth/register/")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<SectionContainer>
			<RegisterForm />
		</SectionContainer>
	)
}
