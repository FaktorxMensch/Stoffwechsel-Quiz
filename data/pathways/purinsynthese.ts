import type { Pathway } from '~/types/metabolism'
import { S } from './_structures'

// Purinbiosynthese (de novo). Quellen: Wikipedia, AMBOSS, Lehninger.

export const purinsynthese: Pathway = {
  id: 'purinsynthese',
  name: 'Purinsynthese',
  aka: ['Purinbiosynthese', 'Nukleotidsynthese'],
  location: 'Cytosol – v.a. Leber',
  summary:
    'De-novo-Aufbau der Purinnukleotide. Der Purinring wird schrittweise direkt auf aktivierte Ribose (PRPP) aufgebaut; das erste Produkt ist IMP, aus dem AMP und GMP entstehen. Alternative: Salvage-Pathway (Wiederverwertung über HGPRT/APRT). Hemmung z.B. durch Methotrexat (Folsäure-abhängige Schritte).',
  layout: 'linear',
  detailed: true,
  nodes: [
    {
      id: 'ribose5p',
      name: 'Ribose-5-P',
      x: 0.5,
      y: 0.08,
      cAtoms: 5,
      structure: S.ribose5p,
      branches: [{ to: 'Pentosephosphatweg', note: 'Herkunft der Ribose' }],
    },
    { id: 'prpp', name: 'PRPP', x: 0.5, y: 0.32, structure: S.prpp },
    { id: 'imp', name: 'IMP', x: 0.5, y: 0.58, structure: S.imp },
    {
      id: 'amp',
      name: 'AMP',
      x: 0.3,
      y: 0.85,
      structure: S.amp,
      branches: [{ to: 'DNA / RNA', note: 'sowie ATP' }],
    },
    {
      id: 'gmp',
      name: 'GMP',
      x: 0.7,
      y: 0.85,
      structure: S.gmp,
      branches: [{ to: 'DNA / RNA', note: 'sowie GTP' }],
    },
  ],
  reactions: [
    {
      id: 'pu1',
      from: 'ribose5p',
      to: 'prpp',
      enzyme: 'PRPP-Synthetase',
      reversible: false,
      tags: ['phosphorylierung'],
      cofactors: [
        { name: 'ATP', dir: 'in' },
        { name: 'AMP', dir: 'out' },
      ],
      note: 'Aktiviert Ribose-5-P zu 5-Phosphoribosyl-1-pyrophosphat (PRPP). Auch Startpunkt der Pyrimidin- und Salvage-Wege.',
    },
    {
      id: 'pu2',
      from: 'prpp',
      to: 'imp',
      enzyme: 'Glutamin-PRPP-Amidotransferase (u.a.)',
      reversible: false,
      tags: ['kondensation'],
      cofactors: [
        { name: 'Glutamin', dir: 'in' },
        { name: 'Glycin', dir: 'in' },
        { name: 'Aspartat', dir: 'in' },
        { name: 'Formyl-THF', dir: 'in' },
        { name: 'ATP', dir: 'in' },
      ],
      note: 'Schrittmacher (Amidotransferase). In ~10 Schritten wird der Purinring auf PRPP aufgebaut → IMP (Basis: Hypoxanthin). Folsäure-abhängig (Formyl-THF).',
    },
    {
      id: 'pu3',
      from: 'imp',
      to: 'amp',
      enzyme: 'Adenylosuccinat-Synthase / -Lyase',
      reversible: false,
      tags: ['kondensation'],
      cofactors: [
        { name: 'Aspartat', dir: 'in' },
        { name: 'GTP', dir: 'in' },
        { name: 'Fumarat', dir: 'out' },
      ],
      note: 'IMP → AMP: Aminogruppe aus Aspartat, GTP-abhängig (Regulation: AMP-Bildung braucht GTP).',
    },
    {
      id: 'pu4',
      from: 'imp',
      to: 'gmp',
      enzyme: 'IMP-Dehydrogenase / GMP-Synthase',
      reversible: false,
      tags: ['redox'],
      cofactors: [
        { name: 'NAD+', dir: 'in' },
        { name: 'Glutamin', dir: 'in' },
        { name: 'ATP', dir: 'in' },
      ],
      note: 'IMP → XMP → GMP: NAD⁺-abhängige Oxidation, Amidierung durch Glutamin, ATP-abhängig (spiegelbildliche Regulation zu AMP).',
    },
  ],
  net: [
    { label: 'PRPP', value: 'Startbaustein', detail: 'aus Ribose-5-P + ATP' },
    { label: 'IMP → AMP / GMP', value: 'verzweigt', detail: 'GTP für AMP, ATP für GMP (Kreuzregulation)' },
    { label: 'N-Quellen', value: 'Gln, Gly, Asp', detail: '+ Formyl-THF (Folsäure), CO₂' },
    { label: 'Schrittmacher', value: 'PRPP-Amidotransferase' },
    { label: 'Alternative', value: 'Salvage-Pathway', detail: 'HGPRT / APRT (Wiederverwertung)' },
  ],
  sources: [
    'https://en.wikipedia.org/wiki/Purine_metabolism',
    'https://www.meditricks.de/purinbiosynthese/',
  ],
}
