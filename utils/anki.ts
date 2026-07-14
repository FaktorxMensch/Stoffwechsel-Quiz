import { pathwayList } from '~/data/pathways'
import { reactionLabel } from '~/utils/quiz'

// Erzeugt eine Anki-Import-Datei (Tab-getrennt) mit Deck „Stoffwechselwege“
// und je Stoffwechselweg einem Unterdeck. Import in Anki: Datei → Importieren.
// Header `#deck column:1` legt das (Unter-)Deck pro Notiz fest, „::“ = Unterdeck.

const TOP = 'Stoffwechselwege'

// Feldtext säubern: keine Tabs/Zeilenumbrüche (die trennen Felder/Notizen)
const esc = (s: string): string => s.replace(/\t/g, ' ').replace(/\r?\n/g, '<br>')

// Strukturformel als Monospace-Block mit erhaltenen Leerzeichen
function fmtStructure(s: string): string {
  const html = s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/ /g, '&nbsp;')
    .replace(/\r?\n/g, '<br>')
  return `<div style="font-family:monospace;line-height:1.2">${html}</div>`
}

export function buildAnkiText(): string {
  const rows: string[] = []
  const add = (deck: string, front: string, back: string) => {
    rows.push([deck, esc(front), esc(back)].join('\t'))
  }

  for (const p of pathwayList) {
    const deck = `${TOP}::${p.name}`

    // Überblick
    add(deck, `${p.name}: Wo läuft der Weg ab (Lokalisation)?`, p.location)
    add(deck, `${p.name}: Worum geht es (Kurzüberblick)?`, p.summary)
    add(
      deck,
      `${p.name}: Netto-Gesamtbilanz?`,
      p.net.map((n) => `${n.label}: ${n.value}${n.detail ? ` (${n.detail})` : ''}`).join('<br>'),
    )

    // Reaktionen
    for (const r of p.reactions) {
      const label = reactionLabel(p, r)
      add(deck, `${p.name}: Welches Enzym katalysiert ${label}?`, `${r.enzyme}${r.note ? `<br><br>${r.note}` : ''}`)
      add(
        deck,
        `${p.name}: Läuft „${r.enzyme}“ (${label}) reversibel oder nur in eine Richtung?`,
        r.reversible ? 'reversibel (beide Richtungen)' : 'irreversibel (nur eine Richtung)',
      )
      if (r.cofactors.length) {
        const ins = r.cofactors.filter((c) => c.dir === 'in').map((c) => c.name).join(', ') || '–'
        const outs = r.cofactors.filter((c) => c.dir === 'out').map((c) => c.name).join(', ') || '–'
        add(deck, `${p.name}: „${r.enzyme}“ (${label}) – was wird verbraucht, was wird frei?`, `verbraucht: ${ins}<br>frei: ${outs}`)
      }
      if (r.deltaG !== undefined) {
        add(deck, `${p.name}: ΔG°′ von „${r.enzyme}“ (${label})?`, `${r.deltaG > 0 ? '+' : ''}${r.deltaG} kcal/mol`)
      }
    }

    // Metabolite: Strukturformel (beide Richtungen) + Abzweige
    for (const n of p.nodes) {
      if (n.structure) {
        add(deck, `${p.name}: Welcher Metabolit hat diese Strukturformel?<br>${fmtStructure(n.structure)}`, `${n.name}${n.cAtoms ? ` (${n.cAtoms} C)` : ''}`)
        add(deck, `${p.name}: Strukturformel von ${n.name}?`, fmtStructure(n.structure))
      }
      if (n.branches?.length) {
        add(
          deck,
          `${p.name}: Wohin kann ${n.name} übergehen (Abzweige)?`,
          n.branches.map((b) => `→ ${b.to}${b.note ? ` (${b.note})` : ''}`).join('<br>'),
        )
      }
    }
  }

  const header = ['#separator:tab', '#html:true', '#deck column:1', ''].join('\n')
  return header + rows.join('\n') + '\n'
}

export function downloadAnkiDeck(): void {
  const text = buildAnkiText()
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'stoffwechselwege-anki.txt'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
