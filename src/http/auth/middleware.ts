import { db } from '@/db/connection'
import { env } from '@/env'
import {
  defineAbilityFor,
  type Actions,
  type AppAbility,
  type AppSubjects,
} from '@/libs/casl'
import type { User } from '@prisma/client'
import { createFactory } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { jwt } from 'hono/jwt'
import type { JWTPayload } from 'hono/utils/jwt/types'

export type UserWithoutPassword = Omit<User, 'password'>

export type AuthEnv = {
  Variables: {
    currentUser: UserWithoutPassword
    ability: (action: Actions, subjects: AppSubjects) => void
    jwtPayload: JWTPayload & { sub: string }
  }
}

const factory = createFactory<AuthEnv>()

const authMiddleware = (isPublic: boolean = false) =>
  factory.createMiddleware(async (c, next) => {
    if (isPublic) {
      await next()
    } else {
      const jwtMiddleware = jwt({ secret: env.JWT_SECRET_KEY })
      return jwtMiddleware(c, next)
    }
  })

const currentUserMiddleware = factory.createMiddleware(async (c, next) => {
  const payload = c.get('jwtPayload')

  let ability: AppAbility
  if (payload) {
    const currentUser = await db.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (currentUser) {
      c.set('currentUser', currentUser)
      ability = defineAbilityFor(currentUser)
    }
  } else {
    ability = defineAbilityFor()
  }

  c.set('ability', (action, subjects) => {
    if (ability.cannot(action, subjects)) {
      throw new HTTPException(403, { message: 'Forbidden' })
    }
  })

  await next()
})

export const authHandlers = (isPublic?: boolean) =>
  factory.createHandlers(authMiddleware(isPublic), currentUserMiddleware)
