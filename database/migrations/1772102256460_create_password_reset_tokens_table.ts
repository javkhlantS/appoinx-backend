import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'password_reset_tokens'

    async up() {
        this.schema.createTable('password_reset_tokens', (table) => {
            table.increments('id')
            table.integer('user_id').unsigned().references('users.id').onDelete('CASCADE')
            table.string('otp').notNullable() // hashed OTP
            table.string('reset_token').nullable() // issued after OTP verified
            table.boolean('otp_verified').defaultTo(false)
            table.timestamp('expires_at').notNullable()
            table.timestamp('created_at').notNullable()
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
