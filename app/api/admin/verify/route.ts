import { type NextRequest, NextResponse } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Forward the request to your backend for verification
    const response = await fetch(`${process.env.BACKEND_URL}/api/auth/verify`, {
      headers: {
        Authorization: authHeader,
      },
    })

    if (response.ok) {
      const userData = await response.json()

      // Check if user is admin
      if (userData.role !== "admin") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }

      return NextResponse.json(userData)
    } else {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
