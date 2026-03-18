import { Navigate, Outlet, redirect } from "react-router"
import { useAuthContext } from "app/provider/AuthProvider"
import type { Route } from "../+types/root"

// export async function loader({ request }: Route.LoaderArgs) {
//   const cookie = request.headers.get("cookie") ?? ""
//   if (!cookie.includes("isAuth=true")) {
//     throw redirect("/login")
//   }
//   return null
// }

export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthContext()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <Outlet />
}
