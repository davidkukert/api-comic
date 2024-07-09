import { z } from 'zod'

export const TagCreateInput = z.object({
  name: z.string(),
  slug: z.string(),
})

export const TagUpdateInput = TagCreateInput.partial()
