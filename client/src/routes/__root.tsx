import { Outlet, createRootRoute } from '@tanstack/react-router'
import { Navbar } from '@/components/navbar'

const user = {
  name: 'Atiksh Gupta',
  username : "atikx",
  email: "atikx@example.com",
  avatar: 'https://avatars.githubusercontent.com/u/100670938?v=4',

}

export const Route = createRootRoute({
  component: () => (
    <>
      <Navbar   />
      <Outlet />
    </>
  ),
})
