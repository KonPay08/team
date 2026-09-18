import { describe, expect, it } from 'vitest'
import { needsAnswer, statusOf, summarizeEvent } from './summary'
import type { Player, PlayerAttendance } from '~/features/team/types'

const players: Array<Player> = [
  { id: 'p1', name: 'A', grade: 6, inviteCode: 'AAA111' },
  { id: 'p2', name: 'B', grade: 5, inviteCode: 'BBB222' },
  { id: 'p3', name: 'C', grade: 4, inviteCode: 'CCC333' },
]

const attendances: Array<PlayerAttendance> = [
  { eventId: 'e1', playerId: 'p1', status: 'attending', updatedByUserId: 'u2', updatedAt: '' },
  { eventId: 'e1', playerId: 'p2', status: 'absent', updatedByUserId: 'u3', updatedAt: '' },
]

describe('attendance summary', () => {
  it('未回答はundecidedとして扱う', () => {
    expect(statusOf(attendances, 'e1', 'p3')).toBe('undecided')
    expect(statusOf(attendances, 'e1', 'p1')).toBe('attending')
  })

  it('イベント単位で集計する', () => {
    expect(summarizeEvent(players, attendances, 'e1')).toEqual({
      attending: 1,
      absent: 1,
      undecided: 1,
      total: 3,
      answered: 2,
    })
  })

  it('自分の子に未回答があるときだけ回答が必要', () => {
    expect(needsAnswer(attendances, 'e1', ['p1', 'p2'])).toBe(false)
    expect(needsAnswer(attendances, 'e1', ['p1', 'p3'])).toBe(true)
  })
})
