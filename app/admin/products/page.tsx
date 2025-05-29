"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { toast } from "react-toastify";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  gender?: string;
  brand: string;
  image: string;
  size: string[] | null;
  color: string[] | null;
  countInStock: number;
  rating: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductsState {
  products: Product[];
  page: number;
  pages: number;
  total: number;
}

interface ProductForm {
  id?: number; // Added optional id for edit form
  name: string;
  description: string;
  price: number;
  category: string;
  gender?: string;
  brand: string;
  image: string;
  size: string;
  color: string;
  countInStock: number;
  featured: boolean;
}

export default function ProductsPage() {
  const { state: authState, logout } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<ProductsState>({ products: [], page: 1, pages: 1, total: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductForm | null>(null);
  const [newProduct, setNewProduct] = useState<ProductForm>({
    name: "",
    description: "",
    price: 0,
    category: "",
    gender: "",
    brand: "",
    image: "",
    size: "",
    color: "",
    countInStock: 0,
    featured: false,
  });
  const [page, setPage] = useState(1);
  const pageSize = 32;

  const getToken = () => authState.token;

  const validateProduct = (product: ProductForm) => {
    if (!product.name.trim()) return "Name is required";
    if (isNaN(product.price) || product.price < 0) return "Price must be a non-negative number";
    if (!product.category.trim()) return "Category is required";
    if (!product.brand.trim()) return "Brand is required";
    if (!product.description.trim()) return "Description is required";
    if (!product.image.trim()) return "Image URL is required";
    if (isNaN(product.countInStock) || product.countInStock < 0) return "Stock must be a non-negative number";
    return null;
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        const url = new URL(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products`);
        url.searchParams.append("pageNumber", page.toString());
        url.searchParams.append("limit", pageSize.toString());
        if (searchTerm) {
          url.searchParams.append("keyword", searchTerm);
        }
        const res = await fetch(url, {
          headers: authState.token ? { Authorization: `Bearer ${authState.token}` } : {},
        });
        if (res.status === 401) {
          logout();
          router.push("/auth/login");
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts({
          products: data.products || [],
          page: data.page || 1,
          pages: data.pages || 1,
          total: data.total || 0,
        });
      } catch (err) {
        console.error("Failed to fetch products:", err);
        toast.error("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [page, searchTerm, router, logout, authState.token]);

  const filteredProducts = products.products.filter((product) =>
    [product.name, product.category, product.brand, product.gender, product.size?.join(","), product.color?.join(",")]
      .some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddProduct = async () => {
    const error = validateProduct(newProduct);
    if (error) {
      toast.error(error);
      return;
    }
    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        toast.error("Authentication token missing");
        logout();
        router.push("/auth/login");
        return;
      }
      const payload = {
        ...newProduct,
        price: Number(newProduct.price),
        countInStock: Number(newProduct.countInStock),
        size: newProduct.size ? newProduct.size.split(",").map((s: string) => s.trim()).filter((s: string) => s) : null,
        color: newProduct.color ? newProduct.color.split(",").map((c: string) => c.trim()).filter((c: string) => c) : null,
        gender: newProduct.gender || null,
      };
      console.log("Sending product payload:", payload); // Debug log
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        toast.error("Unauthorized. Please log in again.");
        logout();
        router.push("/auth/login");
        return;
      }
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = { message: `Server error: ${res.status}` };
        }
        console.error("Backend error response:", errorData); // Debug log
        throw new Error(errorData.message || `Failed to add product: ${res.status}`);
      }
      const created = await res.json();
      setProducts((prev) => ({
        ...prev,
        products: [...prev.products, created],
        total: prev.total + 1,
      }));
      setIsAddDialogOpen(false);
      setNewProduct({
        name: "",
        description: "",
        price: 0,
        category: "",
        gender: "",
        brand: "",
        image: "",
        size: "",
        color: "",
        countInStock: 0,
        featured: false,
      });
      toast.success("Product added successfully");
    } catch (error: unknown) {
      console.error("Failed to add product:", error);
      const message = error instanceof Error ? error.message : "Failed to add product";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditProduct({
      id: product.id, // Include id
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      gender: product.gender || "",
      brand: product.brand,
      image: product.image,
      size: product.size?.join(",") || "",
      color: product.color?.join(",") || "",
      countInStock: product.countInStock,
      featured: product.featured,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!editProduct || !editProduct.id) return; // Guard against missing id
    const error = validateProduct(editProduct);
    if (error) {
      toast.error(error);
      return;
    }
    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        toast.error("Authentication token missing");
        logout();
        router.push("/auth/login");
        return;
      }
      const payload = {
        name: editProduct.name,
        description: editProduct.description,
        price: Number(editProduct.price),
        category: editProduct.category,
        gender: editProduct.gender || null,
        brand: editProduct.brand,
        image: editProduct.image,
        size: editProduct.size ? editProduct.size.split(",").map((s: string) => s.trim()).filter((s: string) => s) : null,
        color: editProduct.color ? editProduct.color.split(",").map((c: string) => c.trim()).filter((c: string) => c) : null,
        countInStock: Number(editProduct.countInStock),
        featured: editProduct.featured,
      };
      console.log("Sending update payload:", payload); // Debug log
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${editProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        toast.error("Unauthorized. Please log in again.");
        logout();
        router.push("/auth/login");
        return;
      }
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = { message: `Server error: ${res.status}` };
        }
        console.error("Backend error response:", errorData); // Debug log
        throw new Error(errorData.message || `Failed to update product: ${res.status}`);
      }
      const updated = await res.json();
      setProducts((prev) => ({
        ...prev,
        products: prev.products.map((p) => (p.id === updated.id ? updated : p)),
      }));
      setIsEditDialogOpen(false);
      setEditProduct(null);
      toast.success("Product updated successfully");
    } catch (error: unknown) {
      console.error("Failed to update product:", error);
      const message = error instanceof Error ? error.message : "Failed to update product";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        toast.error("Authentication token missing");
        logout();
        router.push("/auth/login");
        return;
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        toast.error("Unauthorized. Please log in again.");
        logout();
        router.push("/auth/login");
        return;
      }
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = { message: `Server error: ${res.status}` };
        }
        throw new Error(errorData.message || `Failed to delete product: ${res.status}`);
      }
      setProducts((prev) => ({
        ...prev,
        products: prev.products.filter((p) => p.id !== id),
        total: prev.total - 1,
      }));
      toast.success("Product deleted successfully");
    } catch (error: unknown) {
      console.error("Failed to delete product:", error);
      const message = error instanceof Error ? error.message : "Failed to delete product";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm("Are you sure you want to delete all products? This cannot be undone.")) return;
    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        toast.error("Authentication token missing");
        logout();
        router.push("/auth/login");
        return;
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        toast.error("Unauthorized. Please log in again.");
        logout();
        router.push("/auth/login");
        return;
      }
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = { message: `Server error: ${res.status}` };
        }
        throw new Error(errorData.message || `Failed to delete all products: ${res.status}`);
      }
      setProducts({ products: [], page: 1, pages: 1, total: 0 });
      setPage(1);
      toast.success("All products deleted successfully");
    } catch (error: unknown) {
      console.error("Failed to delete all products:", error);
      const message = error instanceof Error ? error.message : "Failed to delete all products";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={isLoading}>
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Input
                    value={newProduct.gender}
                    onChange={(e) => setNewProduct({ ...newProduct, gender: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Brand</Label>
                  <Input
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Image URL</Label>
                  <Input
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Size</Label>
                  <Input
                    placeholder="Separate sizes with commas (e.g. S,M,L)"
                    value={newProduct.size}
                    onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Color</Label>
                  <Input
                    placeholder="Separate colors with commas (e.g. red,blue,green)"
                    value={newProduct.color}
                    onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    value={newProduct.countInStock}
                    onChange={(e) => setNewProduct({ ...newProduct, countInStock: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="featured"
                    type="checkbox"
                    checked={newProduct.featured}
                    onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="featured">Featured</Label>
                </div>
                <Button onClick={handleAddProduct} className="w-full" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Submit"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Product</DialogTitle>
              </DialogHeader>
              {editProduct && (
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={editProduct.name}
                      onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={editProduct.description}
                      onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Price</Label>
                    <Input
                      type="number"
                      value={editProduct.price}
                      onChange={(e) => setEditProduct({ ...editProduct, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input
                      value={editProduct.category}
                      onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <Input
                      value={editProduct.gender}
                      onChange={(e) => setEditProduct({ ...editProduct, gender: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Brand</Label>
                    <Input
                      value={editProduct.brand}
                      onChange={(e) => setEditProduct({ ...editProduct, brand: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Image URL</Label>
                    <Input
                      value={editProduct.image}
                      onChange={(e) => setEditProduct({ ...editProduct, image: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Size</Label>
                    <Input
                      placeholder="Separate sizes with commas (e.g. S,M,L)"
                      value={editProduct.size}
                      onChange={(e) => setEditProduct({ ...editProduct, size: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Color</Label>
                    <Input
                      placeholder="Separate colors with commas (e.g. red,blue,green)"
                      value={editProduct.color}
                      onChange={(e) => setEditProduct({ ...editProduct, color: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Stock</Label>
                    <Input
                      type="number"
                      value={editProduct.countInStock}
                      onChange={(e) => setEditProduct({ ...editProduct, countInStock: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      id="edit-featured"
                      type="checkbox"
                      checked={editProduct.featured}
                      onChange={(e) => setEditProduct({ ...editProduct, featured: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="edit-featured">Featured</Label>
                  </div>
                  <Button onClick={handleUpdateProduct} className="w-full" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update"}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
          <Button
            variant="destructive"
            onClick={handleBulkDelete}
            disabled={isLoading || products.products.length === 0}
          >
            {isLoading ? "Deleting..." : "Delete All"}
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search by name, category, brand, gender, size, or color"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="pl-10 mb-4"
        />
      </div>

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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(product)}
                        disabled={isLoading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              disabled={isLoading || page === 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            <span>
              Page {page} of {products.pages}
            </span>
            <Button
              variant="outline"
              disabled={isLoading || page >= products.pages}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
