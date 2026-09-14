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
