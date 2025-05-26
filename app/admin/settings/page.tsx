"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Save, Mail, Shield, Globe, Zap } from "lucide-react"

interface SystemSettings {
  siteName: string
  siteDescription: string
  contactEmail: string
  supportEmail: string
  currency: string
  timezone: string
  maintenanceMode: boolean
  allowRegistrations: boolean
  emailNotifications: boolean
  orderNotifications: boolean
  lowStockThreshold: number
  taxRate: number
  shippingRate: number
  freeShippingThreshold: number
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: "StyleHub",
    siteDescription: "Premium clothing store for modern fashion",
    contactEmail: "contact@stylehub.com",
    supportEmail: "support@stylehub.com",
    currency: "USD",
    timezone: "America/New_York",
    maintenanceMode: false,
    allowRegistrations: true,
    emailNotifications: true,
    orderNotifications: true,
    lowStockThreshold: 10,
    taxRate: 8.5,
    shippingRate: 9.99,
    freeShippingThreshold: 50,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async (section: string, data: Partial<SystemSettings>) => {
    setIsSaving(true)
    setMessage("")

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify({ section, ...data }),
      })

      if (response.ok) {
        setMessage("Settings saved successfully!")
        setSettings((prev) => ({ ...prev, ...data }))
      } else {
        setMessage("Failed to save settings. Please try again.")
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      {message && (
        <Alert className={message.includes("successfully") ? "border-green-500" : "border-red-500"}>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>General Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                  rows={3}
                />
              </div>

              <Button
                onClick={() =>
                  saveSettings("general", {
                    siteName: settings.siteName,
                    siteDescription: settings.siteDescription,
                    contactEmail: settings.contactEmail,
                    supportEmail: settings.supportEmail,
                    currency: settings.currency,
                  })
                }
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save General Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Store Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    value={settings.lowStockThreshold}
                    onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.1"
                    value={settings.taxRate}
                    onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="shippingRate">Shipping Rate ($)</Label>
                  <Input
                    id="shippingRate"
                    type="number"
                    step="0.01"
                    value={settings.shippingRate}
                    onChange={(e) => setSettings({ ...settings, shippingRate: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="freeShippingThreshold">Free Shipping Threshold ($)</Label>
                  <Input
                    id="freeShippingThreshold"
                    type="number"
                    step="0.01"
                    value={settings.freeShippingThreshold}
                    onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow User Registrations</p>
                    <p className="text-sm text-gray-500">Allow new users to register accounts</p>
                  </div>
                  <Switch
                    checked={settings.allowRegistrations}
                    onCheckedChange={(checked) => setSettings({ ...settings, allowRegistrations: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Maintenance Mode</p>
                    <p className="text-sm text-gray-500">Put the site in maintenance mode</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                    />
                    {settings.maintenanceMode && <Badge variant="destructive">Active</Badge>}
                  </div>
                </div>
              </div>

              <Button
                onClick={() =>
                  saveSettings("store", {
                    lowStockThreshold: settings.lowStockThreshold,
                    taxRate: settings.taxRate,
                    shippingRate: settings.shippingRate,
                    freeShippingThreshold: settings.freeShippingThreshold,
                    allowRegistrations: settings.allowRegistrations,
                    maintenanceMode: settings.maintenanceMode,
                  })
                }
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Store Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>Notification Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-500">Send email notifications to customers</p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Order Notifications</p>
                    <p className="text-sm text-gray-500">Send notifications for order updates</p>
                  </div>
                  <Switch
                    checked={settings.orderNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, orderNotifications: checked })}
                  />
                </div>
              </div>

              <Button
                onClick={() =>
                  saveSettings("notifications", {
                    emailNotifications: settings.emailNotifications,
                    orderNotifications: settings.orderNotifications,
                  })
                }
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Notification Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Environment Variables</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>BACKEND_URL:</span>
                      <Badge variant="outline" className="text-green-600">
                        {process.env.BACKEND_URL ? "Configured" : "Not Set"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>STRIPE_SECRET_KEY:</span>
                      <Badge variant="outline" className="text-green-600">
                        {process.env.STRIPE_SECRET_KEY ? "Configured" : "Not Set"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>JWT_SECRET:</span>
                      <Badge variant="outline" className="text-green-600">
                        {process.env.JWT_SECRET ? "Configured" : "Not Set"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">Security Recommendations</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Ensure all environment variables are properly configured</li>
                    <li>• Use strong, unique passwords for all admin accounts</li>
                    <li>• Regularly update your backend dependencies</li>
                    <li>• Monitor admin activity logs for suspicious behavior</li>
                    <li>• Enable two-factor authentication when available</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
