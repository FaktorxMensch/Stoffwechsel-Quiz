// Gemeinsame kondensierte Strukturformeln (Monospace, mehrzeilig).
// Ⓟ = Phosphatgruppe (–PO₃²⁻/–O–PO₃²⁻). Werden von mehreren Wegen genutzt.

const j = (...lines: string[]) => lines.join('\n')

export const S = {
  // --- C3 / zentrale Metabolite ---
  pyruvat: j('COO⁻', '|', 'C=O', '|', 'CH₃'),
  lactat: j('COO⁻', '|', 'H–C–OH', '|', 'CH₃'),
  pep: j('COO⁻', '|', 'C–O–Ⓟ', '‖', 'CH₂'),
  acetylCoA: j('CH₃', '|', 'C=O', '|', 'S–CoA'),

  // --- Triosephosphate ---
  dhap: j('CH₂–O–Ⓟ', '|', 'C=O', '|', 'CH₂OH'),
  gap: j('CHO', '|', 'H–C–OH', '|', 'CH₂–O–Ⓟ'),
  bpg13: j('C(=O)–O–Ⓟ', '|', 'H–C–OH', '|', 'CH₂–O–Ⓟ'),
  pg3: j('COO⁻', '|', 'H–C–OH', '|', 'CH₂–O–Ⓟ'),
  pg2: j('COO⁻', '|', 'H–C–O–Ⓟ', '|', 'CH₂OH'),

  // --- Hexosen / Hexosephosphate (Fischer) ---
  glucose: j('CHO', '|', 'H–C–OH', '|', 'HO–C–H', '|', 'H–C–OH', '|', 'H–C–OH', '|', 'CH₂OH'),
  g6p: j('CHO', '|', 'H–C–OH', '|', 'HO–C–H', '|', 'H–C–OH', '|', 'H–C–OH', '|', 'CH₂–O–Ⓟ'),
  f6p: j('CH₂OH', '|', 'C=O', '|', 'HO–C–H', '|', 'H–C–OH', '|', 'H–C–OH', '|', 'CH₂–O–Ⓟ'),
  f16bp: j('CH₂–O–Ⓟ', '|', 'C=O', '|', 'HO–C–H', '|', 'H–C–OH', '|', 'H–C–OH', '|', 'CH₂–O–Ⓟ'),
  glucose1p: j('CHO', '|', 'H–C–O–Ⓟ', '|', 'HO–C–H', '|', 'H–C–OH', '|', 'H–C–OH', '|', 'CH₂OH'),
  udpGlucose: j('Glucose', '|', 'O–Ⓟ–Ⓟ', '|', 'Uridin', '(UDP-aktiviert)'),
  glykogen: j('[–Glucose–]ₙ', 'α-1,4- &', 'α-1,6-', 'glykosidisch'),

  // --- Citratzyklus-Metabolite (C4/C5/C6) ---
  oxalacetat: j('COO⁻', '|', 'C=O', '|', 'CH₂', '|', 'COO⁻'),
  akg: j('COO⁻', '|', 'CH₂', '|', 'CH₂', '|', 'C=O', '|', 'COO⁻'),

  // --- Aminosäurestoffwechsel ---
  glutamat: j('COO⁻', '|', 'H–C–NH₃⁺', '|', 'CH₂', '|', 'CH₂', '|', 'COO⁻'),
  aminosaeureGeneric: j('COO⁻', '|', 'H–C–NH₃⁺', '|', 'R'),

  // --- Harnstoffzyklus ---
  ornithin: j('COO⁻', '|', 'H–C–NH₃⁺', '|', '(CH₂)₃', '|', 'NH₃⁺'),
  citrullin: j('COO⁻', '|', 'H–C–NH₃⁺', '|', '(CH₂)₃', '|', 'NH', '|', 'C=O', '|', 'NH₂'),
  arginin: j('COO⁻', '|', 'H–C–NH₃⁺', '|', '(CH₂)₃', '|', 'NH', '|', 'C=NH₂⁺', '|', 'NH₂'),
  argininosuccinat: j('Arg–NH', '|', 'CH–COO⁻', '|', 'CH₂', '|', 'COO⁻', '(Arginin +', 'Succinat)'),

  // --- Lipidstoffwechsel ---
  malonylCoA: j('⁻OOC', '|', 'CH₂', '|', 'C=O', '|', 'S–CoA'),
  palmitat: j('CH₃', '|', '(CH₂)₁₄', '|', 'COO⁻'),
  acylCoA: j('R', '|', 'CH₂', '|', 'CH₂', '|', 'C=O', '|', 'S–CoA'),
  enoylCoA: j('R–CH', '‖', 'CH', '|', 'C=O', '|', 'S–CoA'),
  hydroxyacylCoA: j('R', '|', 'H–C–OH', '|', 'CH₂', '|', 'C=O', '|', 'S–CoA'),
  ketoacylCoA: j('R', '|', 'C=O', '|', 'CH₂', '|', 'C=O', '|', 'S–CoA'),

  // --- Ketonkörper ---
  acetoacetylCoA: j('CH₃', '|', 'C=O', '|', 'CH₂', '|', 'C=O', '|', 'S–CoA'),
  hmgCoA: j('⁻OOC–CH₂', '|', 'HO–C–CH₃', '|', 'CH₂', '|', 'C=O', '|', 'S–CoA'),
  acetoacetat: j('CH₃', '|', 'C=O', '|', 'CH₂', '|', 'COO⁻'),
  hydroxybutyrat: j('CH₃', '|', 'H–C–OH', '|', 'CH₂', '|', 'COO⁻'),

  // --- Pentosephosphatweg ---
  lacton: j('O=C──O', '|    |', 'H–C–OH│', 'HO–C–H│', 'H–C–OH│', 'H–C───┘', '|', 'CH₂–O–Ⓟ'),
  phosphogluconat: j('COO⁻', '|', 'H–C–OH', '|', 'HO–C–H', '|', 'H–C–OH', '|', 'H–C–OH', '|', 'CH₂–O–Ⓟ'),
  ribulose5p: j('CH₂OH', '|', 'C=O', '|', 'H–C–OH', '|', 'H–C–OH', '|', 'CH₂–O–Ⓟ'),
  ribose5p: j('CHO', '|', 'H–C–OH', '|', 'H–C–OH', '|', 'H–C–OH', '|', 'CH₂–O–Ⓟ'),

  // --- Atmungskette (soweit als kleine Moleküle sinnvoll) ---
  wasser: j('H–O–H'),
  ubichinon: j('   O', '   ‖', '[Chinon]–CH₃', '   ‖   ·', '   O   (CH₂–CH=', '       C(CH₃)–CH₂)ₙ'),
}
