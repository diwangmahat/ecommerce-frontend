import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Use your actual backend endpoint
    const response = await fetch(`${process.env.BACKEND_URL}/api/admin/stats`, {
      headers: {
        Authorization: request.headers.get("Authorization") || "",
      },
    })

    if (response.ok) {
      const stats = await response.json()
      return NextResponse.json(stats)
    } else {
      // Mock data fallback
      const stats = {
        totalRevenue: 45231.89,
        totalOrders: 1234,
        totalUsers: 5678,
        totalProducts: 89,
        revenueChange: 12.5,
        ordersChange: 8.2,
        usersChange: 15.3,
        productsChange: -2.1,
      }
      return NextResponse.json(stats)
    }
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
