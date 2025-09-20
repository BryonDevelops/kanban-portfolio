"use client"

import { Button } from "@/presentation/components/ui/button"
import { success, error, warning, info } from "@/presentation/utils/toast"

export function ToastDemo() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-2xl font-bold">Toast Demo</h2>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => success("Success!", "Your action was completed successfully.")}
          variant="default"
        >
          Show Success Toast
        </Button>

        <Button
          onClick={() => error("Error!", "Something went wrong. Please try again.")}
          variant="destructive"
        >
          Show Error Toast
        </Button>

        <Button
          onClick={() => warning("Warning!", "Please review your input before proceeding.")}
          variant="secondary"
        >
          Show Warning Toast
        </Button>

        <Button
          onClick={() => info("Info", "Here's some useful information for you.")}
          variant="outline"
        >
          Show Info Toast
        </Button>
      </div>
    </div>
  )
}