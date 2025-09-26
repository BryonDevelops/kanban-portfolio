"use client"

import { ProtectedRoute } from "@/presentation/components/shared/ProtectedRoute"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/ui/card"
import { Button } from "@/presentation/components/ui/button"
import { Users, Settings, Database, Shield, Activity } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { Badge } from "@/presentation/components/ui/badge"

export default function AdminPage() {
  const { user } = useUser()

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="relative min-h-screen">
        {/* Full screen background */}
        <div className="fixed inset-0 bg-gradient-to-br from-pink-50/80 via-blue-50/60 to-purple-50/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 -z-10" />

        {/* Enhanced Background Effects */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Primary gradient orbs */}
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-pink-300/20 via-purple-300/20 to-blue-300/20 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-tr from-cyan-300/20 via-emerald-300/20 to-teal-300/20 dark:from-emerald-500/10 dark:via-cyan-500/10 dark:to-blue-500/10 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

          {/* Secondary accent orbs */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-gradient-to-r from-violet-300/15 to-fuchsia-300/15 dark:from-violet-500/5 dark:to-fuchsia-500/5 blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />

          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Welcome back, {user?.firstName || 'Admin'}! Manage your portfolio and user data here.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* User Management */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:shadow-pink-500/10 dark:hover:shadow-purple-500/10 border-pink-100/50 dark:border-purple-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Users className="h-5 w-5 text-pink-500 dark:text-purple-400" />
                User Management
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary" className="bg-pink-100 text-pink-700 dark:bg-purple-900/50 dark:text-purple-300">Coming Soon</Badge>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  View and manage user accounts, roles, and permissions.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:shadow-cyan-500/10 dark:hover:shadow-emerald-500/10 border-cyan-100/50 dark:border-emerald-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Settings className="h-5 w-5 text-cyan-500 dark:text-emerald-400" />
                System Settings
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Configure application settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary" className="bg-cyan-100 text-cyan-700 dark:bg-emerald-900/50 dark:text-emerald-300">Coming Soon</Badge>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Manage application configuration and preferences.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Database Management */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:shadow-purple-500/10 dark:hover:shadow-blue-500/10 border-purple-100/50 dark:border-blue-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Database className="h-5 w-5 text-purple-500 dark:text-blue-400" />
                Database
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Monitor and manage database operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-blue-900/50 dark:text-blue-300">Coming Soon</Badge>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  View database statistics and perform maintenance tasks.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-pink-100/50 dark:border-purple-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <Activity className="h-5 w-5 text-pink-500 dark:text-purple-400" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 border-pink-200/50 hover:bg-pink-50 hover:border-pink-300 dark:border-purple-700/50 dark:hover:bg-purple-900/20 dark:hover:border-purple-600 transition-colors">
                <Shield className="h-6 w-6 text-pink-500 dark:text-purple-400" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Security Logs</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 border-cyan-200/50 hover:bg-cyan-50 hover:border-cyan-300 dark:border-emerald-700/50 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-600 transition-colors">
                <Users className="h-6 w-6 text-cyan-500 dark:text-emerald-400" />
                <span className="text-sm text-slate-700 dark:text-slate-300">User Reports</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 border-purple-200/50 hover:bg-purple-50 hover:border-purple-300 dark:border-blue-700/50 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 transition-colors">
                <Database className="h-6 w-6 text-purple-500 dark:text-blue-400" />
                <span className="text-sm text-slate-700 dark:text-slate-300">Backup Data</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2 border-orange-200/50 hover:bg-orange-50 hover:border-orange-300 dark:border-orange-700/50 dark:hover:bg-orange-900/20 dark:hover:border-orange-600 transition-colors">
                <Settings className="h-6 w-6 text-orange-500 dark:text-orange-400" />
                <span className="text-sm text-slate-700 dark:text-slate-300">System Health</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Admin Info */}
        <Card className="mt-6 border-cyan-100/50 dark:border-emerald-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-800 dark:text-slate-200">Administrator Information</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Your current admin privileges and session details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">User ID:</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">{user?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Email:</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">{user?.primaryEmailAddress?.emailAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Role:</span>
                <Badge variant="default" className="bg-gradient-to-r from-pink-500 to-purple-600 dark:from-purple-500 dark:to-blue-600 text-white">Administrator</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Login:</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {user?.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
