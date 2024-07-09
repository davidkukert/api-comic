import { z } from 'zod'

const pages = z.union([
  z.string(),
  z.object({
    name: z.string(),
    url: z.string().url(),
  }),
])

export type PageProps = z.infer<typeof pages>

export const ChapterCreateInput = z.object({
  number: z.string(),
  title: z.string().optional(),
  pages: z.array(pages),
  projectId: z.string().ulid(),
})

export const ChapterUpdateInput = ChapterCreateInput.partial()
