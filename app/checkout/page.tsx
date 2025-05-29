"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


export default function CheckoutPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    address: "",
    cardNumber: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()

    // Simulate payment success delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // You could generate a fake paymentIntent ID for confirmation page
    const fakePaymentIntentId = "pi_" + Math.random().toString(36).substring(2)

    // Redirect to order-confirmation page with simulated Stripe ID
    router.push(`/order-confirmation?payment_intent=${fakePaymentIntentId}`)
  }

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCheckout} className="space-y-6">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="address">Shipping Address</Label>
              <Input
                id="address"
                name="address"
                value={form.address}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                name="cardNumber"
                value={form.cardNumber}
                onChange={handleInputChange}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Pay & Place Order
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}