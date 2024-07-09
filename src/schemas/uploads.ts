import { z } from 'zod'

// Definindo os tipos de arquivo permitidos
const ACCEPTED_IMAGE_TYPES = ['image/webp', 'image/avif']

// Definindo o tamanho máximo do arquivo (em bytes)
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= MAX_FILE_SIZE, `File size max 5MB`)
  .refine(
    (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
    'Only .avif and .webp is supported.',
  )

export const CoverUploadInput = z.object({
  cover: fileSchema,
})

export const PagesUploadInput = z.object({
  'pages[]': z.array(fileSchema),
})
