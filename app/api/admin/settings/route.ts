import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Forward request to your backend
    const response = await fetch(`${process.env.BACKEND_URL}/api/admin/settings`, {
      headers: {
        Authorization: request.headers.get("Authorization") || "",
      },
    })

    if (response.ok) {
      const settings = await response.json()
      return NextResponse.json(settings)
    } else {
      // Mock settings for demo
      const mockSettings = {
        siteName: "StyleHub",
        siteDescription: "Premium clothing store for modern fashion",
        contactEmail: "contact@stylehub.com",
        supportEmail: "support@stylehub.com",
        currency: "USD",
        timezone: "America/New_York",
        maintenanceMode: false,
        allowRegistrations: true,
        emailNotifications: true,
        orderNotifications: true,
        lowStockThreshold: 10,
        taxRate: 8.5,
        shippingRate: 9.99,
        freeShippingThreshold: 50,
      }
      return NextResponse.json(mockSettings)
    }
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Forward request to your backend
    const response = await fetch(`${process.env.BACKEND_URL}/api/admin/settings`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: request.headers.get("Authorization") || "",
      },
      body: JSON.stringify(body),
    })

    if (response.ok) {
      const updatedSettings = await response.json()
      return NextResponse.json(updatedSettings)
    } else {
      return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
