"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"

export default function CheckoutPage() {
  const { state: { token, user, isAuthenticated } } = useAuth()
  const { state: cartState, dispatch } = useCart()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [contactInfo, setContactInfo] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  })

  // Redirect to /auth/login if not authenticated with debugging
  useEffect(() => {
    console.log("useEffect triggered:", { isAuthenticated, token, user })
    if (!isAuthenticated || token === null || user === null) {
      console.log("Redirecting to /auth/login?redirect=/checkout")
      router.push("/auth/login?redirect=/checkout") // Removed 'as const'
    } else {
      console.log("User authenticated, setting contact info")
      setContactInfo((prev) => ({
        ...prev,
        email: user.email || prev.email,
        firstName: user.name?.split(" ")[0] || prev.firstName,
        lastName: user.name?.split(" ").slice(1).join(" ") || prev.lastName,
      }))
    }
  }, [isAuthenticated, token, user, router])

  const subtotal = cartState.total
  const shipping = subtotal > 50 ? 0 : 9.99
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!isAuthenticated || token === null || user === null) {
      setError("Please log in to proceed with checkout.")
      setIsLoading(false)
      router.push("/auth/login?redirect=/checkout") // Removed 'as const'
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payment/create-payment-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          currency: "usd",
          metadata: {
            customerEmail: contactInfo.email,
            customerName: `${contactInfo.firstName} ${contactInfo.lastName}`.trim(),
            orderItems: JSON.stringify(
              cartState.items.map((item) => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                size: item.selectedSize,
                color: item.selectedColor,
                image: item.image || "",
              })),
            ),
            userId: user.id,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create payment intent")
      }

      const data = await response.json()
      if (data.clientSecret && data.paymentIntentId) {
        dispatch({ type: "CLEAR_CART" })
        router.push(`/order-confirmation?payment_intent=${data.paymentIntentId}`) // Removed 'as const'
      } else {
        throw new Error("No client secret or payment intent ID returned")
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to initialize order. Please try again."
      setError(errorMsg)
      console.error("Error creating payment intent:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated || token === null || user === null) {
    return null
  }

  if (cartState.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">Add some items to your cart before checking out.</p>
          <Button onClick={() => router.push("/products")} size="lg"> {/* Removed 'as const' */}
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {error && (
        <Alert className="mb-6 border-red-500">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <form onSubmit={handleContactSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo((prev) => ({ ...prev, email: e.target.value }))}
                    required
                    placeholder="your@email.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={contactInfo.firstName}
                      onChange={(e) => setContactInfo((prev) => ({ ...prev, firstName: e.target.value }))}
                      required
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={contactInfo.lastName}
                      onChange={(e) => setContactInfo((prev) => ({ ...prev, lastName: e.target.value }))}
                      required
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </CardContent>
            </Card>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Place Order"
              )}
            </Button>
          </form>
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {cartState.items.map((item) => (
                  <div
                    key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                    className="flex justify-between items-center"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.selectedSize} | {item.selectedColor} | Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}