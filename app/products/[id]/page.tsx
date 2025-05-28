"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCart, type Product } from "../../context/cart-context"
import { useWishlist } from "../../context/wishlist-context"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Share2, Truck, RotateCcw, Shield } from "lucide-react"

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { dispatch } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const router = useRouter()

  const isProductInWishlist = product ? isInWishlist(product.id) : false

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        setError(null)
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://ecommerce-backend-340r.onrender.com"
        const res = await fetch(`${apiUrl}/api/products/${params.id}`)

        if (!res.ok) throw new Error(`Failed to fetch product: ${res.status}`)

        const data = await res.json()
        setProduct(data)
      } catch (err) {
        console.error("Error fetching product:", err)
        setError("Failed to load product. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  const handleAddToCart = () => {
    if (!product || !selectedSize || !selectedColor) {
      alert("Please select size and color")
      return
    }

    dispatch({
      type: "ADD_ITEM",
      payload: {
        ...product,
        quantity,
        selectedSize,
        selectedColor,
      },
    })

    alert("Added to cart!")
  }

  const handleBuyNow = () => {
    if (!product || !selectedSize || !selectedColor) {
      alert("Please select size and color")
      return
    }

    dispatch({
      type: "ADD_ITEM",
      payload: {
        ...product,
        quantity,
        selectedSize,
        selectedColor,
      },
    })

    router.push("/checkout")
  }

  const handleWishlistToggle = () => {
    if (!product) return

    if (isProductInWishlist) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
      })
    }
  }

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Product link copied to clipboard!")
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Product not found</p>
        <Button onClick={() => router.push("/products")} className="mt-4">
          Browse Products
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={product.image || "/placeholder.svg?height=600&width=600"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer hover:opacity-75 transition-opacity"
              >
                <Image
                  src={product.image || `/placeholder.svg?height=150&width=150`}
                  alt={`${product.name} view ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-2xl font-bold text-gray-900 mt-2">${product.price}</p>
            <p className="text-sm text-gray-500 capitalize mt-1">{product.category}</p>
          </div>

          <div className="space-y-4">
            {/* Size */}
            {product.sizes?.length ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {/* Color */}
            {product.colors?.length ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.colors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <Select value={quantity.toString()} onValueChange={(value) => setQuantity(Number(value))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(10)].map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={handleBuyNow} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3" size="lg">
              Buy Now
            </Button>
            <Button onClick={handleAddToCart} variant="outline" className="w-full py-3" size="lg">
              Add to Cart
            </Button>
          </div>

          <div className="flex space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center space-x-2 ${
                isProductInWishlist ? "text-red-600 hover:text-red-700" : "text-gray-600 hover:text-gray-700"
              }`}
              onClick={handleWishlistToggle}
            >
              <Heart className={`h-4 w-4 ${isProductInWishlist ? "fill-current" : ""}`} />
              <span>{isProductInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center space-x-2" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">Product Details</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center space-x-3">
              <Truck className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center space-x-3">
              <RotateCcw className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600">30-day return policy</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-purple-600" />
              <span className="text-sm text-gray-600">2-year warranty included</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
