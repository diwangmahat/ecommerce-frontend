"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Package, Truck, Mail, CreditCard, Loader2 } from "lucide-react"
import StripeProvider from "@/components/stripe-provider"
import PaymentForm from "@/components/payment-form"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"

interface PaymentDetails {
  id: string
  amount: number
  currency: string
  status: string
  client_secret: string
  mock?: boolean
}

export default function OrderConfirmationPage() {
  const { state: { token, user } } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentIntentId = searchParams.get("payment_intent")
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [orderDetails, setOrderDetails] = useState<any>(null)

  const orderNumber = "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase()

  useEffect(() => {
    if (!token || !user) {
      router.push(`/login?redirect=${encodeURIComponent("/order-confirmation?payment_intent=" + (paymentIntentId || ""))}`)
      setLoading(false)
      return
    }

    if (paymentIntentId) {
      const fetchPaymentDetails = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/payment-intents/${paymentIntentId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          if (!response.ok) {
            throw new Error("Failed to fetch payment details")
          }
          const data = await response.json()
          setPaymentDetails({
            id: data.id,
            amount: data.amount,
            currency: data.currency,
            status: data.status,
            client_secret: data.client_secret,
            mock: data.mock || false,
          })

          // Fetch order details (if already created)
          const orderResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders?paymentIntentId=${paymentIntentId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          )
          if (orderResponse.ok) {
            const orderData = await orderResponse.json()
            setOrderDetails(orderData)
          }
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : "Failed to load payment details."
          setError(errorMsg)
          console.error("Error fetching payment details:", err)
        } finally {
          setLoading(false)
        }
      }
      fetchPaymentDetails()
    } else {
      setError("No payment intent provided.")
      setLoading(false)
    }
  }, [paymentIntentId, token, user, router])

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    if (paymentDetails?.mock) {
      setPaymentDetails((prev) => (prev ? { ...prev, status: "succeeded" } : prev))
      setOrderDetails({ orderId: "MOCK-" + orderNumber, mock: true })
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/confirm-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentIntentId }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Payment confirmation failed")
      }
      const data = await response.json()
      setPaymentDetails((prev) => (prev ? { ...prev, status: "succeeded" } : prev))
      setOrderDetails(data)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Payment processed but order creation failed. Please contact support."
      setError(errorMsg)
      console.error("Error confirming payment:", err)
    }
  }

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage)
  }

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

  if (!token || !user) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Order Confirmation</h1>

      {error && (
        <Alert className="mb-6 border-red-500">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {paymentDetails?.mock && (
        <Alert className="mb-6 border-yellow-500 bg-yellow-50">
          <AlertDescription className="text-yellow-800">
            <strong>Demo Mode:</strong> Stripe keys are not configured. This checkout is running in demonstration mode.
          </AlertDescription>
        </Alert>
      )}

      {paymentDetails?.status !== "succeeded" && paymentDetails?.client_secret ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Complete Your Payment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StripeProvider clientSecret={paymentDetails.client_secret}>
              <PaymentForm
                amount={paymentDetails.amount / 100}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                clientSecret={paymentDetails.client_secret}
                isDemoMode={paymentDetails.mock || false}
              />
            </StripeProvider>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your order has been confirmed and is being processed.
          </p>
        </div>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Order Number</h3>
              <p className="text-gray-600">{orderDetails?.orderId || orderNumber}</p>
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
                <p className={`text-sm ${paymentDetails.status === "succeeded" ? "text-green-500" : "text-yellow-600"}`}>
                  {paymentDetails.status === "succeeded" ? "✓ Payment Confirmed" : "Payment Pending"}
                </p>
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
                <h3 className="font-semibold text-gray-900 mb-0">Payment Status</h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    paymentDetails.status === "succeeded"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {paymentDetails.status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {orderDetails?.orderItems && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            {orderDetails.orderItems.map((item: any) => (
              <div key={item.id} className="flex justify-between mb-2">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    {item.size} | {item.color} | Qty: {item.quantity}
                  </p>
                </div>
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
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
          <Link href="/orders">
            <Button variant="outline" size="lg">View Order Status</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}