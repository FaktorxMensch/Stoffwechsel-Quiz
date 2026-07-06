import type { Pathway } from '~/types/metabolism'
import { S } from './_structures'

// Cholesterinbiosynthese. Quellen: Wikipedia, AMBOSS, Lehninger.

export const cholesterinsynthese: Pathway = {
  id: 'cholesterinsynthese',
  name: 'Cholesterinsynthese',
  aka: ['Cholesterinbiosynthese'],
  location: 'Cytosol & glattes ER – v.a. Leber',
  summary:
    'Aufbau von Cholesterin aus Acetyl-CoA. Schrittmacher ist die HMG-CoA-Reduktase (Ziel der Statine). Über Mevalonat und aktivierte Isopreneinheiten (IPP) entstehen Squalen und daraus das Steran-Gerüst. Cholesterin ist Baustein für Membranen, Gallensäuren, Steroidhormone und Vitamin D.',
  layout: 'linear',
  detailed: true,
  nodes: [
    {
      id: 'acetyl-coa',
      name: 'Acetyl-CoA',
      x: 0.5,
      y: 0.06,
      cAtoms: 2,
      structure: S.acetylCoA,
      branches: [{ to: 'Citratzyklus', note: 'Herkunft über Citrat-Shuttle' }],
    },
    { id: 'acetoacetyl-coa', name: 'Acetoacetyl-CoA', x: 0.5, y: 0.2, cAtoms: 4, structure: S.acetoacetylCoA },
    { id: 'hmg-coa', name: 'HMG-CoA', x: 0.5, y: 0.34, cAtoms: 6, structure: S.hmgCoA },
    { id: 'mevalonat', name: 'Mevalonat', x: 0.5, y: 0.48, cAtoms: 6, structure: S.mevalonat },
    { id: 'ipp', name: 'Isopentenyl-PP', x: 0.5, y: 0.62, cAtoms: 5, structure: S.ipp },
    { id: 'squalen', name: 'Squalen', x: 0.5, y: 0.78, cAtoms: 30, structure: S.squalen },
    {
      id: 'cholesterin',
      name: 'Cholesterin',
      x: 0.5,
      y: 0.93,
      cAtoms: 27,
      structure: S.cholesterin,
      branches: [
        { to: 'Gallensäuren', note: 'Hauptausscheidungsweg' },
        { to: 'Steroidhormone', note: 'Cortisol, Aldosteron, Sexualhormone' },
      ],
    },
  ],
  reactions: [
    {
      id: 'ch1',
      from: 'acetyl-coa',
      to: 'acetoacetyl-coa',
      enzyme: 'Thiolase',
      reversible: true,
      tags: ['kondensation'],
      cofactors: [
        { name: 'Acetyl-CoA', dir: 'in' },
        { name: 'CoA-SH', dir: 'out' },
      ],
      note: '2 Acetyl-CoA kondensieren (cytosolisch).',
    },
    {
      id: 'ch2',
      from: 'acetoacetyl-coa',
      to: 'hmg-coa',
      enzyme: 'HMG-CoA-Synthase',
      reversible: false,
      tags: ['kondensation'],
      cofactors: [
        { name: 'Acetyl-CoA', dir: 'in' },
        { name: 'CoA-SH', dir: 'out' },
      ],
      note: 'Cytosolische HMG-CoA-Synthase (Unterschied zur mitochondrialen bei der Ketogenese).',
    },
    {
      id: 'ch3',
      from: 'hmg-coa',
      to: 'mevalonat',
      enzyme: 'HMG-CoA-Reduktase',
      reversible: false,
      tags: ['redox'],
      cofactors: [
        { name: '2 NADPH+H+', dir: 'in' },
        { name: 'CoA-SH', dir: 'out' },
        { name: '2 NADP+', dir: 'out' },
      ],
      note: 'Schrittmacher & Schlüsselenzym. Gehemmt durch Statine sowie durch Cholesterin/Insulin-Regulation.',
    },
    {
      id: 'ch4',
      from: 'mevalonat',
      to: 'ipp',
      enzyme: 'Mevalonatkinase (+ Decarboxylase)',
      reversible: false,
      tags: ['phosphorylierung', 'decarboxylierung'],
      cofactors: [
        { name: '3 ATP', dir: 'in' },
        { name: 'CO2', dir: 'out' },
      ],
      note: 'Mehrere Schritte: Phosphorylierung und Decarboxylierung zur aktivierten Isopreneinheit (IPP).',
    },
    {
      id: 'ch5',
      from: 'ipp',
      to: 'squalen',
      enzyme: 'Prenyltransferasen / Squalen-Synthase',
      reversible: false,
      tags: ['kondensation'],
      cofactors: [{ name: 'NADPH+H+', dir: 'in' }],
      note: '6 Isopreneinheiten (C5) → Squalen (C30) über Geranyl-/Farnesyl-PP.',
    },
    {
      id: 'ch6',
      from: 'squalen',
      to: 'cholesterin',
      enzyme: 'Squalen-Monooxygenase / Cyclasen',
      reversible: false,
      tags: ['redox'],
      cofactors: [
        { name: 'O2', dir: 'in' },
        { name: 'NADPH+H+', dir: 'in' },
      ],
      note: 'Ringschluss zu Lanosterol, dann in vielen Schritten zu Cholesterin (C27).',
    },
  ],
  net: [
    { label: 'Acetyl-CoA', value: '18×', detail: 'Bausteine pro Cholesterin' },
    { label: 'Cholesterin', value: '1× (C27)' },
    { label: 'Schrittmacher', value: 'HMG-CoA-Reduktase', detail: 'Ziel der Statine' },
    { label: 'NADPH', value: 'hoher Verbrauch', detail: 'v.a. bei Reduktion & Ringschluss' },
    { label: 'Verwendung', value: 'Membran, Gallensäuren,', detail: 'Steroidhormone, Vitamin D' },
  ],
  sources: [
    'https://en.wikipedia.org/wiki/Cholesterol#Biosynthesis',
    'https://www.meditricks.de/cholesterinbiosynthese/',
  ],
}
