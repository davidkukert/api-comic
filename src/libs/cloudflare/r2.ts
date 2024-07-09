import { env } from '@/env'
import { S3Client } from '@aws-sdk/client-s3'

export const r2 = new S3Client({
  endpoint: env.CLOUDFLARE_ENDPOINT,
  region: 'auto',
  credentials: {
    accessKeyId: env.CLOUDFLARE_ACCESS_KEY,
    secretAccessKey: env.CLOUDFLARE_SECRET_KEY,
  },
})
