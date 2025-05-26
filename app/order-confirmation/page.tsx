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

  const orderNumber = "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase()

  useEffect(() => {
    if (paymentIntentId) {
      // In a real app, you'd fetch payment details from your backend
      // For demo purposes, we'll simulate the payment details
      setTimeout(() => {
        setPaymentDetails({
          id: paymentIntentId,
          amount: 12999, // Amount in cents
          currency: "usd",
          status: "succeeded",
        })
        setLoading(false)
      }, 1000)
    } else {
      setLoading(false)
    }
  }, [paymentIntentId])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Confirming your order...</p>
        </div>
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

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Order Number</h3>
              <p className="text-gray-600">{orderNumber}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Order Date</h3>
              <p className="text-gray-600">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Estimated Delivery</h3>
              <p className="text-gray-600">{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
            </div>
            {paymentDetails && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Payment</h3>
                <p className="text-gray-600">
                  ${(paymentDetails.amount / 100).toFixed(2)} {paymentDetails.currency.toUpperCase()}
                </p>
                <p className="text-sm text-green-600">✓ Payment confirmed</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {paymentDetails && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Payment Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Transaction ID</h3>
                <p className="text-gray-600 font-mono text-sm">{paymentDetails.id}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Payment Status</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {paymentDetails.status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <Mail className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Confirmation Email</h3>
            <p className="text-sm text-gray-600">Receipt sent to your email</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Package className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Processing</h3>
            <p className="text-sm text-gray-600">Your order is being prepared</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Truck className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold mb-1">Shipping</h3>
            <p className="text-sm text-gray-600">Free shipping included</p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center space-y-4">
        <p className="text-gray-600">
          We'll send you shipping confirmation and tracking information once your order ships.
        </p>
        <div className="space-x-4">
          <Link href="/products">
            <Button size="lg">Continue Shopping</Button>
          </Link>
          <Link href="/account/orders">
            <Button variant="outline" size="lg">
              View Order Status
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
