export interface SchoolSettings {
  schoolName: string
  lateCutoffMinutes: number
  absenceMessageTemplate: string
  /** The shared bot's own @username (ADR-0007 on the API: every School uses
   *  the same Telegram bot) — deployment config, never entered by an admin.
   *  `null` only if the deployment itself has no bot configured. */
  botUsername: string | null
}
