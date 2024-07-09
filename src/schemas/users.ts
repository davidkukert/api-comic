import { z } from 'zod'

export const UserCreateInput = z.object({
  username: z.string(),
  password: z.string(),
})

export const UserUpdateInput = UserCreateInput.partial()

export const UserLoginInput = z.object({
  username: z.string(),
  password: z.string(),
})
