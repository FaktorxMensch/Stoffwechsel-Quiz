// Mehrere Lernprofile pro Browser (kein Backend/Auth). Fortschritt wird pro Profil gespeichert.

const PROFILES_KEY = 'swq:profiles'
const CURRENT_KEY = 'swq:profile'

export function useProfile() {
  const profiles = useState<string[]>('swq-profiles', () => ['Standard'])
  const current = useState<string>('swq-current-profile', () => 'Standard')

  if (import.meta.client) {
    const stored = lsGet<string[]>(PROFILES_KEY, ['Standard'])
    profiles.value = stored.length ? stored : ['Standard']
    const cur = lsGet<string>(CURRENT_KEY, profiles.value[0])
    current.value = profiles.value.includes(cur) ? cur : profiles.value[0]
  }

  function persist() {
    lsSet(PROFILES_KEY, profiles.value)
    lsSet(CURRENT_KEY, current.value)
  }

  function addProfile(name: string) {
    const n = name.trim()
    if (!n || profiles.value.includes(n)) return
    profiles.value.push(n)
    current.value = n
    persist()
  }

  function switchProfile(name: string) {
    if (!profiles.value.includes(name)) return
    current.value = name
    persist()
  }

  function removeProfile(name: string) {
    if (profiles.value.length <= 1) return
    profiles.value = profiles.value.filter((p) => p !== name)
    if (current.value === name) current.value = profiles.value[0]
    lsSet(`swq:progress:${name}`, null) // Fortschritt des Profils verwerfen
    persist()
  }

  return { profiles, current, addProfile, switchProfile, removeProfile }
}
