import { toast } from "@/presentation/hooks/use-toast"

export const toastUtils = {
  success: (title: string, description?: string) => {
    return toast({
      title,
      description,
      variant: "success",
    })
  },

  error: (title: string, description?: string) => {
    return toast({
      title,
      description,
      variant: "destructive",
    })
  },

  warning: (title: string, description?: string) => {
    return toast({
      title,
      description,
      variant: "warning",
    })
  },

  info: (title: string, description?: string) => {
    return toast({
      title,
      description,
      variant: "info",
    })
  },

  default: (title: string, description?: string) => {
    return toast({
      title,
      description,
      variant: "default",
    })
  },
}

// Export individual functions for convenience
export const { success, error, warning, info } = toastUtils