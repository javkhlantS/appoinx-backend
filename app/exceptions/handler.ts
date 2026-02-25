import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import { errors } from '@vinejs/vine'
import { Exception } from '@adonisjs/core/exceptions'

export default class HttpExceptionHandler extends ExceptionHandler {
    /**
     * In debug mode, the exception handler will display verbose errors
     * with pretty printed stack traces.
     */
    protected debug = !app.inProduction

    /**
     * The method is used for handling errors and returning
     * response to the client
     */
    async handle(error: unknown, ctx: HttpContext) {
        const { response } = ctx

        // VineJS validation error
        if (error instanceof errors.E_VALIDATION_ERROR) {
            return response.status(422).json({
                data: null,
                error: {
                    status: 422,
                    name: 'ValidationError',
                    message: 'Validation failed',
                    details: error.messages, // field-level errors
                },
            })
        }

        if (error instanceof Exception) {
            return response.status(error.status).json({
                data: null,
                error: {
                    status: error.status,
                    name: 'ApplicationError',
                    message: error.message,
                    details: {},
                },
            })
        }

        // Generic error
        return response.status(500).json({
            data: null,
            error: {
                status: 500,
                name: 'ApplicationError',
                message: 'An error occurred',
                details: {},
            },
        })
    }

    /**
     * The method is used to report error to the logging service or
     * the third party error monitoring service.
     *
     * @note You should not attempt to send a response from this method.
     */
    async report(error: unknown, ctx: HttpContext) {
        return super.report(error, ctx)
    }
}
