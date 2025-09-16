import { z } from 'zod'

export const ProjectSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    url: z.string().url().optional(),
    archived: z.boolean().optional(),
    tag: z.array(z.string()).optional(),
    type: z.enum(['personal', 'work', 'open-source', 'learning', 'other']).optional(),
    status: z.enum(['idea', 'planning', 'in-progress', 'completed', 'on-hold']).optional(),
    technologies: z.array(z.string()).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    tasks: z.array(z.any()).optional(), // Reference to Task schema when available
    createdBy: z.any().optional(), // Reference to User schema when available
    updatedBy: z.any().optional(), // Reference to User schema when available
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
})

export const ProjectCreateSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    url: z.string().url().optional(),
    archived: z.boolean().optional(),
    tag: z.array(z.string()).optional(),
    type: z.enum(['personal', 'work', 'open-source', 'learning', 'other']).optional(),
    status: z.enum(['idea', 'planning', 'in-progress', 'completed', 'on-hold']).optional(),
    technologies: z.array(z.string()).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
})

export const ProjectUpdateSchema = z.object({
    id: z.string(),
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    url: z.string().url().optional(),
    archived: z.boolean().optional(),
    tag: z.array(z.string()).optional(),
    type: z.enum(['personal', 'work', 'open-source', 'learning', 'other']).optional(),
    status: z.enum(['idea', 'planning', 'in-progress', 'completed', 'on-hold']).optional(),
    technologies: z.array(z.string()).optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
})

export type Project = z.infer<typeof ProjectSchema>
export type ProjectCreate = z.infer<typeof ProjectCreateSchema>
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>