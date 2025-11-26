import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/navbar'



export const Route = createRootRoute({
  component: () => (
    <>
      <Navbar   />
      <Outlet />
    </>
  ),
})
