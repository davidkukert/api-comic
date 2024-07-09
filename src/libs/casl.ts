import type { UserWithoutPassword } from '@/http/auth/middleware'
import { AbilityBuilder, PureAbility } from '@casl/ability'
import {
  type PrismaQuery,
  type Subjects,
  createPrismaAbility,
} from '@casl/prisma'
import type { Chapter, Project, Tag, User } from '@prisma/client'

export type Actions =
  | 'readList'
  | 'readDetails'
  | 'create'
  | 'update'
  | 'delete'
  | 'manage'
export type AppSubjects =
  | 'all'
  | Subjects<{
      User: User
      Chapter: Chapter
      Project: Project
      Tag: Tag
    }>

export type AppAbility = PureAbility<[Actions, AppSubjects], PrismaQuery>

let ANONYMOUS_ABILITY: AppAbility
export function defineAbilityFor(user?: UserWithoutPassword) {
  if (user) return createPrismaAbility<AppAbility>(defineRulesFor(user))

  ANONYMOUS_ABILITY =
    ANONYMOUS_ABILITY || createPrismaAbility<AppAbility>(defineRulesFor())
  return ANONYMOUS_ABILITY
}

export function defineRulesFor(user?: UserWithoutPassword) {
  const builder = new AbilityBuilder<AppAbility>(createPrismaAbility)
  switch (user?.role) {
    case 'ADMIN':
      defineAdminRules(builder)
      break
    case 'READER':
      defineAnonymousRules(builder)
      builder.can('update', 'User', { id: user.id })
      builder.can('delete', 'User', { id: user.id })
      break
    default:
      defineAnonymousRules(builder)
      break
  }

  return builder.rules
}

function defineAdminRules({ can }: AbilityBuilder<AppAbility>) {
  can('manage', 'all')
}

function defineAnonymousRules({ can }: AbilityBuilder<AppAbility>) {
  can('readList', 'all')
  can('readDetails', 'all')
}
