/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

const AuthController = () => import('#controllers/auth_controller')

router
    .group(() => {
        router
            .group(() => {
                router.post('/login', [AuthController, 'login'])
                router.post('/register', [AuthController, 'register'])
                router.post('/logout', [AuthController, 'logout']).use(
                    middleware.auth({
                        guards: ['api'],
                    })
                )
                router.get('/me', [AuthController, 'me']).use(
                    middleware.auth({
                        guards: ['api'],
                    })
                )

                router.post('/forgot-password', [AuthController, 'forgotPassword'])
                router.post('/verify-otp', [AuthController, 'verifyOtp'])
                router.post('/reset-password', [AuthController, 'resetPassword'])
                router.post('/resend-otp', [AuthController, 'forgotPassword'])
            })
            .prefix('/auth')
        router
            .group(() => {})
            .prefix('/public')
            .use(
                middleware.auth({
                    guards: ['api'],
                })
            )
        router
            .group(() => {})
            .prefix('/admin')
            .use(
                middleware.auth({
                    guards: ['api'],
                })
            )
    })
    .prefix('/api')
