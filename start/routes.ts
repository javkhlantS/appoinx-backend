/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const AuthController = () => import('#controllers/auth_controller')

router
    .group(() => {
        router
            .group(() => {
                router.post('/login', [AuthController, 'login'])
                router.post('/register', [AuthController, 'registger'])
                router.post('/logout', [AuthController, 'logout'])
                router.get('/me', [AuthController, 'me'])
            })
            .prefix('/auth')
        router.group(() => {}).prefix('/public')
        router.group(() => {}).prefix('/admin')
    })
    .prefix('/api')
