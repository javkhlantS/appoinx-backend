import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class PasswordResetToken extends BaseModel {
    @column({ isPrimary: true })
    declare id: number

    @column()
    declare userId: number

    @column()
    declare otp: string

    @column()
    declare resetToken: string | null

    @column()
    declare otpVerified: boolean

    @column.dateTime()
    declare expiresAt: DateTime

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @belongsTo(() => User)
    declare user: BelongsTo<typeof User>

    get isExpired() {
        return this.expiresAt < DateTime.now()
    }
}
