import { LoginForm } from "@/components/login-form"
import { createFileRoute } from "@tanstack/react-router"
import SectionContainer from "@/components/layout/section-container"
import AuthHeader from "@/components/auth-header"

export const Route = createFileRoute("/_auth/login/")({
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<SectionContainer className="gap-20 sm:gap-40">
			<AuthHeader />
			<LoginForm />
		</SectionContainer>
	)
}
