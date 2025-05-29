"use client"

import { useState } from "react"
import { PaymentElement, AddressElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Lock, CreditCard } from "lucide-react"

interface PaymentFormProps {
  amount: number
  onSuccess: (paymentIntentId: string) => void
  onError: (error: string) => void
  clientSecret: string
  isDemoMode: boolean
}

export default function PaymentForm({ amount, onSuccess, onError, clientSecret, isDemoMode }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string>("")
  const [isComplete, setIsComplete] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      const errorMsg = "Stripe has not loaded correctly."
      setMessage(errorMsg)
      onError(errorMsg)
      return
    }

    setIsLoading(true)
    setMessage("")

    if (isDemoMode) {
      // Simulate successful payment in demo mode
      setTimeout(() => {
        const mockPaymentIntentId = "pi_mock_" + Math.random().toString(36).substr(2, 9)
        setMessage("Payment succeeded (demo mode)!")
        onSuccess(mockPaymentIntentId)
        setIsLoading(false)
      }, 1000)
      return
    }

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order-confirmation`, // For 3D Secure redirects
        },
        redirect: "if_required",
      })

      if (error) {
        const errorMsg = error.message || "An error occurred during payment."
        setMessage(errorMsg)
        onError(errorMsg)
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        setMessage("Payment succeeded!")
        onSuccess(paymentIntent.id)
      } else {
        const errorMsg = "Payment status unknown."
        setMessage(errorMsg)
        onError(errorMsg)
      }
    } catch (err) {
      const errorMsg = "An unexpected error occurred during payment processing."
      setMessage(errorMsg)
      onError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentElementChange = (event: any) => {
    setIsComplete(event.complete)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment Information</span>
            <Lock className="h-4 w-4 text-green-600" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PaymentElement
            onChange={handlePaymentElementChange}
            options={{
              layout: "tabs",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing Address</CardTitle>
        </CardHeader>
        <CardContent>
          <AddressElement
            options={{
              mode: "billing",
              allowedCountries: ["US", "CA", "GB"],
            }}
          />
        </CardContent>
      </Card>

      {message && (
        <Alert className={message.includes("succeeded") ? "border-green-500" : "border-red-500"}>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={isLoading || !stripe || !elements || !isComplete || isDemoMode}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Your payment information is secure and encrypted with industry-standard SSL
      </p>
    </form>
  )
}