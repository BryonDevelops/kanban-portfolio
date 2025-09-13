import { z } from 'zod'
import { extendZodWithOpenApi } from 'zod-to-openapi'

extendZodWithOpenApi(z)

export const TaskSchema = z.object({
  id: z.string().openapi({ example: '1' }),
  title: z.string().min(1).openapi({ example: 'Test Task' }),
  description: z.string().optional().openapi({ example: 'Optional description' }),
  url: z.string().url().optional().openapi({ example: 'https://example.com' }),
})

export const TaskCreateSchema = TaskSchema.omit({ id: true })

export type TaskCreate = z.infer<typeof TaskCreateSchema>
