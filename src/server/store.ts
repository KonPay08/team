import type {
  MemberAttendance,
  Player,
  PlayerAttendance,
  TeamEvent,
  User,
} from '~/features/team/types'

export type Store = {
  teamName: string
  players: Array<Player>
  users: Array<User>
  events: Array<TeamEvent>
  playerAttendances: Array<PlayerAttendance>
  memberAttendances: Array<MemberAttendance>
  currentUserId: string | null
}

function dateAfter(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function seed(): Store {
  const players: Array<Player> = [
    { id: 'p1', name: '田中 蓮', grade: 6 },
    { id: 'p2', name: '佐藤 大翔', grade: 6 },
    { id: 'p3', name: '鈴木 陽菜', grade: 5 },
    { id: 'p4', name: '高橋 悠真', grade: 4 },
    { id: 'p5', name: '田中 陽向', grade: 3 },
  ]

  const users: Array<User> = [
    { id: 'u1', name: '山田 監督', role: 'coach', playerIds: [] },
    { id: 'u2', name: '田中 太郎（父）', role: 'parent', playerIds: ['p1', 'p5'] },
    { id: 'u3', name: '田中 花子（母）', role: 'parent', playerIds: ['p1', 'p5'] },
    { id: 'u4', name: '佐藤 恵（母）', role: 'parent', playerIds: ['p2'] },
    { id: 'u5', name: '田中 蓮', role: 'player', playerIds: ['p1'] },
  ]

  const events: Array<TeamEvent> = [
    {
      id: 'e1',
      type: 'practice',
      title: '全体練習',
      date: dateAfter(2),
      startTime: '09:00',
      endTime: '12:00',
      place: '第一グラウンド',
      note: '飲み物を多めに持参してください。',
    },
    {
      id: 'e2',
      type: 'game',
      title: '練習試合 vs 青空クラブ',
      date: dateAfter(6),
      startTime: '08:30',
      endTime: '15:00',
      place: '市営球場',
      note: '配車のため保護者の参加可否も回答してください。',
    },
    {
      id: 'e3',
      type: 'other',
      title: 'グラウンド整備',
      date: dateAfter(13),
      startTime: '10:00',
      endTime: '11:30',
      place: '第一グラウンド',
      note: '',
    },
  ]

  const now = new Date().toISOString()
  const playerAttendances: Array<PlayerAttendance> = [
    { eventId: 'e1', playerId: 'p1', status: 'attending', updatedByUserId: 'u3', updatedAt: now },
    { eventId: 'e1', playerId: 'p2', status: 'attending', updatedByUserId: 'u4', updatedAt: now },
    { eventId: 'e1', playerId: 'p4', status: 'absent', updatedByUserId: 'u1', updatedAt: now },
  ]

  const memberAttendances: Array<MemberAttendance> = [
    { eventId: 'e1', userId: 'u3', status: 'attending' },
  ]

  return {
    teamName: 'みどり台ジュニアベースボールクラブ',
    players,
    users,
    events,
    playerAttendances,
    memberAttendances,
    currentUserId: null,
  }
}

/**
 * Prototypeではin-memoryで保持する。Server再起動でSeedに戻る。
 */
const globalStore = globalThis as unknown as { __teamStore?: Store }

export function getStore(): Store {
  if (!globalStore.__teamStore) {
    globalStore.__teamStore = seed()
  }
  return globalStore.__teamStore
}

export function resetStore(): Store {
  globalStore.__teamStore = seed()
  return globalStore.__teamStore
}

export function nextId(prefix: string): string {
  return `${prefix}${Math.random().toString(36).slice(2, 8)}`
}
