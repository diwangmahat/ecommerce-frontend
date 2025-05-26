import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/api/orders`, {
      headers: {
        Authorization: request.headers.get("Authorization") || "",
      },
    })

    if (response.ok) {
      const orders = await response.json()
      const recentOrders = orders.slice(0, 5)
      return NextResponse.json(recentOrders)
    } else {
      // Mock data
      const recentOrders = [
        {
          id: "ORD-001",
          customer: "John Doe",
          amount: 129.99,
          status: "completed",
          date: "2024-01-15",
        },
        {
          id: "ORD-002",
          customer: "Jane Smith",
          amount: 89.5,
          status: "processing",
          date: "2024-01-15",
        },
        {
          id: "ORD-003",
          customer: "Mike Johnson",
          amount: 199.99,
          status: "shipped",
          date: "2024-01-14",
        },
      ]
      return NextResponse.json(recentOrders)
    }
  } catch (error) {
    console.error("Error fetching recent orders:", error)
    return NextResponse.json({ error: "Failed to fetch recent orders" }, { status: 500 })
  }
}
