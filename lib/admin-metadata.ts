// Admin User Metadata Setup Guide
// This file contains utilities and examples for managing admin user metadata in Clerk

type ClerkUser = {
  id: string;
  publicMetadata?: Record<string, unknown>;
  organizationMemberships?: Array<{
    role: string;
    organization: {
      publicMetadata?: Record<string, unknown>;
    };
  }>;
};

/**
 * Admin User Metadata Structure
 *
 * Clerk supports two types of metadata for users:
 * 1. publicMetadata - Accessible from the client-side
 * 2. privateMetadata - Only accessible from the server-side
 *
 * For admin roles, we recommend using publicMetadata so the client
 * can conditionally show admin features.
 */

// Example admin user metadata
export const ADMIN_USER_METADATA = {
  role: 'admin',
  isAdmin: true,
  permissions: ['read', 'write', 'delete', 'manage_users'],
  adminLevel: 'full' // 'full', 'moderator', 'viewer'
}

// Example moderator user metadata (limited admin access)
export const MODERATOR_USER_METADATA = {
  role: 'moderator',
  isAdmin: false,
  permissions: ['read', 'write'],
  adminLevel: 'moderator'
}

/**
 * How to set admin metadata for a user:
 *
 * 1. Using Clerk Dashboard:
 *    - Go to Users in your Clerk dashboard
 *    - Select a user
 *    - Go to Metadata tab
 *    - Add public metadata: {"role": "admin", "isAdmin": true}
 *
 * 2. Using Clerk API (Server-side):
 *    const user = await clerkClient.users.updateUser(userId, {
 *      publicMetadata: ADMIN_USER_METADATA
 *    });
 *
 * 3. Using Clerk React hooks (Client-side - requires admin privileges):
 *    import { useUser } from '@clerk/nextjs';
 *
 *    const { user } = useUser();
 *    await user?.update({
 *      publicMetadata: ADMIN_USER_METADATA
 *    });
 */

/**
 * Utility function to check if user is admin
 * This is used in the ProtectedRoute component
 */
export function isUserAdmin(user: ClerkUser | null | undefined): boolean {
  if (!user) return false;

  // Check multiple admin indicators for flexibility
  return (
    user.publicMetadata?.role === 'admin' ||
    user.publicMetadata?.isAdmin === true ||
    user.organizationMemberships?.some((membership) =>
      membership.role === 'admin' ||
      membership.organization.publicMetadata?.isAdminOrg === true
    ) ||
    false
  );
}

/**
 * Utility function to get user role
 */
export function getUserRole(user: ClerkUser | null | undefined): string {
  if (!user) return 'guest';

  if (isUserAdmin(user)) return 'admin';

  return (user.publicMetadata?.role as string) || 'user';
}

/**
 * Permission checking utility
 */
export function hasPermission(user: ClerkUser | null | undefined, permission: string): boolean {
  if (!user) return false;

  const userPermissions = user.publicMetadata?.permissions as string[] | undefined;
  return userPermissions?.includes(permission) || isUserAdmin(user);
}

/**
 * Admin role hierarchy
 */
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  VIEWER: 'viewer'
} as const;

export type AdminRole = typeof ADMIN_ROLES[keyof typeof ADMIN_ROLES];

/**
 * Check if user has specific admin role or higher
 */
export function hasAdminRole(user: ClerkUser | null | undefined, requiredRole: AdminRole): boolean {
  if (!user) return false;

  const userRole = user.publicMetadata?.adminLevel as string | undefined;
  const roleHierarchy = ['viewer', 'moderator', 'admin', 'super_admin'];

  const userRoleIndex = roleHierarchy.indexOf(userRole || '');
  const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);

  return userRoleIndex >= requiredRoleIndex;
}