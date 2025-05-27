"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Trash2, Share2, Eye } from "lucide-react"
import Link from "next/link"
import { useWishlist } from "../context/wishlist-context"
import { useCart } from "../context/cart-context"
import { useAuth } from "../context/auth-context"

export default function WishlistPage() {
  const { state: wishlistState, removeFromWishlist, clearWishlist } = useWishlist()
  const { state: cartState, dispatch } = useCart()
  const { state: authState } = useAuth()
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set())

  const handleAddToCart = (item: any) => {
    // For wishlist items, we'll redirect to product page for size/color selection
    // since wishlist items might not have complete product data
    window.location.href = `/products/${item.id}`
  }

  const handleRemoveItem = async (itemId: string) => {
    setRemovingItems((prev) => new Set(prev).add(itemId))

    // Add a small delay for better UX
    setTimeout(() => {
      removeFromWishlist(itemId)
      setRemovingItems((prev) => {
        const newSet = new Set(prev)
        newSet.delete(itemId)
        return newSet
      })
    }, 300)
  }

  const handleShare = async (item: any) => {
    const shareData = {
      title: item.name,
      text: `Check out this ${item.name} on StyleHub!`,
      url: `${window.location.origin}/products/${item.id}`,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareData.url)
        alert("Product link copied to clipboard!")
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareData.url)
      alert("Product link copied to clipboard!")
    }
  }

  const handleClearWishlist = () => {
    if (confirm("Are you sure you want to clear your entire wishlist?")) {
      clearWishlist()
    }
  }

  // Show login prompt for non-authenticated users
  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600">Save items you love for later</p>
          </div>

          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Please log in to view your wishlist</h3>
              <p className="text-gray-600 mb-6">Create an account or sign in to save your favorite items</p>
              <div className="flex gap-4 justify-center">
                <Link href="/auth/login">
                  <Button>Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button variant="outline">Create Account</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Empty wishlist state
  if (wishlistState.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600">Save items you love for later</p>
          </div>

          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
              <p className="text-gray-600 mb-6">Start adding items you love to your wishlist</p>
              <Link href="/products">
                <Button>Browse Products</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600">
              {wishlistState.items.length} {wishlistState.items.length === 1 ? "item" : "items"} saved
            </p>
          </div>

          {wishlistState.items.length > 0 && (
            <div className="mt-4 sm:mt-0 flex gap-3">
              <Button
                variant="outline"
                onClick={handleClearWishlist}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistState.items.map((item) => (
            <Card
              key={item.id}
              className={`group hover:shadow-lg transition-all duration-300 ${
                removingItems.has(item.id) ? "opacity-50 scale-95" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="relative">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 mb-4">
                    <img
                      src={item.image || "/placeholder.svg?height=200&width=200"}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Action Buttons Overlay */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-white/90 hover:bg-white shadow-sm"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={removingItems.has(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-white/90 hover:bg-white shadow-sm"
                        onClick={() => handleShare(item)}
                      >
                        <Share2 className="h-4 w-4 text-gray-600" />
                      </Button>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="capitalize">
                        {item.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => handleAddToCart(item)} className="flex-1" size="sm">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Select Options
                    </Button>
                    <Link href={`/products/${item.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="mt-12 text-center">
          <Link href="/products">
            <Button variant="outline" size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
