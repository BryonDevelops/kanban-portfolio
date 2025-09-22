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

// Sidebar navigation configuration
// Easily add new menu items by adding objects to the arrays below
//
// Each menu item should have:
// - title: Display name in the sidebar
// - url: Route path (must match your Next.js pages)
// - icon: Lucide React icon component
// - description: Tooltip text (optional)

export const sidebarConfig = {
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
      description: "View all projects"
    },
    {
      title: "Microblog",
      url: "/microblog",
      icon: BookOpen,
      description: "Thoughts and insights"
    },
    {
      title: "About",
      url: "/about",
      icon: Bot,
      description: "Learn more about me"
    },
    {
      title: "Contact",
      url: "/contact",
      icon: Mail,
      description: "Get in touch"
    }
  ],

  // Secondary navigation items - settings, tools, etc.
  navSecondary: [
  ],

  // Admin navigation items - only shown to admin users
  navAdmin: [
    {
      title: "Admin Dashboard",
      url: "/admin",
      icon: Shield,
      description: "Administrative controls"
    },
    {
      title: "User Management",
      url: "/admin/users",
      icon: Users,
      description: "Manage users and permissions"
    },
    {
      title: "System Settings",
      url: "/admin/settings",
      icon: Settings,
      description: "Application configuration"
    }
  ],
}

// Helper function to get all navigation items
export const getAllNavItems = () => {
  return [
    ...sidebarConfig.navMain,
    ...sidebarConfig.navSecondary,
  ]
}

// Helper function to find a navigation item by URL
export const findNavItemByUrl = (url: string) => {
  return getAllNavItems().find(item => item.url === url)
}