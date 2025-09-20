import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  url: z.string().url().optional(),
  status: z.enum(['idea', 'planning', 'in-progress', 'completed', 'on-hold']).optional(),
  order: z.number().optional(),
  columnId: z.string().optional(),
})

export const TaskCreateSchema = TaskSchema.omit({ id: true }).extend({
  columnId: z.string().optional().default('ideas')
})

export type Task = z.infer<typeof TaskSchema>
export type TaskCreate = z.infer<typeof TaskCreateSchema>