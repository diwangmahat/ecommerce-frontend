"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCart, type Product } from "../../context/cart-context"
import { useWishlist } from "../../context/wishlist-context"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

        if (!res.ok) {
          throw new Error(`Failed to fetch product: ${res.status}`)
        }

        const data = await res.json()

        const normalizedProduct: Product = {
          ...data,
          size: Array.isArray(data.size) ? data.size : [],
          color: Array.isArray(data.color) ? data.color : [],
        }

        setProduct(normalizedProduct)
        if (normalizedProduct.size.length > 0) setSelectedSize(normalizedProduct.size[0])
        if (normalizedProduct.color.length > 0) setSelectedColor(normalizedProduct.color[0])
      } catch (err) {
        console.error("Failed to fetch product:", err)
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
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
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Product not found</p>
          <Button onClick={() => router.push("/products")} className="mt-4">
            Browse Products
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={Array.isArray(product.image) ? product.image[0] : (product.image || "/placeholder.svg?height=600&width=600")}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {Array.isArray(product.image) ? (
              product.image.map((img, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer hover:opacity-75 transition-opacity">
                  <Image src={img} alt={`${product.name} view ${i + 1}`} fill className="object-cover" />
                </div>
              ))
            ) : (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                  <Image src={product.image || "/placeholder.svg"} alt={`placeholder ${i}`} fill className="object-cover" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-2xl font-bold text-gray-900 mt-2">${product.price}</p>
            <p className="text-sm text-gray-500 capitalize mt-1">{product.category}</p>
          </div>

          <div className="space-y-4">
            {/* Size */}
            {Array.isArray(product.size) && product.size.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.size.map((size) => (
                      <SelectItem key={size} value={size}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Color */}
            {Array.isArray(product.color) && product.color.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.color.map((color) => (
                      <SelectItem key={color} value={color}>{color}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
           {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

          <div className="flex items-center space-x-4">
            <Button onClick={handleAddToCart}>Add to Cart</Button>
            <Button onClick={handleBuyNow} variant="outline">Buy Now</Button>
            <Button variant="ghost" onClick={handleWishlistToggle} size="icon">
              <Heart className={`w-5 h-5 ${isProductInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
            </Button>
            <Button variant="ghost" onClick={handleShare} size="icon">
              <Share2 className="w-5 h-5 text-gray-500" />
            </Button>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4" />
              <span>Free shipping on orders over $50</span>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4" />
              <span>30-day return policy</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Secure payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
