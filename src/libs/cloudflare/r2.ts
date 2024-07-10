import { env } from '@/env'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import type { StreamingBlobPayloadInputTypes } from '@smithy/types'

export const r2 = new S3Client({
  endpoint: env.CLOUDFLARE_ENDPOINT,
  region: 'auto',
  credentials: {
    accessKeyId: env.CLOUDFLARE_ACCESS_KEY,
    secretAccessKey: env.CLOUDFLARE_SECRET_KEY,
  },
})

export const putObject = (
  Key: string,
  Body: StreamingBlobPayloadInputTypes,
  ContentType: string,
) =>
  r2.send(
    new PutObjectCommand({
      Bucket: env.CLOUDFLARE_BUCKET,
      Key,
      Body,
      ContentType,
    }),
  )

export const getObject = (key: string) =>
  r2.send(
    new GetObjectCommand({
      Bucket: env.CLOUDFLARE_BUCKET,
      Key: key,
    }),
  )

export const deleteObject = (Key: string) =>
  r2.send(
    new DeleteObjectCommand({
      Bucket: env.CLOUDFLARE_BUCKET,
      Key,
    }),
  )
