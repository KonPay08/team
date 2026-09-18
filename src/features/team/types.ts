export type Role = 'coach' | 'parent' | 'player'

export type EventType = 'practice' | 'game' | 'other'

export type AttendanceStatus = 'attending' | 'absent' | 'undecided'

export type Player = {
  id: string
  name: string
  grade: number
  /** 保護者・本人がこの選手に紐付くための招待コード。指導者が発行する。 */
  inviteCode: string
}

export type User = {
  id: string
  name: string
  role: Role
  /** parent: 紐付けた子。player: 自分自身。coach: 空。 */
  playerIds: Array<string>
}

export type TeamEvent = {
  id: string
  type: EventType
  title: string
  /** YYYY-MM-DD */
  date: string
  startTime: string
  endTime: string
  place: string
  note: string
}

/** 選手の出欠。両親どちらが回答しても同じ1件を更新する。 */
export type PlayerAttendance = {
  eventId: string
  playerId: string
  status: AttendanceStatus
  updatedByUserId: string
  updatedAt: string
}

/** 保護者・指導者本人の参加（帯同・お手伝い）。 */
export type MemberAttendance = {
  eventId: string
  userId: string
  status: AttendanceStatus
}

export const eventTypeLabel: Record<EventType, string> = {
  practice: '練習',
  game: '試合',
  other: 'その他',
}

export const attendanceStatusLabel: Record<AttendanceStatus, string> = {
  attending: '出席',
  absent: '欠席',
  undecided: '未定',
}

export const roleLabel: Record<Role, string> = {
  coach: '指導者',
  parent: '保護者',
  player: '選手',
}
