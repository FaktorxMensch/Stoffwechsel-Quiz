import type { Pathway } from '~/types/metabolism'
import { S } from './_structures'

// Ketogenese – Bildung von Ketonkörpern aus Acetyl-CoA. Quellen: Wikipedia, AMBOSS, Lehninger.

export const ketogenese: Pathway = {
  id: 'ketogenese',
  name: 'Ketogenese',
  aka: ['Ketonkörper-Synthese'],
  location: 'Leber-Mitochondrien',
  summary:
    'Bei Kohlenhydratmangel (Hunger, Diabetes) bildet die Leber aus Acetyl-CoA (v.a. aus der β-Oxidation) die Ketonkörper Acetoacetat und 3-Hydroxybutyrat. Diese dienen Herz, Muskel und Gehirn als Energiequelle. Die Leber selbst kann Ketonkörper nicht verwerten.',
  layout: 'linear',
  detailed: true,
  nodes: [
    {
      id: 'acetyl-coa',
      name: 'Acetyl-CoA',
      x: 0.5,
      y: 0.08,
      cAtoms: 2,
      structure: S.acetylCoA,
      branches: [{ to: 'β-Oxidation', note: 'Hauptquelle im Hungerstoffwechsel' }],
    },
    { id: 'acetoacetyl-coa', name: 'Acetoacetyl-CoA', x: 0.5, y: 0.3, cAtoms: 4, structure: S.acetoacetylCoA },
    { id: 'hmg-coa', name: 'HMG-CoA', x: 0.5, y: 0.52, cAtoms: 6, structure: S.hmgCoA },
    { id: 'acetoacetat', name: 'Acetoacetat', x: 0.5, y: 0.73, cAtoms: 4, structure: S.acetoacetat },
    {
      id: 'bhb',
      name: '3-Hydroxybutyrat',
      x: 0.5,
      y: 0.93,
      cAtoms: 4,
      structure: S.hydroxybutyrat,
      branches: [{ to: 'periphere Gewebe', note: 'Energiequelle für Herz, Muskel, Gehirn' }],
    },
  ],
  reactions: [
    {
      id: 'kg1',
      from: 'acetyl-coa',
      to: 'acetoacetyl-coa',
      enzyme: 'Thiolase',
      reversible: true,
      tags: ['kondensation'],
      cofactors: [
        { name: 'Acetyl-CoA', dir: 'in' },
        { name: 'CoA-SH', dir: 'out' },
      ],
      note: '2 Acetyl-CoA kondensieren zu Acetoacetyl-CoA (Umkehr des letzten β-Oxidationsschritts).',
    },
    {
      id: 'kg2',
      from: 'acetoacetyl-coa',
      to: 'hmg-coa',
      enzyme: 'HMG-CoA-Synthase',
      reversible: false,
      tags: ['kondensation'],
      cofactors: [
        { name: 'Acetyl-CoA', dir: 'in' },
        { name: 'CoA-SH', dir: 'out' },
      ],
      note: 'Schrittmacherreaktion. Bildet β-Hydroxy-β-methylglutaryl-CoA (mitochondriale HMG-CoA-Synthase).',
    },
    {
      id: 'kg3',
      from: 'hmg-coa',
      to: 'acetoacetat',
      enzyme: 'HMG-CoA-Lyase',
      reversible: false,
      tags: ['spaltung'],
      cofactors: [{ name: 'Acetyl-CoA', dir: 'out' }],
      note: 'Setzt Acetoacetat frei (erster Ketonkörper). Aceton entsteht daraus spontan durch Decarboxylierung.',
    },
    {
      id: 'kg4',
      from: 'acetoacetat',
      to: 'bhb',
      enzyme: '3-Hydroxybutyrat-Dehydrogenase',
      reversible: true,
      tags: ['redox'],
      cofactors: [
        { name: 'NADH+H+', dir: 'in' },
        { name: 'NAD+', dir: 'out' },
      ],
      note: 'Acetoacetat ↔ 3-Hydroxybutyrat, je nach NADH/NAD⁺-Verhältnis im Mitochondrium.',
    },
  ],
  net: [
    { label: 'Acetyl-CoA', value: '2×', detail: 'Ausgangsstoff (netto, für 1 Acetoacetat)' },
    { label: 'Ketonkörper', value: 'Acetoacetat & 3-Hydroxybutyrat', detail: '(+ Aceton)' },
    { label: 'Ort', value: 'Leber', detail: 'bildet Ketonkörper, verwertet sie aber nicht selbst' },
    { label: 'Auslöser', value: 'Hunger / Diabetes', detail: 'hohe β-Oxidation, Oxalacetat-Mangel' },
  ],
  sources: [
    'https://en.wikipedia.org/wiki/Ketogenesis',
    'https://www.amboss.com/de/wissen/ketonkoerper',
  ],
}
