/**
 * The app's semantic colour roles. Everything that needs to be "the green one"
 * or "the amber one" names a tone rather than a colour, so the palette lives
 * only in `globals.css` and a component can never introduce a one-off shade.
 */
export type Tone = 'present' | 'late' | 'absent' | 'unmarked' | 'primary'

/** Foreground colour for a tone — numerals, icons, chip text. */
export const TONE_TEXT: Record<Tone, string> = {
  present: 'text-present',
  late: 'text-late',
  absent: 'text-absent',
  unmarked: 'text-unmarked',
  primary: 'text-primary',
}

/** Solid fill — status dots, selected pips. */
export const TONE_BG: Record<Tone, string> = {
  present: 'bg-present',
  late: 'bg-late',
  absent: 'bg-absent',
  unmarked: 'bg-unmarked',
  primary: 'bg-primary',
}

/** Tinted backing for a badge or a selected segment. */
export const TONE_MUTED_BG: Record<Tone, string> = {
  present: 'bg-present-muted',
  late: 'bg-late-muted',
  absent: 'bg-absent-muted',
  unmarked: 'bg-unmarked-muted',
  primary: 'bg-primary/10',
}

/** Border matching the tone, for selected outlines. */
export const TONE_BORDER: Record<Tone, string> = {
  present: 'border-present',
  late: 'border-late',
  absent: 'border-absent',
  unmarked: 'border-unmarked',
  primary: 'border-primary',
}
