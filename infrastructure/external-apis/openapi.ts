import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import { TaskCreateSchema, TaskSchema } from '../../domain/board/schemas/task.schemas'

extendZodWithOpenApi(z)
const registry = new OpenAPIRegistry()

registry.register('Task', TaskSchema)
registry.register('TaskCreate', TaskCreateSchema)

export function getOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions)
  return generator.generateDocument({
    openapi: '3.0.0',
    info: { title: 'Kanban Portfolio API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3000' }],
  })
}
