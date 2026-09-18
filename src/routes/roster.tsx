import { useState } from 'react'
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { addPlayer, getTeam } from '~/server/functions'
import { roleLabel } from '~/features/team/types'
import { Card, Field, inputClass, PrimaryButton } from '~/components/ui'

export const Route = createFileRoute('/roster')({
  loader: () => getTeam(),
  component: Roster,
})

function Roster() {
  const team = Route.useLoaderData()
  const router = useRouter()
  const [name, setName] = useState('')
  const [grade, setGrade] = useState(3)
  const [error, setError] = useState('')

  if (team.currentUser?.role !== 'coach') {
    return (
      <Card>
        <p className="text-sm text-slate-600">選手名簿は指導者のみが編集できます。</p>
        <Link to="/" className="mt-3 inline-block text-sm text-slate-500 underline">
          ← 予定一覧
        </Link>
      </Card>
    )
  }

  async function submit() {
    if (name.trim() === '') {
      setError('選手の名前を入力してください')
      return
    }
    setError('')
    await addPlayer({ data: { name, grade } })
    setName('')
    await router.invalidate()
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">選手名簿と招待</h1>
        <p className="text-sm text-slate-600">
          選手は指導者が登録し、ご家庭には招待コードを配ります。父・母が同じコードで参加しても選手は重複しません。
        </p>
      </div>

      <Card>
        <p className="text-sm font-semibold">指導者・スタッフ用コード</p>
        <p className="mt-1 font-mono text-lg tracking-widest">{team.staffInviteCode}</p>
        <p className="mt-1 text-xs text-slate-500">
          コーチやお手伝いスタッフにはこのコードを渡します。
        </p>
      </Card>

      <Card>
        <h2 className="text-base font-bold">選手を登録する</h2>
        <div className="mt-3 space-y-3">
          <Field label="選手の名前">
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：田中 蓮"
            />
          </Field>
          <Field label="学年">
            <select
              className={inputClass}
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <option key={g} value={g}>
                  {g}年
                </option>
              ))}
            </select>
          </Field>
          {error !== '' ? <p className="text-sm text-rose-600">{error}</p> : null}
          <PrimaryButton onClick={submit}>登録して招待コードを発行</PrimaryButton>
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-bold">名簿</h2>
        <ul className="mt-3 divide-y divide-slate-100">
          {team.players.map((player) => {
            const members = team.users.filter((u) => u.playerIds.includes(player.id))
            return (
              <li key={player.id} className="flex items-start justify-between gap-3 py-3">
                <div>
                  <span className="text-sm font-medium">{player.name}</span>
                  <span className="ml-1 text-xs text-slate-400">{player.grade}年</span>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {members.length > 0
                      ? members.map((m) => `${m.name}（${roleLabel[m.role]}）`).join('・')
                      : 'まだ誰も参加していません'}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 font-mono text-sm tracking-widest">
                  {player.inviteCode}
                </span>
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}
