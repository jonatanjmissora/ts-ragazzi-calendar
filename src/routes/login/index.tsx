import { LoginForm } from "@/components/login-form"
import { createFileRoute } from "@tanstack/react-router"
import SectionContainer from "@/components/layout/section-container"

export const Route = createFileRoute("/login/")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<SectionContainer>
			<LoginForm />
		</SectionContainer>
	)
}
