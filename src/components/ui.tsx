import type { ReactNode } from 'react'
import type { AttendanceStatus, EventType } from '~/features/team/types'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

const eventTypeClass: Record<EventType, string> = {
  practice: 'bg-emerald-100 text-emerald-800',
  game: 'bg-orange-100 text-orange-800',
  other: 'bg-slate-100 text-slate-700',
}

export function TypeBadge({ type, label }: { type: EventType; label: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${eventTypeClass[type]}`}>
      {label}
    </span>
  )
}

const statusClass: Record<AttendanceStatus, string> = {
  attending: 'bg-emerald-600 text-white border-emerald-600',
  absent: 'bg-rose-600 text-white border-rose-600',
  undecided: 'bg-slate-200 text-slate-700 border-slate-200',
}

export function StatusPill({ status, label }: { status: AttendanceStatus; label: string }) {
  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${statusClass[status]}`}>
      {label}
    </span>
  )
}

export function StatusButton({
  status,
  label,
  active,
  onClick,
}: {
  status: AttendanceStatus
  label: string
  active: boolean
  onClick: () => void
}) {
  const base = 'rounded-lg border px-3 py-1.5 text-sm font-semibold transition'
  const inactive = 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'
  return (
    <button type="button" onClick={onClick} className={`${base} ${active ? statusClass[status] : inactive}`}>
      {label}
    </button>
  )
}

export function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
}: {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
    >
      {children}
    </button>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  )
}

export const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none'

export function formatDate(date: string): string {
  const d = new Date(`${date}T00:00:00`)
  const week = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]
  return `${d.getMonth() + 1}月${d.getDate()}日(${week})`
}
