import type { Pathway } from '~/types/metabolism'
import { S } from './_structures'

// Aminosäureabbau (Stickstoff-Abgabe) – Transaminierung + oxidative Desaminierung.
// Vereinfachte, allgemeine Darstellung. Quellen: Wikipedia, AMBOSS, Lehninger.

export const aminosaeureabbau: Pathway = {
  id: 'aminosaeureabbau',
  name: 'Aminosäureabbau',
  aka: ['Transaminierung & Desaminierung'],
  location: 'v.a. Leber (Cytosol & Mitochondrium)',
  summary:
    'Beim Abbau werden Aminogruppen zunächst per Transaminierung auf α-Ketoglutarat übertragen (Glutamat sammelt den Stickstoff), dann durch oxidative Desaminierung als NH₄⁺ freigesetzt. Das NH₄⁺ geht in den Harnstoffzyklus, die C-Gerüste in Energiegewinnung/Gluconeogenese.',
  layout: 'linear',
  detailed: true,
  nodes: [
    {
      id: 'aminosaeure',
      name: 'Aminosäure',
      x: 0.5,
      y: 0.12,
      structure: S.aminosaeureGeneric,
      branches: [{ to: 'Citratzyklus', note: 'C-Gerüst: glucogen (→ Gluconeogenese) oder ketogen' }],
    },
    {
      id: 'glutamat',
      name: 'Glutamat',
      x: 0.5,
      y: 0.5,
      cAtoms: 5,
      structure: S.glutamat,
      branches: [{ to: 'Harnstoffzyklus', note: 'liefert NH₄⁺ (+ Aspartat) zur Entgiftung' }],
    },
    {
      id: 'alpha-ketoglutarat',
      name: 'α-Ketoglutarat',
      x: 0.5,
      y: 0.88,
      cAtoms: 5,
      structure: S.akg,
      branches: [{ to: 'Citratzyklus', note: 'Wiedereintritt des C5-Gerüsts' }],
    },
  ],
  reactions: [
    {
      id: 'aa1',
      from: 'aminosaeure',
      to: 'glutamat',
      enzyme: 'Aminotransferase (Transaminase)',
      reversible: true,
      tags: ['transaminierung'],
      cofactors: [
        { name: 'α-Ketoglutarat', dir: 'in' },
        { name: 'α-Ketosäure', dir: 'out' },
      ],
      note: 'Coenzym PLP (Vitamin B6). Überträgt die Aminogruppe auf α-Ketoglutarat → Glutamat. Beispiele: ALT (GPT), AST (GOT).',
    },
    {
      id: 'aa2',
      from: 'glutamat',
      to: 'alpha-ketoglutarat',
      enzyme: 'Glutamat-Dehydrogenase',
      reversible: true,
      tags: ['redox'],
      cofactors: [
        { name: 'NAD(P)+', dir: 'in' },
        { name: 'H2O', dir: 'in' },
        { name: 'NAD(P)H', dir: 'out' },
        { name: 'NH4+', dir: 'out' },
      ],
      note: 'Oxidative Desaminierung: setzt das gesammelte NH₄⁺ frei (Sammelstelle des Stickstoffs). Reguliert durch Energieladung (GTP/ADP).',
    },
  ],
  net: [
    { label: 'Prinzip', value: 'Transaminierung → Desaminierung', detail: 'Stickstoff wird in Glutamat gesammelt' },
    { label: 'NH₄⁺', value: 'freigesetzt', detail: 'geht in den Harnstoffzyklus' },
    { label: 'C-Gerüste', value: 'glucogen / ketogen', detail: '→ Citratzyklus, Gluconeogenese, Ketonkörper' },
    { label: 'Coenzym', value: 'PLP (Vit. B6)', detail: 'für alle Transaminasen' },
  ],
  sources: [
    'https://en.wikipedia.org/wiki/Amino_acid#Catabolism',
    'https://www.amboss.com/de/wissen/aminosaeurestoffwechsel',
  ],
}
