import type { Pathway } from '~/types/metabolism'
import { S } from './_structures'

// Atmungskette / oxidative Phosphorylierung (vereinfachte Darstellung des Elektronenflusses).
// Quellen: Wikipedia, AMBOSS, Lehninger.

export const atmungskette: Pathway = {
  id: 'atmungskette',
  name: 'Atmungskette',
  aka: ['oxidative Phosphorylierung', 'Elektronentransportkette'],
  location: 'innere Mitochondrienmembran',
  summary:
    'Elektronen aus NADH und FADH₂ werden über die Komplexe I–IV auf O₂ übertragen. Die dabei gepumpten Protonen bauen einen Gradienten auf, den die ATP-Synthase (Komplex V) zur ATP-Bildung nutzt. Endprodukt: H₂O. Liefert den Großteil des zellulären ATP.',
  layout: 'linear',
  detailed: true,
  nodes: [
    {
      id: 'nadh',
      name: 'NADH',
      x: 0.5,
      y: 0.08,
      branches: [{ to: 'Citratzyklus', note: 'Herkunft der Elektronen (auch Glykolyse, β-Oxidation)' }],
    },
    { id: 'fadh2', name: 'FADH₂', x: 0.2, y: 0.24 },
    { id: 'ubichinon', name: 'Ubichinon (Q)', x: 0.5, y: 0.4, structure: S.ubichinon },
    { id: 'cytc', name: 'Cytochrom c', x: 0.5, y: 0.62 },
    { id: 'wasser', name: '½ O₂ → H₂O', x: 0.5, y: 0.86, structure: S.wasser },
  ],
  reactions: [
    {
      id: 'ak1',
      from: 'nadh',
      to: 'ubichinon',
      enzyme: 'Komplex I (NADH-Dehydrogenase)',
      reversible: false,
      tags: ['redox'],
      cofactors: [
        { name: 'NAD+', dir: 'out' },
        { name: '4 H⁺ → IMR', dir: 'out' },
      ],
      note: 'NADH:Ubichinon-Oxidoreduktase. Pumpt 4 H⁺ in den Intermembranraum. FMN & Fe-S-Zentren.',
    },
    {
      id: 'ak2',
      from: 'fadh2',
      to: 'ubichinon',
      enzyme: 'Komplex II (Succinat-Dehydrogenase)',
      reversible: false,
      tags: ['redox'],
      cofactors: [{ name: 'FAD', dir: 'out' }],
      note: 'Speist FADH₂-Elektronen ein – pumpt KEINE Protonen (daher weniger ATP aus FADH₂).',
      labelPos: { x: 0.28, y: 0.34 },
    },
    {
      id: 'ak3',
      from: 'ubichinon',
      to: 'cytc',
      enzyme: 'Komplex III (Cytochrom-bc₁)',
      reversible: false,
      tags: ['redox'],
      cofactors: [{ name: '4 H⁺ → IMR', dir: 'out' }],
      note: 'Überträgt Elektronen von QH₂ auf Cytochrom c (Q-Zyklus). Pumpt 4 H⁺.',
    },
    {
      id: 'ak4',
      from: 'cytc',
      to: 'wasser',
      enzyme: 'Komplex IV (Cytochrom-c-Oxidase)',
      reversible: false,
      tags: ['redox'],
      cofactors: [
        { name: 'O2', dir: 'in' },
        { name: 'H2O', dir: 'out' },
        { name: '2 H⁺ → IMR', dir: 'out' },
      ],
      note: 'Reduziert O₂ zu H₂O (terminaler Elektronenakzeptor). Pumpt 2 H⁺. Enthält Cu- & Häm-Zentren.',
    },
  ],
  net: [
    { label: 'NADH', value: '≈ 2,5 ATP', detail: 'Elektronen über Komplex I', uncertain: true },
    { label: 'FADH₂', value: '≈ 1,5 ATP', detail: 'Einspeisung über Komplex II', uncertain: true },
    { label: 'O₂', value: 'Endakzeptor', detail: 'wird zu H₂O reduziert' },
    { label: 'ATP-Synthase', value: 'Komplex V', detail: 'nutzt den H⁺-Gradienten (Chemiosmose)' },
    { label: 'Protonenpumpen', value: 'I, III, IV', detail: 'Komplex II pumpt nicht' },
  ],
  sources: [
    'https://en.wikipedia.org/wiki/Electron_transport_chain',
    'https://www.amboss.com/de/wissen/atmungskette',
  ],
}
