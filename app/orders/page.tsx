"use client"

import { useEffect, useState } from "react"
import { useAuth } from "../context/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Package, Calendar, CreditCard, Truck, CheckCircle, Clock, XCircle } from "lucide-react"
import Link from "next/link"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  size?: string
  color?: string
  image: string
}

interface Order {
  id: string
  orderNumber: string
  date: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  total: number
  items: OrderItem[]
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  paymentMethod: string
  trackingNumber?: string
}

const statusConfig = {
  pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock, label: "Pending" },
  processing: { color: "bg-blue-100 text-blue-800", icon: Package, label: "Processing" },
  shipped: { color: "bg-purple-100 text-purple-800", icon: Truck, label: "Shipped" },
  delivered: { color: "bg-green-100 text-green-800", icon: CheckCircle, label: "Delivered" },
  cancelled: { color: "bg-red-100 text-red-800", icon: XCircle, label: "Cancelled" },
}

export default function MyOrdersPage() {
  const { state: authState } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authState.isAuthenticated) {
      fetchOrders()
    }
  }, [authState.isAuthenticated])

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/orders`,
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your orders</h1>
          <Link href="/auth/login">
            <Button>Log In</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-2">Track and manage your orders</p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
              <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
              <Link href="/products">
                <Button>Browse Products</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const StatusIcon = statusConfig[order.status].icon
              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(order.date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <CreditCard className="h-4 w-4" />
                            {order.paymentMethod}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={statusConfig[order.status].color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[order.status].label}
                        </Badge>
                        <div className="text-right">
                          <div className="font-semibold">{formatPrice(order.total)}</div>
                          <div className="text-sm text-gray-600">{order.items.length} items</div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div key={item.id}>
                          <div className="flex gap-4">
                            <img
                              src={item.image || "/placeholder.svg?height=64&width=64"}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <div className="text-sm text-gray-600 mt-1">
                                {item.size && <span>Size: {item.size}</span>}
                                {item.size && item.color && <span className="mx-2">•</span>}
                                {item.color && <span>Color: {item.color}</span>}
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                                <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                              </div>
                            </div>
                          </div>
                          {index < order.items.length - 1 && <Separator className="mt-4" />}
                        </div>
                      ))}
                    </div>

                    <Separator className="my-6" />

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2">Shipping Address</h4>
                        <div className="text-sm text-gray-600">
                          <p>{order.shippingAddress.street}</p>
                          <p>
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                          </p>
                          <p>{order.shippingAddress.country}</p>
                        </div>
                      </div>

                      {order.trackingNumber && (
                        <div>
                          <h4 className="font-medium mb-2">Tracking Information</h4>
                          <div className="text-sm">
                            <p className="text-gray-600">Tracking Number:</p>
                            <p className="font-mono">{order.trackingNumber}</p>
                            <Button variant="outline" size="sm" className="mt-2">
                              <Truck className="h-4 w-4 mr-2" />
                              Track Package
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t">
                      <Button variant="outline" className="flex-1">
                        View Details
                      </Button>
                      {order.status === "delivered" && (
                        <Button variant="outline" className="flex-1">
                          Reorder Items
                        </Button>
                      )}
                      {(order.status === "pending" || order.status === "processing") && (
                        <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700">
                          Cancel Order
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
