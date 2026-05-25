'use client'

import { useId, useMemo, useState } from 'react'
import {
  GRADE_OPTIONS,
  GradeKey,
  IndexedParalelka,
  MAX_BAL,
  MAX_NVO_SCORE,
  PARALELKI_DATASET,
  PRIEM_YEAR,
  UNIQUE_PARALELKI,
  computeBal,
  formatBal,
  formatGap,
} from '@/lib/priem-bal'
import { cn } from '@/lib/utils'

type ScoreInputState = {
  raw: string
  error: string | null
  value: number | null
}

function parseScoreInput(raw: string): ScoreInputState {
  const trimmed = raw.trim().replace(',', '.')
  if (trimmed === '') {
    return { raw, error: 'Въведи точки от 0 до 100.', value: null }
  }
  const value = Number(trimmed)
  if (!Number.isFinite(value)) {
    return { raw, error: 'Невалидно число.', value: null }
  }
  if (value < 0 || value > MAX_NVO_SCORE) {
    return {
      raw,
      error: `Точките трябва да са от 0 до ${MAX_NVO_SCORE}.`,
      value: null,
    }
  }
  return { raw, error: null, value }
}

function ScoreInput({
  label,
  id,
  state,
  onChange,
}: {
  label: string
  id: string
  state: ScoreInputState
  onChange: (next: ScoreInputState) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-semibold text-text"
      >
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        max={MAX_NVO_SCORE}
        step="0.01"
        value={state.raw}
        onChange={(e) => onChange(parseScoreInput(e.target.value))}
        placeholder="0–100"
        aria-invalid={state.error !== null}
        aria-describedby={state.error ? `${id}-error` : undefined}
        className={cn(
          'input-field',
          state.error && 'border-danger/50 focus:border-danger focus:ring-danger/20',
        )}
      />
      {state.error && (
        <p id={`${id}-error`} className="text-xs font-medium text-danger">
          {state.error}
        </p>
      )}
    </div>
  )
}

function GradeSelect({
  label,
  id,
  value,
  onChange,
}: {
  label: string
  id: string
  value: GradeKey
  onChange: (next: GradeKey) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-text">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as GradeKey)}
        className="input-field appearance-none pr-10 bg-no-repeat bg-[right_0.85rem_center] bg-[length:1rem_1rem]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2364748B'><path fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 011.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z' clip-rule='evenodd'/></svg>\")",
        }}
      >
        {GRADE_OPTIONS.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.label} · {opt.points} т.
          </option>
        ))}
      </select>
    </div>
  )
}

