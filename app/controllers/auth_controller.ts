import User from '#models/user'
import { loginValidator, registerValidator } from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
    async login({ request }: HttpContext) {
        const payload = await loginValidator.validate(request.all())
        return payload
    }

    async registger({ request, response }: HttpContext) {
        const payload = await request.validateUsing(registerValidator)
        const userExists = await User.findBy('email', payload.email)

        if (userExists) {
            response.abort({ message: 'User with email already exists', status: 400 }, 400)
        }

        const newUser = await User.create({
            email: payload.email,
            password: payload.password,
            firstName: payload.firstName,
            lastName: payload.lastName,
        })
        return newUser
    }

    logout() {}

    me() {}
}
