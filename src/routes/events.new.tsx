import { useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { createEvent, getTeam } from '~/server/functions'
import { eventTypeLabel, type EventType } from '~/features/team/types'
import { Card, Field, inputClass, PrimaryButton } from '~/components/ui'

export const Route = createFileRoute('/events/new')({
  loader: () => getTeam(),
  component: NewEvent,
})

const types: Array<EventType> = ['practice', 'game', 'other']

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function NewEvent() {
  const router = useRouter()
  const [type, setType] = useState<EventType>('practice')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(today())
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('12:00')
  const [place, setPlace] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  async function submit() {
    if (title.trim() === '' || place.trim() === '') {
      setError('タイトルと場所を入力してください')
      return
    }
    const result = await createEvent({
      data: { type, title: title.trim(), date, startTime, endTime, place: place.trim(), note },
    })
    await router.invalidate()
    router.navigate({ to: '/events/$eventId', params: { eventId: result.eventId } })
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">イベント作成</h1>
      <Card>
        <div className="space-y-4">
          <div>
            <span className="mb-1 block text-sm font-medium text-slate-700">種別</span>
            <div className="flex gap-2">
              {types.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${type === t ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-600'}`}
                >
                  {eventTypeLabel[t]}
                </button>
              ))}
            </div>
          </div>

          <Field label="タイトル">
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：全体練習"
            />
          </Field>

          <Field label="日付">
            <input
              type="date"
              className={inputClass}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>

          <div className="flex gap-3">
            <Field label="開始">
              <input
                type="time"
                className={inputClass}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </Field>
            <Field label="終了">
              <input
                type="time"
                className={inputClass}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </Field>
          </div>

          <Field label="場所">
            <input
              className={inputClass}
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="例：第一グラウンド"
            />
          </Field>

          <Field label="連絡事項">
            <textarea
              className={inputClass}
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Field>

          {error !== '' ? <p className="text-sm text-rose-600">{error}</p> : null}

          <PrimaryButton onClick={submit}>作成する</PrimaryButton>
        </div>
      </Card>
    </div>
  )
}
