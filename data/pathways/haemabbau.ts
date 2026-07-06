import type { Pathway } from '~/types/metabolism'
import { S } from './_structures'

// Häm-Abbau (Bilirubin-Stoffwechsel). Quellen: Wikipedia, AMBOSS, Lehninger.

export const haemabbau: Pathway = {
  id: 'haemabbau',
  name: 'Häm-Abbau',
  aka: ['Bilirubin-Stoffwechsel', 'Hämkatabolismus'],
  location: 'Makrophagen (Milz, Leber, Knochenmark = RES) → Leber → Darm',
  summary:
    'Abbau von Häm aus gealterten Erythrozyten. Häm wird zu grünem Biliverdin und dann gelbem Bilirubin. In der Leber wird Bilirubin mit Glucuronsäure konjugiert (wasserlöslich = „direkt“) und über die Galle ausgeschieden. Störungen führen zu Ikterus (Gelbsucht).',
  layout: 'linear',
  detailed: true,
  nodes: [
    {
      id: 'haem',
      name: 'Häm',
      x: 0.5,
      y: 0.08,
      structure: S.haem,
      branches: [{ to: 'Häm-Synthese', note: 'Herkunft (aus Hämoglobin abgebauter Erythrozyten)' }],
    },
    { id: 'biliverdin', name: 'Biliverdin', x: 0.5, y: 0.3, structure: S.biliverdin },
    { id: 'bilirubin', name: 'Bilirubin (unkonj.)', x: 0.5, y: 0.52, structure: S.bilirubin },
    { id: 'bilirubin-gluc', name: 'Bilirubin-Diglucuronid', x: 0.5, y: 0.74, structure: S.bilirubinGlucuronid },
    {
      id: 'sterkobilin',
      name: 'Urobilinogen / Sterkobilin',
      x: 0.5,
      y: 0.93,
      structure: S.sterkobilin,
      branches: [{ to: 'Ausscheidung', note: 'Sterkobilin (Stuhl, braun) & Urobilin (Urin, gelb)' }],
    },
  ],
  reactions: [
    {
      id: 'ha1',
      from: 'haem',
      to: 'biliverdin',
      enzyme: 'Häm-Oxygenase',
      reversible: false,
      tags: ['redox'],
      cofactors: [
        { name: 'O2', dir: 'in' },
        { name: 'NADPH+H+', dir: 'in' },
        { name: 'CO', dir: 'out' },
        { name: 'Fe²⁺', dir: 'out' },
      ],
      note: 'Makrophagen (RES). Öffnet den Porphyrinring. Setzt CO (→ Abatemluft) und Fe²⁺ (Recycling) frei.',
    },
    {
      id: 'ha2',
      from: 'biliverdin',
      to: 'bilirubin',
      enzyme: 'Biliverdin-Reduktase',
      reversible: false,
      tags: ['redox'],
      cofactors: [
        { name: 'NADPH+H+', dir: 'in' },
        { name: 'NADP+', dir: 'out' },
      ],
      note: 'Grün → gelb. Unkonjugiertes („indirektes“) Bilirubin ist lipophil und wird an Albumin gebunden transportiert.',
    },
    {
      id: 'ha3',
      from: 'bilirubin',
      to: 'bilirubin-gluc',
      enzyme: 'UDP-Glucuronyltransferase',
      reversible: false,
      tags: ['kondensation'],
      cofactors: [
        { name: '2 UDP-Glucuronsäure', dir: 'in' },
        { name: '2 UDP', dir: 'out' },
      ],
      note: 'Leber. Konjugation macht Bilirubin wasserlöslich = „direktes“ Bilirubin → Ausscheidung über die Galle.',
    },
    {
      id: 'ha4',
      from: 'bilirubin-gluc',
      to: 'sterkobilin',
      enzyme: 'Darmbakterien',
      reversible: false,
      tags: ['redox'],
      cofactors: [],
      note: 'Im Darm zu Urobilinogen umgebaut → Sterkobilin (Stuhlfarbe) bzw. Urobilin (Urinfarbe); ein Teil unterliegt dem enterohepatischen Kreislauf.',
    },
  ],
  net: [
    { label: 'Häm', value: '1×', detail: 'aus Hämoglobin (RES)' },
    { label: 'CO', value: 'frei', detail: 'einziger endogener CO-Ursprung' },
    { label: 'Fe²⁺', value: 'recycelt', detail: 'zurück in den Eisenpool' },
    { label: 'Konjugation', value: 'Leber', detail: 'Glucuronsäure → „direktes“ Bilirubin' },
    { label: 'Störung', value: 'Ikterus', detail: 'prä-/intra-/posthepatisch je nach Ort' },
  ],
  sources: [
    'https://en.wikipedia.org/wiki/Bilirubin',
    'https://www.amboss.com/de/wissen/bilirubinstoffwechsel',
  ],
}
