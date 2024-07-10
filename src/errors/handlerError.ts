import { Prisma } from '@prisma/client'
import type { ErrorHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'

export function handlerError(model: Prisma.ModelName): ErrorHandler {
  return (error, c) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2025':
          return c.json(`${error.meta?.modelName || model} not found`, 404)
        case 'P2002':
          return c.json(`This ${error.meta?.target} is already taken!`, 409)
        default:
          return c.json({ error }, 500)
      }
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return c.json('Database is not connected', 500)
    }

    if (error instanceof HTTPException) {
      return error.getResponse()
    }

    return c.json({ error }, 500)
  }
}
