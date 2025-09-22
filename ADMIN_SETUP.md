# Admin User Setup Guide

This guide explains how to set up admin users in your Clerk-powered application.

## Overview

Admin users have elevated privileges and can access the admin dashboard at `/admin`. The system uses Clerk's public metadata to determine admin status.

## Setting Up Admin Users

### Method 1: Clerk Dashboard (Recommended)

1. **Access Clerk Dashboard**

   - Go to [dashboard.clerk.com](https://dashboard.clerk.com)
   - Select your application

2. **Navigate to Users**

   - Click on "Users" in the sidebar
   - Find the user you want to make an admin

3. **Edit User Metadata**
   - Click on the user to open their details
   - Go to the "Metadata" tab
   - In the "Public metadata" section, add:

```json
{
  "role": "admin",
  "isAdmin": true,
  "permissions": ["read", "write", "delete", "manage_users"],
  "adminLevel": "admin"
}
```

4. **Save Changes**
   - Click "Save" to apply the metadata

### Method 2: Programmatic Setup (Server-side)

If you need to set up admin users programmatically, you can use the Clerk API:

```typescript
import { clerkClient } from "@clerk/nextjs/server";

async function makeUserAdmin(userId: string) {
  try {
    const user = await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        role: "admin",
        isAdmin: true,
        permissions: ["read", "write", "delete", "manage_users"],
        adminLevel: "admin",
      },
    });

    console.log("User updated successfully:", user.id);
  } catch (error) {
    console.error("Failed to update user:", error);
  }
}

// Usage
await makeUserAdmin("user_123456789");
```

### Method 3: Self-Service (Client-side)

For existing admin users to promote others:

```typescript
"use client";

import { useUser } from "@clerk/nextjs";

export default function PromoteUser({
  targetUserId,
}: {
  targetUserId: string;
}) {
  const { user } = useUser();

  const promoteToAdmin = async () => {
    if (!user?.publicMetadata?.isAdmin) {
      alert("You must be an admin to promote users");
      return;
    }

    try {
      // This would typically call your API route
      const response = await fetch("/api/admin/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: targetUserId }),
      });

      if (response.ok) {
        alert("User promoted successfully");
      }
    } catch (error) {
      console.error("Failed to promote user:", error);
    }
  };

  return <button onClick={promoteToAdmin}>Promote to Admin</button>;
}
```

## Admin Metadata Structure

### Basic Admin User

```json
{
  "role": "admin",
  "isAdmin": true
}
```

### Full Admin User with Permissions

```json
{
  "role": "admin",
  "isAdmin": true,
  "permissions": ["read", "write", "delete", "manage_users"],
  "adminLevel": "admin"
}
```

### Moderator (Limited Admin)

```json
{
  "role": "moderator",
  "isAdmin": false,
  "permissions": ["read", "write"],
  "adminLevel": "moderator"
}
```

## Admin Role Hierarchy

- **viewer**: Read-only access
- **moderator**: Read and write access, limited admin features
- **admin**: Full admin access
- **super_admin**: Complete system access

## Testing Admin Access

1. **Sign in** with an admin user
2. **Navigate** to `/admin` - you should see the admin dashboard
3. **Check sidebar** - you should see an "Admin" section with additional menu items

## Troubleshooting

### User can't access admin dashboard

- Check that the user has `isAdmin: true` in their public metadata
- Verify the user is signed in
- Check browser console for any errors

### Admin section not showing in sidebar

- Ensure the `useIsAdmin` hook is working correctly
- Check that the user metadata is properly set
- Verify the sidebar component is importing the hook correctly

### Permission denied errors

- Check the user's permissions array in metadata
- Ensure the permission checking logic matches your requirements

## Security Notes

- **Public Metadata**: Since this uses public metadata, admin status is visible to the client. This is intentional for UI conditional rendering.
- **Server Verification**: Always verify admin status on the server-side for sensitive operations.
- **Regular Audits**: Periodically review admin user access and remove unnecessary privileges.

## API Routes Protection

When creating protected API routes, use server-side verification:

```typescript
// /api/admin/users/route.ts
import { currentUser } from "@clerk/nextjs/server";
import { isUserAdmin } from "@/lib/admin-metadata";

export async function GET() {
  const user = await currentUser();

  if (!isUserAdmin(user)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Admin-only logic here
  return Response.json({ users: [] });
}
```
