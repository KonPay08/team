import { createServerFn } from '@tanstack/react-start'
import { getStore, nextId, nextInviteCode, resetStore } from '~/server/store'
import type {
  AttendanceStatus,
  EventType,
  MemberAttendance,
  Player,
  PlayerAttendance,
  Role,
  TeamEvent,
  User,
} from '~/features/team/types'

export type TeamSnapshot = {
  teamName: string
  staffInviteCode: string
  currentUser: User | null
  users: Array<User>
  players: Array<Player>
  events: Array<TeamEvent>
  playerAttendances: Array<PlayerAttendance>
  memberAttendances: Array<MemberAttendance>
}

function snapshot(): TeamSnapshot {
  const store = getStore()
  const events = [...store.events].sort((a, b) =>
    `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`),
  )
  return {
    teamName: store.teamName,
    staffInviteCode: store.staffInviteCode,
    currentUser: store.users.find((u) => u.id === store.currentUserId) ?? null,
    users: store.users,
    players: store.players,
    events,
    playerAttendances: store.playerAttendances,
    memberAttendances: store.memberAttendances,
  }
}

export const getTeam = createServerFn({ method: 'GET' }).handler(async () => snapshot())

export const selectUser = createServerFn({ method: 'POST' })
  .validator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const store = getStore()
    store.currentUserId = store.users.some((u) => u.id === data.userId) ? data.userId : null
    return snapshot()
  })

export const signOut = createServerFn({ method: 'POST' }).handler(async () => {
  getStore().currentUserId = null
  return snapshot()
})

export const resetTeam = createServerFn({ method: 'POST' }).handler(async () => {
  resetStore()
  return snapshot()
})

export type JoinInput = {
  /** 指導者が発行した招待コード（選手ごと、またはスタッフ共通） */
  code: string
  name: string
  /** 選手コードで参加するとき、保護者として参加するか本人として参加するか */
  as: 'parent' | 'player'
}

export type JoinResult = { ok: false; message: string } | { ok: true; snapshot: TeamSnapshot }

/**
 * 招待コードでチームに参加する。選手の新規作成は行わないため、
 * 父・母が別々に参加しても同じPlayerに紐付き、選手が重複しない。
 */
export const joinTeam = createServerFn({ method: 'POST' })
  .validator((data: JoinInput) => data)
  .handler(async ({ data }): Promise<JoinResult> => {
    const store = getStore()
    const name = data.name.trim()
    if (name === '') return { ok: false, message: '名前を入力してください' }

    const code = data.code.trim().toUpperCase()
    if (code === store.staffInviteCode) {
      const coach: User = { id: nextId('u'), name, role: 'coach', playerIds: [] }
      store.users.push(coach)
      store.currentUserId = coach.id
      return { ok: true, snapshot: snapshot() }
    }

    const player = store.players.find((p) => p.inviteCode === code)
    if (!player) {
      return { ok: false, message: '招待コードが見つかりません。指導者に確認してください' }
    }

    const role: Role = data.as
    const user: User = { id: nextId('u'), name, role, playerIds: [player.id] }
    store.users.push(user)
    store.currentUserId = user.id
    return { ok: true, snapshot: snapshot() }
  })

/** 選手の登録は指導者のみが行う（名簿はチームの資産）。 */
export const addPlayer = createServerFn({ method: 'POST' })
  .validator((data: { name: string; grade: number }) => data)
  .handler(async ({ data }) => {
    const store = getStore()
    const player: Player = {
      id: nextId('p'),
      name: data.name.trim(),
      grade: data.grade,
      inviteCode: nextInviteCode(),
    }
    store.players.push(player)
    return snapshot()
  })

export type NewEventInput = {
  type: EventType
  title: string
  date: string
  startTime: string
  endTime: string
  place: string
  note: string
}

export const createEvent = createServerFn({ method: 'POST' })
  .validator((data: NewEventInput) => data)
  .handler(async ({ data }) => {
    const store = getStore()
    const event: TeamEvent = { id: nextId('e'), ...data }
    store.events.push(event)
    return { snapshot: snapshot(), eventId: event.id }
  })

export const setPlayerAttendance = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      eventId: string
      playerId: string
      status: AttendanceStatus
      updatedByUserId: string
    }) => data,
  )
  .handler(async ({ data }) => {
    const store = getStore()
    const existing = store.playerAttendances.find(
      (a) => a.eventId === data.eventId && a.playerId === data.playerId,
    )
    const updatedAt = new Date().toISOString()
    if (existing) {
      existing.status = data.status
      existing.updatedByUserId = data.updatedByUserId
      existing.updatedAt = updatedAt
    } else {
      store.playerAttendances.push({ ...data, updatedAt })
    }
    return snapshot()
  })

export const setMemberAttendance = createServerFn({ method: 'POST' })
  .validator((data: { eventId: string; userId: string; status: AttendanceStatus }) => data)
  .handler(async ({ data }) => {
    const store = getStore()
    const existing = store.memberAttendances.find(
      (a) => a.eventId === data.eventId && a.userId === data.userId,
    )
    if (existing) {
      existing.status = data.status
    } else {
      store.memberAttendances.push(data)
    }
    return snapshot()
  })
