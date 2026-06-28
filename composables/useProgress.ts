// Lernfortschritt mit Leitner-System (Boxen 1..5) pro Profil im localStorage.
// Schwere Items (niedrige Box / noch nie gesehen) werden bevorzugt abgefragt.

export interface ItemStat {
  box: number // 1 (schwer) .. 5 (sitzt)
  seen: number
  correct: number
  lastSeen: number
}

const MAX_BOX = 5

export function useProgress() {
  const { current } = useProfile()
  const all = useState<Record<string, Record<string, ItemStat>>>('swq-progress', () => ({}))

  function ensure(profile: string) {
    if (!all.value[profile]) {
      all.value = { ...all.value, [profile]: lsGet<Record<string, ItemStat>>(`swq:progress:${profile}`, {}) }
    }
  }

  function store(): Record<string, ItemStat> {
    ensure(current.value)
    return all.value[current.value]
  }

  function persist() {
    lsSet(`swq:progress:${current.value}`, all.value[current.value])
  }

  function stat(id: string): ItemStat | undefined {
    return store()[id]
  }

  function record(id: string, correct: boolean) {
    const s = store()
    const prev = s[id] ?? { box: 1, seen: 0, correct: 0, lastSeen: 0 }
    const box = correct ? Math.min(MAX_BOX, prev.box + 1) : 1 // falsch -> zurück in Box 1
    s[id] = {
      box,
      seen: prev.seen + 1,
      correct: prev.correct + (correct ? 1 : 0),
      lastSeen: Date.now(),
    }
    all.value = { ...all.value }
    persist()
  }

  /** Auswahlgewicht: ungesehen am höchsten, dann fallend mit der Box. */
  function weight(id: string): number {
    const s = store()[id]
    if (!s) return 6
    return Math.max(1, MAX_BOX + 1 - s.box)
  }

  /** Gewichtete Zufallsauswahl des nächsten Items; vermeidet das zuletzt gezeigte. */
  function pickNext(ids: string[], avoid?: string): string {
    const pool = ids.length > 1 && avoid ? ids.filter((i) => i !== avoid) : ids
    const weights = pool.map(weight)
    const total = weights.reduce((a, b) => a + b, 0)
    let r = Math.random() * total
    for (let i = 0; i < pool.length; i++) {
      r -= weights[i]
      if (r <= 0) return pool[i]
    }
    return pool[pool.length - 1]
  }

  /** Beherrschung einer Item-Menge: 0..1 anhand der Boxen. */
  function mastery(ids: string[]) {
    const s = store()
    let sum = 0
    let mastered = 0
    let seen = 0
    for (const id of ids) {
      const it = s[id]
      if (it) {
        seen++
        sum += (it.box - 1) / (MAX_BOX - 1)
        if (it.box >= 4) mastered++
      }
    }
    return {
      ratio: ids.length ? sum / ids.length : 0,
      mastered,
      seen,
      total: ids.length,
    }
  }

  function resetAll() {
    all.value = { ...all.value, [current.value]: {} }
    persist()
  }

  return { stat, record, pickNext, mastery, weight, resetAll }
}
