import { $Enums } from '@prisma/client'
import { z } from 'zod'

const authorsProject = z.object({
  name: z.string(),
  role: z.enum(['writer', 'artist']),
})

export const ProjectCreateInput = z.object({
  title: z.string(),
  titlesAlternatives: z.array(z.string()),
  slug: z.string(),
  description: z.string().default('Description not available'),
  cover: z.string().default('Cover not available'),
  adult: z.boolean().default(false),
  authors: z.array(z.union([authorsProject, z.string()])),
  mediaType: z.nativeEnum($Enums.MediaTypeProject),
})

export const ProjectUpdateInput = ProjectCreateInput.partial()
