import { SchemaRegistry, OpenAPIGenerator } from 'zod-to-openapi'
import { TaskCreateSchema, TaskSchema } from '../domain/task.schemas'

const registry = new SchemaRegistry()

registry.register('Task', TaskSchema)
registry.register('TaskCreate', TaskCreateSchema)

export function getOpenApiDocument() {
  const generator = new OpenAPIGenerator(registry.schemas)
  const componentsSchemas = generator.generate()

  return {
    openapi: '3.0.0',
    info: { title: 'Kanban Portfolio API', version: '1.0.0' },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      schemas: componentsSchemas,
    },
    paths: {
      '/api/save-board': {
        post: {
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TaskCreate' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Success',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { success: { type: 'boolean' } },
                    required: ['success'],
                  },
                },
              },
            },
            '500': { description: 'Error' },
          },
        },
      },
      '/api/tasks': {
        get: {
          responses: {
            '200': {
              description: 'List of tasks',
              content: {
                'application/json': {
                  schema: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
                },
              },
            },
            '500': { description: 'Error' },
          },
        },
      },
    },
  }
}
