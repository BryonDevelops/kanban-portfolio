import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  url: z.string().url().optional(),
  status: z.enum(['planning', 'in-progress', 'completed', 'on-hold', 'archived']).default('planning'),
  technologies: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  updated_at: z.date().optional(),
  created_at: z.date().optional(), // Added created_at field for projects
  tasks: z.array(z.object({
    id: z.string(),
    title: z.string().min(1).max(100),
    description: z.string().optional(),
    status: z.enum(['todo', 'in-progress', 'done']).default('todo'),
    created_at: z.date(),
    updated_at: z.date().optional(),
  })).default([]),
})

export const ProjectCreateSchema = ProjectSchema.omit({
  id: true,
  updated_at: true
})

export const ProjectUpdateSchema = ProjectSchema.omit({
  id: true
}).partial()

export type Project = z.infer<typeof ProjectSchema>
export type ProjectCreate = z.infer<typeof ProjectCreateSchema>
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>
