import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  //apiVersion: "2025-04-30",
})

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId } = await request.json()

    // Retrieve the payment intent to check its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status === "succeeded") {
      // Here you would typically:
      // 1. Save the order to your database
      // 2. Send confirmation email
      // 3. Update inventory
      // 4. Create shipping label, etc.

      return NextResponse.json({
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
      })
    } else {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error confirming payment:", error)
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 })
  }
}
