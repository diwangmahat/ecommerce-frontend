"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Package, Truck, Mail, CreditCard } from "lucide-react"

interface PaymentDetails {
  id: string
  amount: number
  currency: string
  status: string
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const paymentIntentId = searchParams.get("payment_intent")
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [orderCreated, setOrderCreated] = useState(false)

  const orderNumber = "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase()

  useEffect(() => {
    const createOrder = async () => {
      if (!paymentIntentId) return

      try {
        // Simulate payment info (replace with actual Stripe fetch logic if needed)
        const simulatedPayment = {
          id: paymentIntentId,
          amount: 12999,
          currency: "usd",
          status: "succeeded"
        }

        setPaymentDetails(simulatedPayment)

        // Get cart and auth info
        const storedCart = localStorage.getItem("cart")
        const cartItems = storedCart ? JSON.parse(storedCart) : []
        const token = localStorage.getItem("token")

        const orderPayload = {
          orderItems: cartItems,
          shippingAddress: {
            address: "123 Main St",
            city: "NYC",
            postalCode: "10001",
            country: "USA"
          },
          paymentMethod: "Stripe",
          itemsPrice: 119.99,
          taxPrice: 10.00,
          shippingPrice: 0.00,
          totalPrice: 129.99
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(orderPayload)
        })

        if (!res.ok) {
          throw new Error("Failed to create order")
        }

        setOrderCreated(true)
        localStorage.removeItem("cart")
      } catch (err) {
        console.error("Error creating order:", err)
      } finally {
        setLoading(false)
      }
    }

    createOrder()
  }, [paymentIntentId])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4" />
        <p className="text-lg text-gray-600">Confirming your order...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-lg text-gray-600">
          Thank you for your purchase. Your order has been confirmed and is being processed.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-gray-500" />
              <span>Order Number:</span>
              <strong>{orderNumber}</strong>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-gray-500" />
              <span>Shipping:</span>
              <strong>Standard Delivery</strong>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-gray-500" />
              <span>Email:</span>
              <strong>you@example.com</strong>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-gray-500" />
              <span>Payment Method:</span>
              <strong>Credit Card (Stripe)</strong>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Subtotal:</span>
              <span>$119.99</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Tax:</span>
              <span>$10.00</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping:</span>
              <span>$0.00</span>
            </div>
            <div className="flex items-center justify-between font-bold text-lg">
              <span>Total:</span>
              <span>$129.99</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Link href="/products">
          <Button>Continue Shopping</Button>
        </Link>
      </div>
    </div>
  )
}
