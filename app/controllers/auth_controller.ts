import PasswordResetToken from '#models/password_reset_token'
import User from '#models/user'
import {
    forgotPasswordValidator,
    loginValidator,
    registerValidator,
    resetPasswordValidator,
    verifyOtpValidator,
} from '#validators/auth'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import mail from '@adonisjs/mail/services/main'
import { DateTime } from 'luxon'
import crypto from 'node:crypto'

export default class AuthController {
    async login({ request }: HttpContext) {
        const payload = await request.validateUsing(loginValidator)

        const user = await User.verifyCredentials(payload.email, payload.password)
        const token = await User.accessTokens.create(user)

        return {
            data: token,
        }
    }

    async register({ request, response }: HttpContext) {
        const payload = await request.validateUsing(registerValidator)
        const userExists = await User.findBy('email', payload.email)

        if (userExists) {
            response.abort({ message: 'User with email already exists' }, 400)
        }

        const newUser = await User.create({
            email: payload.email,
            password: payload.password,
            firstName: payload.firstName,
            lastName: payload.lastName,
        })
        return {
            data: newUser,
        }
    }

    async logout({ auth }: HttpContext) {
        await User.accessTokens.deleteAll(auth.getUserOrFail())

        return {
            data: {
                success: true,
            },
        }
    }

    me({ auth }: HttpContext) {
        const user = auth.getUserOrFail()

        return {
            data: user,
        }
    }

    async forgotPassword({ request }: HttpContext) {
        const payload = await request.validateUsing(forgotPasswordValidator)
        const user = await User.findBy('email', payload.email)

        if (!user) {
            return {
                data: {
                    message: 'If email exists, an OTP has been sent.',
                },
            }
        }

        await PasswordResetToken.query().where('user_id', user.id).delete()

        const otp = crypto.randomInt(1000, 9999).toString()

        const hashedOtp = await hash.make(otp)

        await PasswordResetToken.create({
            userId: user.id,
            otp: hashedOtp,
            expiresAt: DateTime.now().plus({ minutes: 10 }),
        })

        await mail.send((message) => {
            message
                .to(user.email)
                .from('no-reply@appoinx.com')
                .subject('Your password reset OTP')
                .htmlView('emails/otp', { user, otp })
        })

        return {
            data: {
                message: 'If email exists, an OTP has been sent',
            },
        }
    }

    async verifyOtp({ request, response }: HttpContext) {
        const payload = await request.validateUsing(verifyOtpValidator)

        const user = await User.findBy('email', payload.email)
        if (!user) {
            return response.abort({ message: 'Invalid OTP' }, 400)
        }

        const record = await PasswordResetToken.query()
            .where('user_id', user.id)
            .where('otp_verified', false)
            .first()

        if (!record || record.isExpired) {
            return response.abort({ message: 'Invalid or expired OTP' }, 400)
        }

        const isValid = await hash.verify(record.otp, payload.otp)
        if (!isValid) {
            return response.abort({ message: 'Invalid OTP' }, 400)
        }

        const resetToken = crypto.randomBytes(32).toString('hex')

        record.otpVerified = true
        record.resetToken = resetToken
        record.expiresAt = DateTime.now().plus({ minutes: 15 })
        await record.save()

        return {
            data: {
                resetToken,
            },
        }
    }

    async resetPassword({ request, response }: HttpContext) {
        const payload = await request.validateUsing(resetPasswordValidator)

        const record = await PasswordResetToken.query()
            .where('reset_token', payload.resetToken)
            .where('otp_verified', true)
            .first()

        if (!record || record.isExpired) {
            return response.abort({ message: 'Invalid or expired reset token.' }, 400)
        }

        const user = await User.findOrFail(record.userId)

        user.password = payload.password
        await user.save()

        await record.delete()

        return {
            data: {
                message: 'Password reset successfully.',
            },
        }
    }
}
