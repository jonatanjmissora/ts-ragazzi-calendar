export default function SectionContainer({
	children,
	className,
}: {
	children: React.ReactNode
	className?: string
}) {
	return (
		<section
			className={`w-[90%] sm:w-screen flex-1 [view-transition-name:section-container] flex flex-col gap-6 ${className || ""}`}
		>
			{children}
		</section>
	)
}
