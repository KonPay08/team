import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { getTeam, setPlayerAttendance } from '~/server/functions'
import {
  attendanceStatusLabel,
  eventTypeLabel,
  roleLabel,
  type AttendanceStatus,
} from '~/features/team/types'
import { statusOf, summarizeEvent } from '~/features/attendance/summary'
import { Card, formatDate, StatusButton, StatusPill, TypeBadge } from '~/components/ui'

export const Route = createFileRoute('/events/$eventId')({
  loader: () => getTeam(),
  component: EventDetail,
})

const answerOptions: Array<AttendanceStatus> = ['attending', 'absent']

function EventDetail() {
  const team = Route.useLoaderData()
  const { eventId } = Route.useParams()
  const router = useRouter()
  const event = team.events.find((e) => e.id === eventId)

  if (!event) {
    return (
      <Card>
        <p className="text-sm">イベントが見つかりません。</p>
        <Link to="/" className="mt-2 inline-block text-sm underline">
          予定一覧へ戻る
        </Link>
      </Card>
    )
  }

  const { currentUser, players, playerAttendances, memberAttendances, users } = team
  const summary = summarizeEvent(players, playerAttendances, event.id)
  const canEditAll = currentUser?.role === 'coach'
  const attendingMembers = memberAttendances
    .filter((m) => m.eventId === event.id && m.status === 'attending')
    .map((m) => users.find((u) => u.id === m.userId))
    .filter((u) => u !== undefined)

  return (
    <div className="space-y-4">
      <Link to="/" className="text-sm text-slate-500 underline">
        ← 予定一覧
      </Link>

      <Card>
        <div className="flex items-center gap-2">
          <TypeBadge type={event.type} label={eventTypeLabel[event.type]} />
          <span className="text-sm font-semibold">{formatDate(event.date)}</span>
        </div>
        <h1 className="mt-1 text-xl font-bold">{event.title}</h1>
        <p className="text-sm text-slate-600">
          {event.startTime}〜{event.endTime} / {event.place}
        </p>
        {event.note !== '' ? (
          <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{event.note}</p>
        ) : null}
        <p className="mt-3 text-sm">
          出席 <span className="font-bold text-emerald-700">{summary.attending}</span> / 欠席{' '}
          <span className="font-bold text-rose-700">{summary.absent}</span> / 未回答{' '}
          <span className="font-bold text-slate-500">{summary.undecided}</span>
          <span className="ml-2 text-xs text-slate-500">
            （回答 {summary.answered}/{summary.total}）
          </span>
        </p>
      </Card>

      <Card>
        <h2 className="text-base font-bold">選手の出欠</h2>
        <ul className="mt-3 divide-y divide-slate-100">
          {players.map((player) => {
            const status = statusOf(playerAttendances, event.id, player.id)
            const record = playerAttendances.find(
              (a) => a.eventId === event.id && a.playerId === player.id,
            )
            const answeredBy = users.find((u) => u.id === record?.updatedByUserId)
            const editable = canEditAll || (currentUser?.playerIds.includes(player.id) ?? false)
            return (
              <li key={player.id} className="flex items-center justify-between gap-2 py-2">
                <div>
                  <span className="text-sm font-medium">{player.name}</span>
                  <span className="ml-1 text-xs text-slate-400">{player.grade}年</span>
                  {answeredBy ? (
                    <span className="block text-xs text-slate-400">
                      回答：{answeredBy.name}
                    </span>
                  ) : null}
                </div>
                {editable ? (
                  <div className="flex gap-2">
                    {answerOptions.map((option) => (
                      <StatusButton
                        key={option}
                        status={option}
                        label={attendanceStatusLabel[option]}
                        active={status === option}
                        onClick={async () => {
                          if (!currentUser) return
                          await setPlayerAttendance({
                            data: {
                              eventId: event.id,
                              playerId: player.id,
                              status: option,
                              updatedByUserId: currentUser.id,
                            },
                          })
                          await router.invalidate()
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <StatusPill status={status} label={attendanceStatusLabel[status]} />
                )}
              </li>
            )
          })}
        </ul>
      </Card>

      <Card>
        <h2 className="text-base font-bold">参加する保護者・指導者</h2>
        {attendingMembers.length > 0 ? (
          <ul className="mt-2 space-y-1 text-sm">
            {attendingMembers.map((member) => (
              <li key={member.id}>
                {member.name}
                <span className="ml-1 text-xs text-slate-400">{roleLabel[member.role]}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-500">まだ回答がありません。</p>
        )}
      </Card>
    </div>
  )
}
