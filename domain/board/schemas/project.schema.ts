import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { TaskSchema, TaskCreateSchema } from '../schemas/task.schemas'

extendZodWithOpenApi(z)

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  url: z.string().url().optional(),
  image: z.string().url().optional(), // Project image/cover image
  status: z.enum(['idea', 'planning', 'in-progress', 'completed', 'on-hold', 'archived']).default('idea'),
  technologies: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string().url(),
    type: z.string().optional(), // file type like 'pdf', 'doc', 'image', etc.
    size: z.number().optional() // file size in bytes
  })).default([]),
  notes: z.string().optional(), // Internal notes and observations
  architecture: z.string().optional(), // Technical architecture and design notes
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  updated_at: z.date().optional(),
  created_at: z.date().optional(), // Added created_at field for projects
  tasks: z.array(TaskSchema).default([]),
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
