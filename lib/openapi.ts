import { OpenAPIRegistry, OpenAPIGenerator, extendZodWithOpenApi } from 'zod-to-openapi'
import { z } from 'zod'
import { TaskCreateSchema, TaskSchema } from '../domain/task.schemas'

extendZodWithOpenApi(z)

const registry = new OpenAPIRegistry()

registry.register('Task', TaskSchema)

const SaveTaskRequest = TaskCreateSchema.openapi({ ref: 'TaskCreate' })
const SaveTaskResponse = z.object({ success: z.boolean() }).openapi({ ref: 'SaveTaskResponse' })

registry.registerPath({
  method: 'post',
  path: '/api/save-board',
  request: {
    body: { content: { 'application/json': { schema: SaveTaskRequest } } },
  },
  responses: {
    200: { description: 'Success', content: { 'application/json': { schema: SaveTaskResponse } } },
    500: { description: 'Error' },
  },
})

export function getOpenApiDocument() {
  const generator = new OpenAPIGenerator(registry.definitions, '3.0.0')
  return generator.generateDocument({
    openapi: '3.0.0',
    info: { title: 'Kanban Portfolio API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3000' }],
  })
}
