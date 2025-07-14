import { isAuthenticated } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminDashboardClient from "./client"

export default async function Page() {
  const authenticated = await isAuthenticated()

  if (!authenticated) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto p-4">
      <AdminDashboardClient />
    </div>
  )
}
