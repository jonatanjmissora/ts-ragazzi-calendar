import { createFileRoute } from "@tanstack/react-router"
import SectionContainer from "@/components/layout/section-container"

export const Route = createFileRoute("/_protected/")({
	component: App,
})

function App() {
	return (
		<div className="flex-1">
			<SectionContainer>HOME</SectionContainer>
		</div>
	)
}
