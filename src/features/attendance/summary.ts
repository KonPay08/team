import type { AttendanceStatus, PlayerAttendance, Player } from '~/features/team/types'

export type AttendanceSummary = {
  attending: number
  absent: number
  undecided: number
  total: number
  answered: number
}

export function statusOf(
  attendances: Array<PlayerAttendance>,
  eventId: string,
  playerId: string,
): AttendanceStatus {
  const found = attendances.find((a) => a.eventId === eventId && a.playerId === playerId)
  return found ? found.status : 'undecided'
}

export function summarizeEvent(
  players: Array<Player>,
  attendances: Array<PlayerAttendance>,
  eventId: string,
): AttendanceSummary {
  const summary: AttendanceSummary = {
    attending: 0,
    absent: 0,
    undecided: 0,
    total: players.length,
    answered: 0,
  }
  for (const player of players) {
    const status = statusOf(attendances, eventId, player.id)
    summary[status] += 1
    if (status !== 'undecided') summary.answered += 1
  }
  return summary
}

/** 自分が回答すべき（未回答の子がいる）イベントか。 */
export function needsAnswer(
  attendances: Array<PlayerAttendance>,
  eventId: string,
  playerIds: Array<string>,
): boolean {
  return playerIds.some((playerId) => statusOf(attendances, eventId, playerId) === 'undecided')
}