export function PriemBalCalculator() {
  const idPrefix = useId()
  const [bel, setBel] = useState<ScoreInputState>({
    raw: '',
    error: null,
    value: null,
  })
  const [math, setMath] = useState<ScoreInputState>({
    raw: '',
    error: null,
    value: null,
  })
  const [grade1, setGrade1] = useState<GradeKey>('excellent_6')
  const [grade2, setGrade2] = useState<GradeKey>('excellent_6')
  const [paralelkaQuery, setParalelkaQuery] = useState('')
  const [selectedParalelka, setSelectedParalelka] = useState<string | null>(null)

  const inputsValid = bel.value !== null && math.value !== null
  const bal = inputsValid
    ? computeBal({
        nvoBel: bel.value!,
        nvoMath: math.value!,
        grade1,
        grade2,
      })
    : null

  const filteredOptions = useMemo(() => {
    const q = paralelkaQuery.trim().toLocaleLowerCase('bg-BG')
    if (q === '') return UNIQUE_PARALELKI
    return UNIQUE_PARALELKI.filter((p) =>
      p.name.toLocaleLowerCase('bg-BG').includes(q),
    )
  }, [paralelkaQuery])

  // Извеждаме селекцията от филтрираните опции — ако избраната паралелка
  // не присъства в текущото търсене, не показваме резултатна карта, дори
  // ако вътрешният state още я помни.
  const selected = useMemo(
    () =>
      selectedParalelka
        ? filteredOptions.find((p) => p.id === selectedParalelka) ?? null
        : null,
    [filteredOptions, selectedParalelka],
  )

  const qualifyingList = useMemo(() => {
    if (bal === null) return []
    return UNIQUE_PARALELKI.filter((p) => bal >= p.min_bal_obshto)
  }, [bal])

  const handleReset = () => {
    setBel({ raw: '', error: null, value: null })
    setMath({ raw: '', error: null, value: null })
    setGrade1('excellent_6')
    setGrade2('excellent_6')
    setParalelkaQuery('')
    setSelectedParalelka(null)
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Inputs panel */}
      <section className="card p-6 sm:p-8">
        <h2 className="section-title mb-1">Въведи резултатите си</h2>
        <p className="text-sm text-text-muted mb-6">
          Точките от двете НВО задължителни изпита (от 0 до 100) и две оценки от
          свидетелството за основно образование.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <ScoreInput
            id={`${idPrefix}-bel`}
            label="НВО Български език и литература"
            state={bel}
            onChange={setBel}
          />
          <ScoreInput
            id={`${idPrefix}-math`}
            label="НВО Математика"
            state={math}
            onChange={setMath}
          />
          <GradeSelect
            id={`${idPrefix}-grade1`}
            label="Оценка от свидетелството №1"
            value={grade1}
            onChange={setGrade1}
          />
          <GradeSelect
            id={`${idPrefix}-grade2`}
            label="Оценка от свидетелството №2"
            value={grade2}
            onChange={setGrade2}
          />
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col" aria-live="polite">
            <span className="section-label text-text-muted">Твоят бал</span>
            <span className="text-4xl font-extrabold tracking-[-0.03em] text-primary-dark">
              {bal === null ? '— ' : formatBal(bal)}
              <span className="text-xl font-bold text-text-muted ml-1">
                / {MAX_BAL}
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="btn-secondary self-start sm:self-auto"
          >
            Изчисти
          </button>
        </div>

        <p className="mt-3 text-xs text-text-light">
          Формула: бал = 2 × НВО БЕЛ + 2 × НВО Математика + точки за двете оценки.
        </p>
      </section>

      {/* Paralelka selector */}
      <section className="card p-6 sm:p-8">
        <h2 className="section-title mb-1">Провери конкретна паралелка</h2>
        <p className="text-sm text-text-muted mb-6">
          {PARALELKI_DATASET.metadata.unique_names} различни паралелки в София-град
          от приема за {PRIEM_YEAR} г.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`${idPrefix}-search`}
              className="text-sm font-semibold text-text"
            >
              Търси по име
            </label>
            <input
              id={`${idPrefix}-search`}
              type="search"
              value={paralelkaQuery}
              onChange={(e) => setParalelkaQuery(e.target.value)}
              placeholder="напр. Математически, Чужди езици..."
              className="input-field"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`${idPrefix}-select`}
              className="text-sm font-semibold text-text"
            >
              Избери паралелка
            </label>
            <select
              id={`${idPrefix}-select`}
              value={selectedParalelka ?? ''}
              onChange={(e) => setSelectedParalelka(e.target.value || null)}
              className="input-field appearance-none pr-10 bg-no-repeat bg-[right_0.85rem_center] bg-[length:1rem_1rem]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2364748B'><path fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 011.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z' clip-rule='evenodd'/></svg>\")",
              }}
            >
              <option value="">— Избери от списъка —</option>
              {filteredOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · мин. {formatBal(p.min_bal_obshto)}
                  {p.occurrences > 1 ? ` · ${p.occurrences} училища` : ''}
                </option>
              ))}
            </select>
            {paralelkaQuery.trim() !== '' && (
              <p className="text-xs text-text-light" aria-live="polite">
                Намерени {filteredOptions.length}{' '}
                {filteredOptions.length === 1 ? 'съвпадение' : 'съвпадения'}.
              </p>
            )}
          </div>
        </div>

        {/* Selected paralelka result */}
        {selected && (
          <SelectedParalelkaResult
            paralelka={selected}
            bal={bal}
          />
        )}
      </section>

      {/* Qualifying list */}
      <section className="card p-6 sm:p-8" aria-live="polite">
        <h2 className="section-title mb-1">Паралелки, в които влизаш</h2>
        <p className="text-sm text-text-muted mb-6">
          {bal === null
            ? 'Въведи резултатите си горе, за да видиш класирането.'
            : qualifyingList.length === 0
              ? 'С този бал няма паралелки от списъка, в които покриваш минималния праг.'
              : `${qualifyingList.length} ${
                  qualifyingList.length === 1 ? 'паралелка покрива' : 'паралелки покриват'
                } минималния си бал с твоите ${formatBal(bal)} т., подредени по най-висок праг.`}
        </p>

        {bal !== null && qualifyingList.length > 0 && (
          <QualifyingTable items={qualifyingList} userBal={bal} />
        )}
      </section>

      {/* Disclaimer */}
      <p className="text-xs text-text-muted text-center px-2">
        Данните са от справката на РУО София-град към {PARALELKI_DATASET.metadata.as_of}
        {' '}и са за приема през {PRIEM_YEAR} г. Стойностите са ориентировъчни — реалните
        прагове за следваща година ще се определят от класирането.
      </p>
    </div>
  )
}

