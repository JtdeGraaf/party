import { z } from 'zod'
import { MAX_NAME_LENGTH } from '@/party/player-name'
import { readRoomCode } from '@/party/room-code'

/** Messages are i18n keys, turned into words where the form shows them. */

export const roomCodeFormSchema = z.object({
  code: z.string().refine((typed) => readRoomCode(typed) !== null, 'join.codeInvalid'),
})

export type RoomCodeForm = z.infer<typeof roomCodeFormSchema>

export const nameFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'join.nameRequired')
    .transform((typed) => typed.replace(/\s+/g, ' ').slice(0, MAX_NAME_LENGTH)),
})

export type NameForm = z.input<typeof nameFormSchema>
