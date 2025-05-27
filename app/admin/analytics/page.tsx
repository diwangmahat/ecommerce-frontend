"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d")
  const [salesData, setSalesData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [revenueData, setRevenueData] = useState([])

useEffect(() => {
  const fetchData = async () => {
    try {
      const resSales = await fetch(`/api/analytics/sales?range=${timeRange}`)
      const sales = await resSales.json()

      const resCategories = await fetch("/api/analytics/categories")
      const categories = await resCategories.json()

      const resRevenue = await fetch("/api/analytics/revenue")
      const revenue = await resRevenue.json()

      setSalesData(sales)
      setCategoryData(categories)
      setRevenueData(revenue)
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    }
  }

  fetchData()
}, [timeRange])


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Sales & Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#8884d8" name="Sales ($)" />
              <Bar dataKey="orders" fill="#82ca9d" name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} name="Revenue ($)" />
                <Line type="monotone" dataKey="profit" stroke="#82ca9d" strokeWidth={2} name="Profit ($)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">$67,890</p>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xs text-green-600 mt-1">+12.5% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">1,234</p>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-xs text-green-600 mt-1">+8.2% from last month</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">$55.12</p>
              <p className="text-sm text-gray-600">Average Order Value</p>
              <p className="text-xs text-red-600 mt-1">-2.1% from last month</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}