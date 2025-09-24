"use client"

import { useUser, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  fallback?: React.ReactNode
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  fallback
}: ProtectedRouteProps) {
  const { user, isLoaded } = useUser()
  const { redirectToSignIn } = useClerk()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !user) {
      // User is not signed in, redirect to sign in
      redirectToSignIn()
      return
    }

    if (isLoaded && requireAdmin && user) {
      // Check if user has admin role
      const isAdmin = user.publicMetadata?.role === 'admin' ||
                     user.publicMetadata?.isAdmin === true ||
                     user.organizationMemberships?.some(membership =>
                       membership.role === 'admin' ||
                       membership.organization.publicMetadata?.isAdminOrg === true
                     )

      if (!isAdmin) {
        // User is not admin, redirect to home or show unauthorized message
        router.push("/")
        return
      }
    }
  }, [user, isLoaded, requireAdmin, router, redirectToSignIn])

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Show fallback if user is not authenticated or authorized
  if (!user || (requireAdmin && user.publicMetadata?.role !== 'admin' &&
                user.publicMetadata?.isAdmin !== true &&
                !user.organizationMemberships?.some(membership =>
                  membership.role === 'admin' ||
                  membership.organization.publicMetadata?.isAdminOrg === true
                ))) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            {requireAdmin ? "You need admin privileges to access this page." : "Please sign in to access this page."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Helper hook to check if user is admin
export function useIsAdmin() {
  const { user } = useUser()

  if (!user) return false

  return user.publicMetadata?.role === 'admin' ||
         user.publicMetadata?.isAdmin === true ||
         user.organizationMemberships?.some(membership =>
           membership.role === 'admin' ||
           membership.organization.publicMetadata?.isAdminOrg === true
         )
}