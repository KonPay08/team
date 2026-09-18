import { useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getTeam, joinTeam, selectUser } from '~/server/functions'
import { roleLabel } from '~/features/team/types'
import { Card, Field, inputClass, PrimaryButton } from '~/components/ui'

export const Route = createFileRoute('/setup')({
  loader: () => getTeam(),
  component: Setup,
})

function Setup() {
  const team = Route.useLoaderData()
  const router = useRouter()
  const [mode, setMode] = useState<'join' | 'select'>('join')
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [as, setAs] = useState<'parent' | 'player'>('parent')
  const [error, setError] = useState('')

  async function submit() {
    setError('')
    const result = await joinTeam({ data: { code, name, as } })
    if (!result.ok) {
      setError(result.message)
      return
    }
    await router.invalidate()
    router.navigate({ to: '/' })
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">初期設定</h1>
        <p className="text-sm text-slate-600">
          指導者から届いた招待コードを入れるだけで完了します。
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('join')}
          className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${mode === 'join' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-600'}`}
        >
          招待コードで参加
        </button>
        <button
          type="button"
          onClick={() => setMode('select')}
          className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${mode === 'select' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-600'}`}
        >
          登録済みから選ぶ
        </button>
      </div>

      {mode === 'join' ? (
        <Card>
          <div className="space-y-4">
            <Field label="招待コード">
              <input
                className={inputClass}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="例：REN001"
              />
            </Field>
            <p className="text-xs text-slate-500">
              お子さんごとにコードが発行されます。父・母が同じコードで参加しても、お子さんの出欠は1つに共有されます。指導者・スタッフはチーム共通コードを使います。
            </p>

            <Field label="あなたの名前">
              <input
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例：田中 太郎（父）"
              />
            </Field>

            <div>
              <span className="mb-1 block text-sm font-medium text-slate-700">あなたの立場</span>
              <div className="flex gap-2">
                {(['parent', 'player'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setAs(r)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${as === r ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-600'}`}
                  >
                    {r === 'parent' ? '保護者' : '選手本人'}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                スタッフ用コードの場合、この選択は使われず指導者として登録されます。
              </p>
            </div>

            {error !== '' ? <p className="text-sm text-rose-600">{error}</p> : null}

            <PrimaryButton onClick={submit}>参加する</PrimaryButton>
          </div>
        </Card>
      ) : (
        <Card>
          <h2 className="text-base font-bold">あなたは誰ですか？</h2>
          <p className="mt-1 text-xs text-slate-500">
            デモ用に、登録済みのメンバーへ切り替えられます。
          </p>
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
      )}
    </div>
  )
}
