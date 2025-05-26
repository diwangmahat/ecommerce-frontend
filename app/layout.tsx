import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "./context/auth-context"
import { WishlistProvider } from "./context/wishlist-context"
import { CartProvider } from "./context/cart-context"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

export const metadata: Metadata = {
  title: "StyleHub",
  description: "ecommerce website",

}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <div className="min-h-screen flex flex-col">
                <Navigation />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
