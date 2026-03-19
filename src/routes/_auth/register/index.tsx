import { createFileRoute } from "@tanstack/react-router"
import { RegisterForm } from "@/components/register-form"
import SectionContainer from "@/components/layout/section-container"
import AuthHeader from "@/components/auth-header"

export const Route = createFileRoute("/_auth/register/")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<SectionContainer className="gap-20 sm:gap-40">
			<AuthHeader />
			<RegisterForm />
		</SectionContainer>
	)
}
