export default function SectionContainer({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<section className="w-[90%] 2xl:w-[80%] mx-auto my-14 sm:my-3 2xl:my-32 flex-1 [view-transition-name:section-container] flex flex-col gap-6">
			{children}
		</section>
	)
}
