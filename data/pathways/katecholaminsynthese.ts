import type { Pathway } from '~/types/metabolism'
import { S } from './_structures'

// Katecholaminsynthese. Quellen: Wikipedia, AMBOSS, Lehninger.

export const katecholaminsynthese: Pathway = {
  id: 'katecholaminsynthese',
  name: 'Katecholaminsynthese',
  aka: ['Catecholaminsynthese'],
  location: 'Nebennierenmark & sympathische/zentrale Neurone',
  summary:
    'Bildung der Katecholamine aus der Aminosäure Tyrosin: Tyrosin → L-DOPA → Dopamin → Noradrenalin → Adrenalin. Schrittmacher ist die Tyrosinhydroxylase. Die letzte Methylierung zu Adrenalin (PNMT) findet fast nur im Nebennierenmark statt und ist cortisolabhängig.',
  layout: 'linear',
  detailed: true,
  nodes: [
    {
      id: 'tyrosin',
      name: 'Tyrosin',
      x: 0.5,
      y: 0.1,
      cAtoms: 9,
      structure: S.tyrosin,
      branches: [{ to: 'Aminosäuren', note: 'aus Phenylalanin bzw. Nahrung' }],
    },
    { id: 'ldopa', name: 'L-DOPA', x: 0.5, y: 0.32, structure: S.ldopa },
    { id: 'dopamin', name: 'Dopamin', x: 0.5, y: 0.54, structure: S.dopamin },
    { id: 'noradrenalin', name: 'Noradrenalin', x: 0.5, y: 0.75, structure: S.noradrenalin },
    {
      id: 'adrenalin',
      name: 'Adrenalin',
      x: 0.5,
      y: 0.93,
      structure: S.adrenalin,
      branches: [{ to: 'Abbau', note: 'COMT & MAO → Metanephrine, VMA (Urin)' }],
    },
  ],
  reactions: [
    {
      id: 'ka1',
      from: 'tyrosin',
      to: 'ldopa',
      enzyme: 'Tyrosinhydroxylase',
      reversible: false,
      tags: ['redox'],
      cofactors: [
        { name: 'O2', dir: 'in' },
        { name: 'BH4', dir: 'in' },
      ],
      note: 'Schrittmacher & geschwindigkeitsbestimmend. Coenzym Tetrahydrobiopterin (BH4). Hydroxylierung des Rings.',
    },
    {
      id: 'ka2',
      from: 'ldopa',
      to: 'dopamin',
      enzyme: 'DOPA-Decarboxylase',
      reversible: false,
      tags: ['decarboxylierung'],
      cofactors: [{ name: 'CO2', dir: 'out' }],
      note: 'Coenzym PLP (Vit. B6). (Hemmung durch Carbidopa bei Parkinson-Therapie.)',
    },
    {
      id: 'ka3',
      from: 'dopamin',
      to: 'noradrenalin',
      enzyme: 'Dopamin-β-Hydroxylase',
      reversible: false,
      tags: ['redox'],
      cofactors: [
        { name: 'O2', dir: 'in' },
        { name: 'Vitamin C', dir: 'in' },
      ],
      note: 'Hydroxylierung der Seitenkette. Findet in den sekretorischen Vesikeln statt.',
    },
    {
      id: 'ka4',
      from: 'noradrenalin',
      to: 'adrenalin',
      enzyme: 'PNMT',
      reversible: false,
      tags: ['kondensation'],
      cofactors: [
        { name: 'SAM', dir: 'in' },
        { name: 'SAH', dir: 'out' },
      ],
      note: 'N-Methylierung (SAM als Methyldonor). Nur im Nebennierenmark relevant; durch Cortisol induziert.',
    },
  ],
  net: [
    { label: 'Ausgangsstoff', value: 'Tyrosin', detail: '(aus Phenylalanin)' },
    { label: 'Reihenfolge', value: 'DOPA → Dopamin →', detail: 'Noradrenalin → Adrenalin' },
    { label: 'Schrittmacher', value: 'Tyrosinhydroxylase' },
    { label: 'Coenzyme', value: 'BH4, PLP, Vit. C, SAM' },
    { label: 'Abbau', value: 'COMT & MAO', detail: '→ Metanephrine / VMA' },
  ],
  sources: [
    'https://en.wikipedia.org/wiki/Catecholamine#Biosynthesis',
    'https://www.meditricks.de/katecholaminsynthese/',
  ],
}
