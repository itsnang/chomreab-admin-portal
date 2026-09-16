export interface SchoolSettings {
  schoolName: string
  lateCutoffMinutes: number
  absenceMessageTemplate: string
  telegramBotTokenSet: boolean
  /** The bot's own @username, fetched and cached server-side — never entered
   *  by an admin. `null` until a token has been saved and Telegram's `getMe`
   *  has succeeded at least once. Used to build invite deep links. */
  telegramBotUsername: string | null
}

export type TelegramWebhookStatus =
  | 'ok'
  | 'pointed_elsewhere'
  | 'not_registered'
  | 'no_token'
  | 'unreachable'

export interface TelegramStatus {
  status: TelegramWebhookStatus
  detail: string | null
  /** Where this deployment expects Telegram to deliver; `null` when the API
   *  has no public URL configured, which only happens in development. */
  expectedUrl: string | null
  /** Where Telegram is *actually* delivering right now. The pair is the whole
   *  point: our record of what we registered can drift from reality. */
  actualUrl: string | null
}
