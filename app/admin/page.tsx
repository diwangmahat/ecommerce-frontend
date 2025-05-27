"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown } from "lucide-react"
import BackendStatus from "./components/backend-status"

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalUsers: number
  totalProducts: number
  revenueChange: number
  ordersChange: number
  usersChange: number
  productsChange: number
}

interface RecentOrder {
  id: string
  customer: string
  amount: number
  status: string
  date: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    revenueChange: 0,
    ordersChange: 0,
    usersChange: 0,
    productsChange: 0,
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, ordersResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/stats`),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/recent-orders`),
        ])

        if (statsResponse.ok && ordersResponse.ok) {
          const statsData = await statsResponse.json()
          const ordersData = await ordersResponse.json()
          setStats(statsData)
          setRecentOrders(ordersData)
        } else {
          // Mock data for demo
          setStats({
            totalRevenue: 45231.89,
            totalOrders: 1234,
            totalUsers: 5678,
            totalProducts: 89,
            revenueChange: 12.5,
            ordersChange: 8.2,
            usersChange: 15.3,
            productsChange: -2.1,
          })
          setRecentOrders([
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
          ])
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: stats.revenueChange,
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      change: stats.ordersChange,
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: stats.usersChange,
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      change: stats.productsChange,
      icon: Package,
      color: "text-orange-600",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.change > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm ${stat.change > 0 ? "text-green-600" : "text-red-600"}`}>
                      {stat.change > 0 ? "+" : ""}
                      {stat.change}%
                    </span>
                  </div>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Backend Status */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <BackendStatus />
        </div>
        <div className="lg:col-span-3">{/* Recent Orders card content */}</div>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-gray-600">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">${order.amount}</p>
                  <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
