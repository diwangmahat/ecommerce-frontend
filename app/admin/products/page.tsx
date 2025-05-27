"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Search } from "lucide-react"

interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  brand: string
  image: string
  countInStock: number
  rating: number
  numReviews: number
  featured: boolean
  createdAt: string
  updatedAt: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: 0,
    category: "",
    brand: "",
    image: "",
    countInStock: 0,
    featured: false,
  })

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products`)
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        const data = await res.json()
        if (Array.isArray(data)) {
          setProducts(data)
        }
      } catch (error) {
        console.error("Fetch error:", error)
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddProduct = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      })
      const created = await res.json()
      setProducts((prev) => [...prev, created])
      setIsAddDialogOpen(false)
      setNewProduct({
        name: "",
        description: "",
        price: 0,
        category: "",
        brand: "",
        image: "",
        countInStock: 0,
        featured: false,
      })
    } catch (error) {
      console.error("Failed to add product:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${id}`, {
        method: "DELETE",
      })
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (error) {
      console.error("Failed to delete:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Product</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Label>Name</Label>
              <Input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />

              <Label>Description</Label>
              <Textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />

              <Label>Price</Label>
              <Input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })} />

              <Label>Category</Label>
              <Input value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} />

              <Label>Brand</Label>
              <Input value={newProduct.brand} onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })} />

              <Label>Stock</Label>
              <Input type="number" value={newProduct.countInStock} onChange={(e) => setNewProduct({ ...newProduct, countInStock: parseInt(e.target.value) })} />

              <Label>Image URL</Label>
              <Input value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} />

              <Label>Featured</Label>
              <Input type="checkbox" checked={newProduct.featured} onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.checked })} />

              <Button onClick={handleAddProduct} className="w-full">Submit</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search by name or category"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 mb-4"
        />
      </div>

      {/* Product Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product List ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="flex items-center gap-2">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="rounded"
                    />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.brand}</p>
                    </div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={product.countInStock > 0 ? "default" : "destructive"}>
                      {product.countInStock} in stock
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {product.featured ? (
                      <Badge variant="default">Yes</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
