import type { Pathway } from '~/types/metabolism'
import { S } from './_structures'

// Pyrimidinbiosynthese (de novo). Quellen: Wikipedia, AMBOSS, Lehninger.

export const pyrimidinsynthese: Pathway = {
  id: 'pyrimidinsynthese',
  name: 'Pyrimidinsynthese',
  aka: ['Pyrimidinbiosynthese'],
  location: 'Cytosol (Dihydroorotat-Dehydrogenase: innere Mitochondrienmembran)',
  summary:
    'De-novo-Aufbau der Pyrimidinnukleotide. Anders als bei den Purinen wird zuerst der fertige Ring (Orotat) gebaut und erst danach an die aktivierte Ribose (PRPP) gehängt. Schrittmacher ist die Carbamoylphosphat-Synthetase II (cytosolisch – im Gegensatz zur CPS I im Harnstoffzyklus).',
  layout: 'linear',
  detailed: true,
  nodes: [
    { id: 'carbamoylphosphat', name: 'Carbamoylphosphat', x: 0.5, y: 0.1, structure: S.carbamoylphosphat },
    { id: 'carbamoylaspartat', name: 'Carbamoylaspartat', x: 0.5, y: 0.33, structure: S.carbamoylaspartat },
    { id: 'orotat', name: 'Orotat', x: 0.5, y: 0.56, structure: S.orotat },
    { id: 'ump', name: 'UMP', x: 0.5, y: 0.78, structure: S.ump },
    {
      id: 'ctp',
      name: 'CTP',
      x: 0.5,
      y: 0.94,
      structure: S.ctp,
      branches: [{ to: 'DNA / RNA', note: 'UTP/CTP; dTMP via Thymidylat-Synthase (Folsäure)' }],
    },
  ],
  reactions: [
    {
      id: 'py1',
      from: 'carbamoylphosphat',
      to: 'carbamoylaspartat',
      enzyme: 'Aspartat-Transcarbamylase',
      reversible: false,
      tags: ['kondensation'],
      cofactors: [
        { name: 'Aspartat', dir: 'in' },
        { name: 'Pi', dir: 'out' },
      ],
      note: 'Carbamoylphosphat stammt aus der Carbamoylphosphat-Synthetase II (Gln + CO₂ + 2 ATP) – dem cytosolischen Schrittmacher.',
    },
    {
      id: 'py2',
      from: 'carbamoylaspartat',
      to: 'orotat',
      enzyme: 'Dihydroorotat-Dehydrogenase',
      reversible: false,
      tags: ['redox'],
      cofactors: [
        { name: 'H2O', dir: 'out' },
        { name: 'Q', dir: 'in' },
      ],
      note: 'Ringschluss (Dihydroorotat) und Oxidation zu Orotat. Dieses Enzym sitzt in der inneren Mitochondrienmembran (an die Atmungskette gekoppelt).',
    },
    {
      id: 'py3',
      from: 'orotat',
      to: 'ump',
      enzyme: 'Orotat-PRT / OMP-Decarboxylase',
      reversible: false,
      tags: ['decarboxylierung'],
      cofactors: [
        { name: 'PRPP', dir: 'in' },
        { name: 'PPi', dir: 'out' },
        { name: 'CO2', dir: 'out' },
      ],
      note: 'Erst jetzt wird die Ribose (PRPP) angehängt (→ OMP), dann Decarboxylierung zu UMP.',
    },
    {
      id: 'py4',
      from: 'ump',
      to: 'ctp',
      enzyme: 'Kinasen / CTP-Synthase',
      reversible: false,
      tags: ['phosphorylierung'],
      cofactors: [
        { name: 'ATP', dir: 'in' },
        { name: 'Glutamin', dir: 'in' },
      ],
      note: 'UMP → UDP → UTP → CTP (Aminierung durch Glutamin). dTMP entsteht aus dUMP über die Thymidylat-Synthase (Folsäure, Ziel von 5-FU).',
    },
  ],
  net: [
    { label: 'Reihenfolge', value: 'Ring zuerst', detail: 'dann PRPP anhängen (Gegensatz zu Purinen)' },
    { label: 'Schrittmacher', value: 'CPS II', detail: 'cytosolisch (vs. CPS I im Harnstoffzyklus)' },
    { label: 'Bausteine', value: 'Gln, CO₂, Aspartat' },
    { label: 'Endprodukte', value: 'UMP → UTP, CTP, dTMP' },
    { label: 'Pharma', value: 'Methotrexat, 5-FU', detail: 'hemmen Folsäure-abhängige Schritte' },
  ],
  sources: [
    'https://en.wikipedia.org/wiki/Pyrimidine_metabolism',
    'https://www.meditricks.de/pyrimidinbiosynthese/',
  ],
}
