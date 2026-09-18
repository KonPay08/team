import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { getTeam, setMemberAttendance, setPlayerAttendance } from '~/server/functions'
import {
  attendanceStatusLabel,
  eventTypeLabel,
  type AttendanceStatus,
} from '~/features/team/types'
import { needsAnswer, statusOf, summarizeEvent } from '~/features/attendance/summary'
import { Card, formatDate, StatusButton, TypeBadge } from '~/components/ui'

export const Route = createFileRoute('/')({
  loader: () => getTeam(),
  component: Home,
})

const answerOptions: Array<AttendanceStatus> = ['attending', 'absent']

function Home() {
  const team = Route.useLoaderData()
  const router = useRouter()
  const { currentUser, players, events, playerAttendances, memberAttendances } = team

  if (!currentUser) {
    return (
      <Card>
        <h1 className="text-xl font-bold">ようこそ</h1>
        <p className="mt-2 text-sm text-slate-600">
          指導者から届いた招待コードを入力すると、お子さんと紐付いて準備完了です。
        </p>
        <Link
          to="/setup"
          className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          初期設定をはじめる
        </Link>
      </Card>
    )
  }

  const myPlayers = players.filter((p) => currentUser.playerIds.includes(p.id))
  const pending = events.filter((e) => needsAnswer(playerAttendances, e.id, currentUser.playerIds))

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold">予定と出欠</h1>
          <p className="text-sm text-slate-600">
            {myPlayers.length > 0
              ? `${myPlayers.map((p) => p.name).join('・')} の出欠を回答できます`
              : 'チーム全体の出欠を確認できます'}
          </p>
        </div>
        {currentUser.role === 'coach' ? (
          <div className="flex shrink-0 gap-2">
            <Link
              to="/roster"
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              名簿と招待
            </Link>
            <Link
              to="/events/new"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              イベント作成
            </Link>
          </div>
        ) : null}
      </div>

      {myPlayers.length > 0 ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {pending.length > 0
            ? `未回答が ${pending.length} 件あります`
            : 'すべてのイベントに回答済みです'}
        </p>
      ) : null}

      {events.map((event) => {
        const summary = summarizeEvent(players, playerAttendances, event.id)
        const myStatus =
          memberAttendances.find((m) => m.eventId === event.id && m.userId === currentUser.id)
            ?.status ?? 'undecided'
        return (
          <Card key={event.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <TypeBadge type={event.type} label={eventTypeLabel[event.type]} />
                  <span className="text-sm font-semibold">{formatDate(event.date)}</span>
                </div>
                <h2 className="mt-1 text-lg font-bold">{event.title}</h2>
                <p className="text-sm text-slate-600">
                  {event.startTime}〜{event.endTime} / {event.place}
                </p>
              </div>
              <Link
                to="/events/$eventId"
                params={{ eventId: event.id }}
                className="shrink-0 text-sm text-slate-500 underline"
              >
                出欠一覧
              </Link>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              出席 {summary.attending} / 欠席 {summary.absent} / 未回答 {summary.undecided}
            </p>

            {myPlayers.length > 0 ? (
              <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                {myPlayers.map((player) => {
                  const status = statusOf(playerAttendances, event.id, player.id)
                  return (
                    <div key={player.id} className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">
                        {player.name}
                        <span className="ml-1 text-xs text-slate-400">{player.grade}年</span>
                      </span>
                      <div className="flex gap-2">
                        {answerOptions.map((option) => (
                          <StatusButton
                            key={option}
                            status={option}
                            label={attendanceStatusLabel[option]}
                            active={status === option}
                            onClick={async () => {
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
                    </div>
                  )
                })}
              </div>
            ) : null}

            {currentUser.role !== 'player' ? (
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <span className="text-sm text-slate-600">
                  {currentUser.role === 'coach' ? '自分の参加' : '保護者の帯同・お手伝い'}
                </span>
                <div className="flex gap-2">
                  {answerOptions.map((option) => (
                    <StatusButton
                      key={option}
                      status={option}
                      label={attendanceStatusLabel[option]}
                      active={myStatus === option}
                      onClick={async () => {
                        await setMemberAttendance({
                          data: { eventId: event.id, userId: currentUser.id, status: option },
                        })
                        await router.invalidate()
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </Card>
        )
      })}
    </div>
  )
}
