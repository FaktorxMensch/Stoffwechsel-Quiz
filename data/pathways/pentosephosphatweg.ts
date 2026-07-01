import type { Pathway } from '~/types/metabolism'

// Pentosephosphatweg (oxidativer Teil) – liefert NADPH und Ribose-5-P.
// Quellen: Wikipedia, AMBOSS, Lehninger.

export const pentosephosphatweg: Pathway = {
  id: 'pentosephosphatweg',
  name: 'Pentosephosphatweg',
  aka: ['Hexosemonophosphatweg', 'PPW'],
  location: 'Cytosol (v.a. Leber, Fettgewebe, Erythrozyten, NNR)',
  summary:
    'Parallelweg zur Glykolyse ab Glucose-6-P. Der oxidative Teil liefert 2 NADPH (für Biosynthesen & Redox-Schutz) und Ribose-5-P (für Nukleotide). Der nicht-oxidative Teil (Transketolase/Transaldolase) verknüpft die Zucker reversibel mit der Glykolyse.',
  layout: 'linear',
  detailed: true,
  nodes: [
    {
      id: 'g6p',
      name: 'Glucose-6-P',
      x: 0.5,
      y: 0.08,
      cAtoms: 6,
      branches: [{ to: 'Glykolyse', note: 'alternativer Abbauweg' }],
    },
    { id: 'lacton', name: '6-Phosphogluconolacton', x: 0.5, y: 0.32, cAtoms: 6 },
    { id: 'gluconat', name: '6-Phosphogluconat', x: 0.5, y: 0.55, cAtoms: 6 },
    { id: 'ribulose5p', name: 'Ribulose-5-P', x: 0.5, y: 0.75, cAtoms: 5 },
    {
      id: 'ribose5p',
      name: 'Ribose-5-P',
      x: 0.5,
      y: 0.93,
      cAtoms: 5,
      branches: [
        { to: 'Nukleotidsynthese', note: 'Purine/Pyrimidine, über PRPP' },
        { to: 'Glykolyse', note: 'nicht-oxidativer Teil → Fructose-6-P / GAP' },
      ],
    },
  ],
  reactions: [
    {
      id: 'pp1',
      from: 'g6p',
      to: 'lacton',
      enzyme: 'Glucose-6-phosphat-Dehydrogenase',
      reversible: false,
      tags: ['redox'],
      cofactors: [
        { name: 'NADP+', dir: 'in' },
        { name: 'NADPH+H+', dir: 'out' },
      ],
      note: 'Schlüssel- und Schrittmacherenzym (G6PD), reguliert durch NADP⁺/NADPH-Verhältnis. 1. NADPH.',
    },
    {
      id: 'pp2',
      from: 'lacton',
      to: 'gluconat',
      enzyme: '6-Phosphogluconolactonase',
      reversible: false,
      tags: ['hydrolyse'],
      cofactors: [{ name: 'H2O', dir: 'in' }],
      note: 'Hydrolytische Öffnung des Lactonrings.',
    },
    {
      id: 'pp3',
      from: 'gluconat',
      to: 'ribulose5p',
      enzyme: '6-Phosphogluconat-Dehydrogenase',
      reversible: false,
      tags: ['redox', 'decarboxylierung'],
      cofactors: [
        { name: 'NADP+', dir: 'in' },
        { name: 'NADPH+H+', dir: 'out' },
        { name: 'CO2', dir: 'out' },
      ],
      note: 'Oxidative Decarboxylierung. 2. NADPH + 1 CO₂ (aus C6 → C5).',
    },
    {
      id: 'pp4',
      from: 'ribulose5p',
      to: 'ribose5p',
      enzyme: 'Ribose-5-phosphat-Isomerase',
      reversible: true,
      tags: ['isomerisierung'],
      cofactors: [],
      note: 'Ketose → Aldose. (Alternativ Epimerase → Xylulose-5-P für den nicht-oxidativen Teil.)',
    },
  ],
  net: [
    { label: 'Glucose-6-P', value: '1×', detail: 'Eingang (6 C)' },
    { label: 'NADPH + H⁺', value: '2×', detail: 'für Biosynthesen & Glutathion-Reduktion' },
    { label: 'CO₂', value: '1×' },
    { label: 'Ribose-5-P', value: '1×', detail: 'für Nukleotidsynthese' },
    { label: 'Redoxreaktionen', value: '2', detail: 'beide NADP⁺-abhängig' },
    { label: 'ATP', value: '0', detail: 'liefert kein ATP' },
  ],
  sources: [
    'https://en.wikipedia.org/wiki/Pentose_phosphate_pathway',
    'https://www.amboss.com/de/wissen/pentosephosphatweg',
  ],
}
