import type { Pathway } from '~/types/metabolism'
import { S } from './_structures'

// Harnstoffzyklus (Ornithinzyklus) – Entgiftung von Ammoniak zu Harnstoff.
// Quellen: Wikipedia, AMBOSS, Lehninger.

export const harnstoffzyklus: Pathway = {
  id: 'harnstoffzyklus',
  name: 'Harnstoffzyklus',
  aka: ['Ornithinzyklus', 'Urea cycle'],
  location: 'Leber – Carbamoylphosphat-Synthese & OTC in Mitochondrien, Rest im Cytosol',
  summary:
    'Wandelt giftiges Ammoniak (NH₄⁺) in ausscheidbaren Harnstoff um. Eines der beiden N-Atome stammt aus NH₄⁺, das andere aus Aspartat. Kostet 3 ATP (4 energiereiche Bindungen) pro Harnstoff. Über Fumarat mit dem Citratzyklus verknüpft.',
  layout: 'circle',
  detailed: true,
  nodes: [
    { id: 'ornithin', name: 'Ornithin', x: 0.5, y: 0.12, cAtoms: 5, structure: S.ornithin },
    { id: 'citrullin', name: 'Citrullin', x: 0.86, y: 0.5, cAtoms: 6, structure: S.citrullin },
    { id: 'argininosuccinat', name: 'Argininosuccinat', x: 0.5, y: 0.88, cAtoms: 10, structure: S.argininosuccinat },
    { id: 'arginin', name: 'Arginin', x: 0.14, y: 0.5, cAtoms: 6, structure: S.arginin },
  ],
  reactions: [
    {
      id: 'hz1',
      from: 'ornithin',
      to: 'citrullin',
      enzyme: 'Ornithin-Transcarbamylase',
      reversible: false,
      tags: ['kondensation'],
      cofactors: [
        { name: 'Carbamoylphosphat', dir: 'in' },
        { name: 'Pi', dir: 'out' },
      ],
      note: 'Mitochondrium. Carbamoylphosphat stammt aus der Carbamoylphosphat-Synthetase I (NH₄⁺ + HCO₃⁻ + 2 ATP) – der eigentliche regulierte Eintrittsschritt.',
    },
    {
      id: 'hz2',
      from: 'citrullin',
      to: 'argininosuccinat',
      enzyme: 'Argininosuccinat-Synthetase',
      reversible: false,
      tags: ['kondensation'],
      cofactors: [
        { name: 'Aspartat', dir: 'in' },
        { name: 'ATP', dir: 'in' },
        { name: 'AMP', dir: 'out' },
        { name: 'PPi', dir: 'out' },
      ],
      note: 'Cytosol. Aspartat liefert das 2. Stickstoffatom. ATP → AMP + PPi (2 energiereiche Bindungen).',
    },
    {
      id: 'hz3',
      from: 'argininosuccinat',
      to: 'arginin',
      enzyme: 'Argininosuccinat-Lyase',
      reversible: false,
      tags: ['spaltung'],
      cofactors: [{ name: 'Fumarat', dir: 'out' }],
      note: 'Cytosol. Fumarat verknüpft den Zyklus mit dem Citratzyklus (→ Malat → Oxalacetat → Aspartat).',
    },
    {
      id: 'hz4',
      from: 'arginin',
      to: 'ornithin',
      enzyme: 'Arginase',
      reversible: false,
      tags: ['hydrolyse'],
      cofactors: [
        { name: 'H2O', dir: 'in' },
        { name: 'Harnstoff', dir: 'out' },
      ],
      note: 'Cytosol. Setzt Harnstoff frei und regeneriert Ornithin.',
    },
  ],
  net: [
    { label: 'Harnstoff', value: '1×', detail: 'Endprodukt, renal ausgeschieden' },
    { label: 'N-Quellen', value: '2', detail: '1× NH₄⁺ + 1× Aspartat' },
    { label: 'ATP', value: '−3', detail: '4 energiereiche Bindungen (CPS-I: 2 ATP, ASS: ATP→AMP+PPi)' },
    { label: 'Fumarat', value: '1×', detail: 'an Citratzyklus abgegeben' },
    { label: 'Reaktionen', value: '4', detail: '+ CPS-I als Eintrittsschritt' },
  ],
  sources: [
    'https://en.wikipedia.org/wiki/Urea_cycle',
    'https://www.amboss.com/de/wissen/harnstoffzyklus',
  ],
}