function SelectedParalelkaResult({
  paralelka,
  bal,
}: {
  paralelka: IndexedParalelka
  bal: number | null
}) {
  const passes = bal !== null && bal >= paralelka.min_bal_obshto
  const gap = bal !== null ? bal - paralelka.min_bal_obshto : null

  return (
    <div
      role="status"
      className={cn(
        'mt-6 rounded-2xl border p-5 sm:p-6',
        bal === null
          ? 'border-slate-200 bg-slate-50'
          : passes
            ? 'border-success/40 bg-success-light'
            : 'border-danger/40 bg-danger-light',
      )}
    >
      <div className="flex flex-col gap-1 mb-4">
        <h3 className="text-base font-bold text-text leading-snug">
          {paralelka.name}
          {paralelka.occurrences > 1 && (
            <span className="ml-2 align-middle inline-flex items-center rounded-full bg-white/70 px-2 py-0.5 text-[0.6875rem] font-bold text-text-muted">
              {paralelka.occurrences} училища
            </span>
          )}
        </h3>
        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-text-muted sm:grid-cols-4">
          <Stat label="Мин. бал (общо)" value={formatBal(paralelka.min_bal_obshto)} />
          <Stat
            label="Макс. бал (общо)"
            value={paralelka.max_bal_obshto !== null ? formatBal(paralelka.max_bal_obshto) : '—'}
          />
          <Stat
            label="Мин. за момчета"
            value={paralelka.min_bal_men !== null ? formatBal(paralelka.min_bal_men) : '—'}
          />
          <Stat
            label="Мин. за момичета"
            value={paralelka.min_bal_women !== null ? formatBal(paralelka.min_bal_women) : '—'}
          />
        </dl>
      </div>

      {bal === null ? (
        <p className="text-sm text-text">
          Въведи валидни НВО резултати, за да сравним с тази паралелка.
        </p>
      ) : (
        <div className="flex items-start gap-3">
          <span
            className={cn(
              'inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-base font-bold',
              passes ? 'bg-success text-white' : 'bg-danger text-white',
            )}
            aria-hidden="true"
          >
            {passes ? '✓' : '✕'}
          </span>
          <div>
            <p className="text-sm font-bold text-text">
              {passes ? 'Покриваш минималния общ бал.' : 'Не покриваш минималния общ бал.'}
            </p>
            <p className="text-xs text-text-muted">
              {gap !== null && (
                <>
                  {formatGap(gap)} т. {gap >= 0 ? 'над минимума' : 'под минимума'}
                </>
              )}
            </p>
            {(paralelka.min_bal_men !== null || paralelka.min_bal_women !== null) && (
              <p className="mt-1 text-xs text-text-light">
                Прагът за момчета/момичета може да е по-висок от общия (виж горе).
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[0.625rem] font-bold uppercase tracking-[0.08em] text-text-light">
        {label}
      </dt>
      <dd className="font-semibold text-text">{value}</dd>
    </div>
  )
}

function QualifyingTable({
  items,
  userBal,
}: {
  items: ReadonlyArray<IndexedParalelka>
  userBal: number
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100">
      <table className="w-full text-sm">
        <caption className="sr-only">
          Паралелки, в които покриваш минималния бал, подредени по най-висок праг.
        </caption>
        <thead>
          <tr className="bg-slate-50 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-text-muted">
            <th scope="col" className="px-4 py-3 text-left">
              Паралелка
            </th>
            <th scope="col" className="px-4 py-3 text-right whitespace-nowrap">
              Мин. бал
            </th>
            <th scope="col" className="px-4 py-3 text-right whitespace-nowrap">
              Макс. бал
            </th>
            <th scope="col" className="px-4 py-3 text-right whitespace-nowrap">
              Разлика
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((p) => {
            const diff = userBal - p.min_bal_obshto
            return (
              <tr key={p.id}>
                <th
                  scope="row"
                  className="px-4 py-3 text-left font-semibold text-text leading-snug"
                >
                  {p.name}
                  {p.occurrences > 1 && (
                    <span className="ml-2 text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-text-light">
                      · {p.occurrences} училища
                    </span>
                  )}
                </th>
                <td className="px-4 py-3 text-right text-text-muted whitespace-nowrap tabular-nums">
                  {formatBal(p.min_bal_obshto)}
                </td>
                <td className="px-4 py-3 text-right text-text-muted whitespace-nowrap tabular-nums">
                  {p.max_bal_obshto !== null ? formatBal(p.max_bal_obshto) : '—'}
                </td>
                <td
                  className={cn(
                    'px-4 py-3 text-right font-bold whitespace-nowrap tabular-nums',
                    diff >= 0 ? 'text-success' : 'text-danger',
                  )}
                >
                  {formatGap(diff)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
