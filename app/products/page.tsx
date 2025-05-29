"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import type { Product } from "../context/cart-context"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedGender, setSelectedGender] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  
  const searchParams = useSearchParams()

  useEffect(() => {
    async function fetchProducts() {
      try {
        // Build query string based on URL parameters
        const params = new URLSearchParams()
        
        const gender = searchParams.get('gender')
        const category = searchParams.get('category')
        
        if (gender) {
          params.append('gender', gender)
          setSelectedGender(gender)
        }
        
        if (category) {
          params.append('category', category)
          setSelectedCategory(category)
        }

        const queryString = params.toString()
        const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products${queryString ? `?${queryString}` : ''}`
        
        const res = await fetch(url)
        const data = await res.json()

        const productList: Product[] = Array.isArray(data)
          ? data
          : Array.isArray(data.products)
          ? data.products
          : []

        setProducts(productList)
        setFilteredProducts(productList)

        const uniqueCategories = Array.from(
          new Set(productList.map((p: Product) => p.category))
        ).filter(Boolean) as string[]

        setCategories(uniqueCategories)
      } catch (err) {
        console.error("Failed to fetch products:", err)
      }
    }

    fetchProducts()
  }, [searchParams])

  useEffect(() => {
    let filtered = [...products]

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p: Product) => p.category === selectedCategory)
    }

    // Apply gender filter
    if (selectedGender !== "all") {
      filtered = filtered.filter((p: Product) => p.gender === selectedGender)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price
      if (sortBy === "price-high") return b.price - a.price
      return a.name.localeCompare(b.name)
    })

    setFilteredProducts(filtered)
  }, [products, selectedCategory, selectedGender, sortBy])

  const getPageTitle = () => {
    const gender = searchParams.get('gender')
    if (gender === 'Men') return "Men's Products"
    if (gender === 'Women') return "Women's Products"
    return "All Products"
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{getPageTitle()}</h1>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-4">
            {/* Gender Filter */}
            <Select value={selectedGender} onValueChange={setSelectedGender}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                <SelectItem value="Men">Men</SelectItem>
                <SelectItem value="Women">Women</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort Filter */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="group">
            <Link href={`/products/${product.id}`}>
              <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square mb-4">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                  {product.gender && (
                    <p className="text-xs text-gray-400 uppercase">{product.gender}</p>
                  )}
                </div>
                <p className="text-xl font-bold text-gray-900">${product.price}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}