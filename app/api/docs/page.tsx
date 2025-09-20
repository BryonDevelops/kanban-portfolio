"use client"
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">API Documentation</h1>
          <p className="text-muted-foreground mt-2">
            Interactive API documentation for the Kanban Portfolio application.
          </p>
        </div>
        <div className="rounded-lg border bg-card">
          <SwaggerUI url="/api/openapi" />
        </div>
      </div>
    </div>
  )
}