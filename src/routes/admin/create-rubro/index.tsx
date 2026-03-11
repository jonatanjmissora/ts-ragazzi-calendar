import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/create-rubro/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/create-rubro/"!</div>
}
