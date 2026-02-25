import vine from '@vinejs/vine'
import { Infer } from '@vinejs/vine/types'

export const loginValidator = vine.create(
    vine.object({
        email: vine.string().trim().email(),
        password: vine.string().trim(),
    })
)

export const registerValidator = vine.create(
    vine.object({
        email: vine.string().trim().email().toLowerCase(),
        firstName: vine
            .string()
            .trim()
            .transform((v) => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()),
        lastName: vine
            .string()
            .trim()
            .transform((v) => v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()),
        password: vine.string().trim(),
        passwordConfirmation: vine.string().sameAs('password'),
    })
)

export type LoginPayload = Infer<typeof loginValidator>
export type RegisterPayload = Infer<typeof registerValidator>
