export default function SectionContainer({
	children,
	className,
}: {
	children: React.ReactNode
	className?: string
}) {
	return (
		<section
			className={`w-full h-full flex-1 [view-transition-name:section-container] flex flex-col justify-center ${className || ""}`}
		>
			{children}
		</section>
	)
}
