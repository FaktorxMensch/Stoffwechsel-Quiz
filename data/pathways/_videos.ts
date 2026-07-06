// Meditricks-Video-Verknüpfungen je Stoffwechselweg (Eselsbrücken-Videos).
// Slugs stammen aus der Meditricks-Biochemie-Übersicht.

export interface VideoLink {
  title: string
  url: string
}

const mt = (slug: string): string => `https://www.meditricks.de/${slug}/`

export const pathwayVideos: Record<string, VideoLink[]> = {
  glykolyse: [
    { title: 'Glykolyse', url: mt('glykolyse') },
    { title: 'Aerobe Glykolyse', url: mt('glykolyse-aerob') },
    { title: 'Glykolyse-Regulation', url: mt('glykolyse-regulation') },
  ],
  laktat: [{ title: 'Anaerobe Glykolyse', url: mt('glykolyse-anaerob') }],
  gluconeogenese: [{ title: 'Gluconeogenese', url: mt('gluconeogenese') }],
  glykogen: [{ title: 'Glykogen', url: mt('glykogen') }],
  pentosephosphatweg: [{ title: 'Pentosephosphatweg', url: mt('pentosephosphatweg') }],
  'beta-oxidation': [{ title: 'β-Oxidation', url: mt('beta-oxidation') }],
  citratzyklus: [
    { title: 'Citratzyklus', url: mt('citratzyklus1') },
    { title: 'Citratzyklus – Reaktionen', url: mt('citratzyklus-reaktionen') },
  ],
  atmungskette: [
    { title: 'Atmungskette', url: mt('atmungskette') },
    { title: 'Atmungskette 2', url: mt('atmungskette2') },
    { title: 'Malat-Aspartat-Shuttle', url: mt('malat-aspartat-shuttle') },
  ],
  ketogenese: [{ title: 'Ketonkörper-Stoffwechsel', url: mt('ketonkoerper-stoffwechsel') }],
  aminosaeureabbau: [
    { title: 'Aminosäurestoffwechsel', url: mt('aminosaeurestoffwechsel') },
    { title: 'Aminosäuren', url: mt('aminosaeuren') },
  ],
  haemsynthese: [{ title: 'Hämsynthese', url: mt('haemsynthese') }],
  harnstoffzyklus: [{ title: 'Harnstoffzyklus', url: mt('harnstoffzyklus') }],
  fettsaeuresynthese: [
    { title: 'TAG-Synthese', url: mt('tag-synthese') },
    { title: 'Fette', url: mt('fette') },
  ],
  // neue Wege
  cholesterinsynthese: [{ title: 'Cholesterinbiosynthese', url: mt('cholesterinbiosynthese') }],
  purinsynthese: [
    { title: 'Purinbiosynthese', url: mt('purinbiosynthese') },
    { title: 'Nukleotide', url: mt('nukleotide') },
  ],
  pyrimidinsynthese: [{ title: 'Pyrimidinbiosynthese', url: mt('pyrimidinbiosynthese') }],
  katecholaminsynthese: [{ title: 'Katecholaminsynthese', url: mt('katecholaminsynthese') }],
}

// Übergreifendes Übersichts-Video (Meditricks „Stoffwechselstadt“).
export const overviewVideo: VideoLink = { title: 'Stoffwechselstadt (Übersicht)', url: mt('stoffwechselstadt') }
