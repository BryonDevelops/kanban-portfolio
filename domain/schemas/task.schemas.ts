import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().optional(),
  url: z.string().url().optional(),
})

export const TaskCreateSchema = TaskSchema.omit({ id: true })

export type TaskCreate = z.infer<typeof TaskCreateSchema>
