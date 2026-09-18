import { useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getTeam, registerMember, selectUser } from '~/server/functions'
import { roleLabel, type Role } from '~/features/team/types'
import { Card, Field, inputClass, PrimaryButton } from '~/components/ui'

export const Route = createFileRoute('/setup')({
  loader: () => getTeam(),
  component: Setup,
})

const roles: Array<Role> = ['parent', 'coach', 'player']

const roleHelp: Record<Role, string> = {
  parent: 'お子さんの出欠を回答します。父・母それぞれが登録しても、子の出欠は1つに共有されます。',
  coach: 'イベントを作成し、チーム全体の出欠を確認します。',
  player: '自分の出欠を回答します。',
}

function Setup() {
  const team = Route.useLoaderData()
  const router = useRouter()
  const [mode, setMode] = useState<'select' | 'create'>('select')
  const [role, setRole] = useState<Role>('parent')
  const [name, setName] = useState('')
  const [playerIds, setPlayerIds] = useState<Array<string>>([])
  const [newPlayerName, setNewPlayerName] = useState('')
  const [newPlayerGrade, setNewPlayerGrade] = useState(3)
  const [error, setError] = useState('')

  const needsPlayer = role === 'parent' || role === 'player'

  async function submit() {
    if (name.trim() === '') {
      setError('名前を入力してください')
      return
    }
    if (needsPlayer && playerIds.length === 0 && newPlayerName.trim() === '') {
      setError(role === 'parent' ? 'お子さんを選ぶか、新しく追加してください' : '自分の選手登録を選ぶか、新しく追加してください')
      return
    }
    await registerMember({
      data: {
        name,
        role,
        playerIds: needsPlayer ? playerIds : [],
        newPlayers:
          needsPlayer && newPlayerName.trim() !== ''
            ? [{ name: newPlayerName, grade: newPlayerGrade }]
            : [],
      },
    })
    await router.invalidate()
    router.navigate({ to: '/' })
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">初期設定</h1>
        <p className="text-sm text-slate-600">1ステップで完了します。あとから切替もできます。</p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('select')}
          className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${mode === 'select' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-600'}`}
        >
          登録済みから選ぶ
        </button>
        <button
          type="button"
          onClick={() => setMode('create')}
          className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${mode === 'create' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-600'}`}
        >
          新しく登録する
        </button>
      </div>

      {mode === 'select' ? (
        <Card>
          <h2 className="text-base font-bold">あなたは誰ですか？</h2>
          <ul className="mt-3 space-y-2">
            {team.users.map((user) => {
              const children = team.players.filter((p) => user.playerIds.includes(p.id))
              return (
                <li key={user.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left hover:bg-slate-50"
                    onClick={async () => {
                      await selectUser({ data: { userId: user.id } })
                      await router.invalidate()
                      router.navigate({ to: '/' })
                    }}
                  >
                    <span>
                      <span className="text-sm font-semibold">{user.name}</span>
                      <span className="ml-2 text-xs text-slate-500">{roleLabel[user.role]}</span>
                      {children.length > 0 ? (
                        <span className="block text-xs text-slate-500">
                          {user.role === 'player' ? '選手' : 'お子さん'}：
                          {children.map((c) => c.name).join('・')}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-sm text-slate-400">選ぶ</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </Card>
      ) : (
        <Card>
          <div className="space-y-4">
            <div>
              <span className="mb-1 block text-sm font-medium text-slate-700">立場</span>
              <div className="flex gap-2">
                {roles.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${role === r ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-600'}`}
                  >
                    {roleLabel[r]}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">{roleHelp[role]}</p>
            </div>

            <Field label="あなたの名前">
              <input
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例：田中 太郎（父）"
              />
            </Field>

            {needsPlayer ? (
              <div className="space-y-2">
                <span className="block text-sm font-medium text-slate-700">
                  {role === 'parent' ? 'お子さんを選ぶ' : '自分の選手登録を選ぶ'}
                </span>
                <div className="space-y-1">
                  {team.players.map((player) => (
                    <label
                      key={player.id}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={playerIds.includes(player.id)}
                        onChange={(e) =>
                          setPlayerIds((prev) =>
                            e.target.checked
                              ? [...prev, player.id]
                              : prev.filter((id) => id !== player.id),
                          )
                        }
                      />
                      <span>
                        {player.name}
                        <span className="ml-1 text-xs text-slate-400">{player.grade}年</span>
                      </span>
                    </label>
                  ))}
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-600">
                    名簿にいない場合はここで追加できます。
                  </p>
                  <div className="mt-2 flex gap-2">
                    <input
                      className={inputClass}
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      placeholder="選手の名前"
                    />
                    <select
                      className={inputClass}
                      value={newPlayerGrade}
                      onChange={(e) => setNewPlayerGrade(Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5, 6].map((g) => (
                        <option key={g} value={g}>
                          {g}年
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : null}

            {error !== '' ? <p className="text-sm text-rose-600">{error}</p> : null}

            <PrimaryButton onClick={submit}>設定を完了する</PrimaryButton>
          </div>
        </Card>
      )}
    </div>
  )
}
