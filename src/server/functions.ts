import { createServerFn } from '@tanstack/react-start'
import { getStore, nextId, resetStore } from '~/server/store'
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

export type NewMemberInput = {
  name: string
  role: Role
  /** 既存選手との紐付け */
  playerIds: Array<string>
  /** 新規に登録する子/自分 */
  newPlayers: Array<{ name: string; grade: number }>
}

export const registerMember = createServerFn({ method: 'POST' })
  .validator((data: NewMemberInput) => data)
  .handler(async ({ data }) => {
    const store = getStore()
    const createdIds = data.newPlayers
      .filter((p) => p.name.trim() !== '')
      .map((p) => {
        const player: Player = { id: nextId('p'), name: p.name.trim(), grade: p.grade }
        store.players.push(player)
        return player.id
      })
    const user: User = {
      id: nextId('u'),
      name: data.name.trim(),
      role: data.role,
      playerIds: [...new Set([...data.playerIds, ...createdIds])],
    }
    store.users.push(user)
    store.currentUserId = user.id
    return snapshot()
  })

export const linkPlayers = createServerFn({ method: 'POST' })
  .validator((data: { userId: string; playerIds: Array<string> }) => data)
  .handler(async ({ data }) => {
    const store = getStore()
    const user = store.users.find((u) => u.id === data.userId)
    if (user) user.playerIds = data.playerIds
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
