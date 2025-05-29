"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { ShoppingBag, Menu, X, Search, User, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut } from "lucide-react"
import { useAuth } from "../context/auth-context"
import { useWishlist } from "../context/wishlist-context"
import { useCart } from "../context/cart-context"

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { state: cartState } = useCart()
  const { state: authState, logout } = useAuth()
  const { state: wishlistState } = useWishlist()
  const wishlistCount = wishlistState.items.length

  const totalItems = cartState.items.reduce((sum, item) => sum + item.quantity, 0)

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  const router = useRouter()

  const handleGenderFilter = (gender: string) => {
    router.push(`/products?gender=${gender}`)
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-gray-900">StyleHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/products" className="text-gray-700 hover:text-gray-900 transition-colors">
              All Products
            </Link>
            <span
              onClick={() => {
                handleGenderFilter("Men")
                setIsMenuOpen(false)
              }}
              className="cursor-pointer text-gray-700 hover:text-gray-900 py-2 transition-colors"
            >
              Men
            </span>
            <span
              onClick={() => {
                handleGenderFilter("Women")
                setIsMenuOpen(false)
              }}
              className="cursor-pointer text-gray-700 hover:text-gray-900 py-2 transition-colors"
            >
              Women
            </span>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input type="search" placeholder="Search products..." className="pl-10 pr-4 py-2 w-full" />
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            {/* User Profile/Auth */}
            {authState.isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{authState.user?.name}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  {authState.user?.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}

            <Link href="/wishlist">
              <Button variant="ghost" size="icon" className="hidden md:flex relative">
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input type="search" placeholder="Search products..." className="pl-10 pr-4 py-2 w-full" />
              </div>

              <Link
                href="/products"
                className="text-gray-700 hover:text-gray-900 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                All Products
              </Link>
              <span
                onClick={() => {
                  handleGenderFilter("Men")
                  setIsMenuOpen(false)
                }}
                className="cursor-pointer text-gray-700 hover:text-gray-900 py-2"
              >
                Men
              </span>
              <span
                onClick={() => {
                  handleGenderFilter("Women")
                  setIsMenuOpen(false)
                }}
                className="cursor-pointer text-gray-700 hover:text-gray-900 py-2"
              >
                Women
              </span>

              <div className="flex flex-col space-y-2 pt-4 border-t">
                {authState.isAuthenticated ? (
                  <>
                    <div className="text-sm font-medium text-gray-900">{authState.user?.name}</div>
                    <Link
                      href="/profile"
                      className="text-gray-700 hover:text-gray-900 py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="text-gray-700 hover:text-gray-900 py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    {authState.user?.role === "admin" && (
                      <Link
                        href="/admin"
                        className="text-gray-700 hover:text-gray-900 py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="justify-start text-red-600 hover:text-red-700"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <div className="flex space-x-2">
                    <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setIsMenuOpen(false)}>
                      <Button size="sm">Sign Up</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t">
              <Link href="/wishlist" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}