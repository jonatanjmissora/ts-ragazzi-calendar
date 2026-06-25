import { Outlet } from "@tanstack/react-router"
import SectionContainer from "../layout/section-container"
import { Aside } from "../layout/aside"

export function AppLayout({ asideContent }: { asideContent: React.ReactNode }) {
  return (
    <div className="flex-1">
      <SectionContainer>
        <div className="w-full flex flex-col sm:flex-row">
          <Aside>{asideContent}</Aside>
          <article className="w-full sm:w-[80dvw] py-20">
            <Outlet />
          </article>
        </div>
      </SectionContainer>
    </div>
  )
}
