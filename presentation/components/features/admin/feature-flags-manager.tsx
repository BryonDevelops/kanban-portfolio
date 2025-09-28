"use client"

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/presentation/components/ui/card"
import { Switch } from "@/presentation/components/ui/switch"
import { Badge } from "@/presentation/components/ui/badge"
import { Button } from "@/presentation/components/ui/button"
import { Loader2, RefreshCw, Settings, AlertCircle } from "lucide-react"
import { useAdminFeatureFlagStore } from "@/presentation/stores/admin/adminFeatureFlagStore"

interface FeatureFlagsManagerProps {
  className?: string
}

export function FeatureFlagsManager({ className }: FeatureFlagsManagerProps) {
  const {
    flags,
    isLoading,
    error,
    loadFeatureFlags,
    toggleFeatureFlag,
    refreshFeatureFlags
  } = useAdminFeatureFlagStore()

  // Load feature flags on mount
  useEffect(() => {
    loadFeatureFlags()
  }, [loadFeatureFlags])

  // Group flags by category
  const groupedFlags = flags.reduce((acc, flag) => {
    if (!acc[flag.category]) {
      acc[flag.category] = []
    }
    acc[flag.category].push(flag)
    return acc
  }, {} as Record<string, typeof flags>)

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'core': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
      case 'advanced': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
      case 'experimental': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
    }
  }

  const handleToggleFlag = async (flagId: string, enabled: boolean) => {
    await toggleFeatureFlag(flagId, enabled)
  }

  const handleRefresh = async () => {
    await refreshFeatureFlags()
  }

  if (isLoading && flags.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading feature flags...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Feature Flags
            </CardTitle>
            <CardDescription>
              Control which features are enabled or disabled in your application
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-700 dark:text-red-300 font-medium">Error</span>
            </div>
            <p className="text-red-600 dark:text-red-400 mt-1">{error}</p>
          </div>
        )}

        {Object.entries(groupedFlags).map(([category, categoryFlags]) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold capitalize">{category} Features</h3>
              <Badge variant="secondary" className={getCategoryColor(category)}>
                {categoryFlags.length}
              </Badge>
            </div>

            <div className="grid gap-4">
              {categoryFlags.map((flag) => (
                <div
                  key={flag.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{flag.name}</h4>
                      <Badge
                        variant={flag.enabled ? "default" : "secondary"}
                        className={flag.enabled ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" : ""}
                      >
                        {flag.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{flag.description}</p>
                    {flag.updated_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last updated: {new Date(flag.updated_at).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={(checked) => handleToggleFlag(flag.id, checked)}
                      disabled={isLoading}
                    />
                    {isLoading && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {flags.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Feature Flags Found</h3>
            <p className="text-muted-foreground">
              Feature flags will appear here once the database is set up.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}