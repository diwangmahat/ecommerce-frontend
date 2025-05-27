"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Wifi } from "lucide-react"

interface BackendStatus {
  isConnected: boolean
  responseTime: number
  lastChecked: string
  version?: string
}

export default function BackendStatus() {
  const [status, setStatus] = useState<BackendStatus>({
    isConnected: false,
    responseTime: 0,
    lastChecked: "",
  })

  useEffect(() => {
    checkBackendStatus()
    const interval = setInterval(checkBackendStatus, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const checkBackendStatus = async () => {
    const startTime = Date.now()
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/health`)
      const endTime = Date.now()

      if (response.ok) {
        const data = await response.json()
        setStatus({
          isConnected: true,
          responseTime: endTime - startTime,
          lastChecked: new Date().toLocaleTimeString(),
          version: data.version,
        })
      } else {
        throw new Error("Backend not responding")
      }
    } catch (error) {
      setStatus({
        isConnected: false,
        responseTime: 0,
        lastChecked: new Date().toLocaleTimeString(),
      })
    }
  }

  const getStatusIcon = () => {
    if (status.isConnected) {
      return <CheckCircle className="h-4 w-4 text-green-600" />
    } else {
      return <XCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusColor = () => {
    if (status.isConnected) {
      if (status.responseTime < 200) return "bg-green-100 text-green-800"
      if (status.responseTime < 500) return "bg-yellow-100 text-yellow-800"
      return "bg-orange-100 text-orange-800"
    }
    return "bg-red-100 text-red-800"
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-sm">
          <Wifi className="h-4 w-4" />
          <span>Backend Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm">Connection</span>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <Badge className={getStatusColor()}>{status.isConnected ? "Connected" : "Disconnected"}</Badge>
          </div>
        </div>

        {status.isConnected && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm">Response Time</span>
              <span className="text-sm font-medium">{status.responseTime}ms</span>
            </div>
            {status.version && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Version</span>
                <span className="text-sm font-medium">{status.version}</span>
              </div>
            )}
          </>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm">Last Checked</span>
          <span className="text-sm text-gray-500">{status.lastChecked}</span>
        </div>
      </CardContent>
    </Card>
  )
}
