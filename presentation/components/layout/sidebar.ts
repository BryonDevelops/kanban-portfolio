import { type LucideIcon } from "lucide-react"
import {
  Bot,
  BookOpen,
  Frame,
  Home,
  Mail,
  Shield,
  Settings,
  Users,
} from "lucide-react"

// Type for navigation items with optional feature flags
type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  description: string;
  featureFlag?: string;
}

// Sidebar navigation configuration
// Easily add new menu items by adding objects to the arrays below
//
// Each menu item should have:
// - title: Display name in the sidebar
// - url: Route path (must match your Next.js pages)
// - icon: Lucide React icon component
// - description: Tooltip text (optional)
// - featureFlag: Feature flag key to control visibility (optional)

const sidebarConfig = {
  // User information for the sidebar footer
  user: {
    name: "Portfolio",
    email: "hello@portfolio.dev",
    avatar: "/avatars/portfolio.jpg",
  },

  // Main navigation items - primary menu
  navMain: [
    {
      title: "Home",
      url: "/",
      icon: Home,
      description: "Welcome page"
    },
    {
      title: "Projects",
      url: "/projects",
      icon: Frame,
      description: "View all projects",
      featureFlag: "projects"
    },
    {
      title: "Board",
      url: "/Board",
      icon: Frame,
      description: "Kanban board",
      featureFlag: "board"
    },
    {
      title: "Microblog",
      url: "/microblog",
      icon: BookOpen,
      description: "Thoughts and insights",
      featureFlag: "microblog"
    },
    {
      title: "About",
      url: "/about",
      icon: Bot,
      description: "Learn more about me",
      featureFlag: "about"
    },
    {
      title: "Contact",
      url: "/contact",
      icon: Mail,
      description: "Get in touch",
      featureFlag: "contact"
    }
  ] as NavItem[],

  // Secondary navigation items - settings, tools, etc.
  navSecondary: [] as NavItem[],

  // Admin navigation items - only shown to admin users
  navAdmin: [
    {
      title: "Admin Dashboard",
      url: "/admin",
      icon: Shield,
      description: "Administrative controls",
      featureFlag: "admin"
    },
    {
      title: "User Management",
      url: "/admin/users",
      icon: Users,
      description: "Manage users and permissions",
      featureFlag: "userManagement"
    },
    {
      title: "System Settings",
      url: "/admin/settings",
      icon: Settings,
      description: "Application configuration",
      featureFlag: "systemSettings"
    }
  ] as NavItem[],
}

// Helper function to get all navigation items
export const getAllNavItems = () => {
  return [
    ...sidebarConfig.navMain,
    ...sidebarConfig.navSecondary,
  ]
}

// Helper function to get admin navigation items
export const getAdminNavItems = () => {
  return sidebarConfig.navAdmin;
}

// Helper function to find a navigation item by URL
export const findNavItemByUrl = (url: string) => {
  return getAllNavItems().find(item => item.url === url)
}

// Export the raw config for components that need it
export { sidebarConfig }