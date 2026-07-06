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

  // --- Atmungskette (Elektronencarrier: schematisch) ---
  wasser: j('H–O–H'),
  ubichinon: j('   O', '   ‖', '[Chinon]–CH₃', '   ‖   ·', '   O   (CH₂–CH=', '       C(CH₃)–CH₂)ₙ'),
  nadh: j('[Nicotinamid]–H', '|', 'Ribose–Ⓟ', '|', 'Ⓟ–Ribose–Adenin', '(NAD⁺ + 2 H)'),
  fadh2: j('[Isoalloxazin]–H₂', '|', 'Ribitol', '|', 'Ⓟ–Ⓟ', '|', 'Ribose–Adenin', '(FAD + 2 H)'),
  cytc: j('Häm c (Fe²⁺/³⁺)', 'kovalent (2 Cys)', 'an Protein', '– Elektronen-', '  überträger'),

  // --- Häm-Stoffwechsel ---
  haem: j('[Tetrapyrrol]', '4 Pyrrol-Ringe', '(Protoporphyrin IX)', '+ Fe²⁺ zentral', '= Häm'),
  ala: j('COO⁻', '|', 'CH₂', '|', 'CH₂', '|', 'C=O', '|', 'CH₂–NH₃⁺'),
  pbg: j('[Pyrrol-Ring]', '–CH₂–NH₃⁺', '–CH₂–COO⁻', '–CH₂CH₂–COO⁻'),
  uroporphyrinogen: j('[Tetrapyrrol]', '(Porphyrinogen)', '4 Acetat +', '4 Propionat'),
  coproporphyrinogen: j('[Tetrapyrrol]', '(Porphyrinogen)', '4 Methyl +', '4 Propionat'),
  protoporphyrin: j('[Tetrapyrrol]', '(konjugiert)', '4 Methyl, 2 Vinyl,', '2 Propionat'),
  biliverdin: j('[offenes', ' Tetrapyrrol]', 'Biliverdin (grün)'),
  bilirubin: j('[offenes', ' Tetrapyrrol]', 'Bilirubin', '(gelb, lipophil)'),
  bilirubinGlucuronid: j('Bilirubin', '+ 2 Glucuronsäure', '(wasserlöslich,', ' „direkt“)'),
  sterkobilin: j('[offenes', ' Tetrapyrrol]', 'Urobilin/', 'Sterkobilin'),

  // --- Cholesterinbiosynthese ---
  mevalonat: j('COO⁻', '|', 'CH₂', '|', 'C(OH)(CH₃)', '|', 'CH₂', '|', 'CH₂OH'),
  ipp: j('CH₂=C(CH₃)', '|', 'CH₂–CH₂', '|', 'O–Ⓟ–Ⓟ', '(Isopren-Einheit)'),
  squalen: j('C₃₀-Isoprenoid', '(6 Isopren-', ' Einheiten,', ' linear)'),
  cholesterin: j('Steran-Gerüst', '(4 Ringe)', '+ OH an C3', '+ Seitenkette'),

  // --- Purinbiosynthese ---
  prpp: j('5-Phospho-', 'ribose', '|', '1-O–Ⓟ–Ⓟ', '(aktiviert)'),
  imp: j('Hypoxanthin', '(Purin)', '|', 'Ribose–Ⓟ'),
  amp: j('Adenin', '(Purin)', '|', 'Ribose–Ⓟ'),
  gmp: j('Guanin', '(Purin)', '|', 'Ribose–Ⓟ'),

  // --- Pyrimidinbiosynthese ---
  carbamoylphosphat: j('H₂N–C=O', '|', 'O–Ⓟ'),
  carbamoylaspartat: j('H₂N–C(=O)–NH', '|', 'CH–COO⁻', '|', 'CH₂–COO⁻'),
  orotat: j('[Pyrimidin-', ' Ring]', 'Orotsäure', '–COO⁻'),
  ump: j('Uracil', '(Pyrimidin)', '|', 'Ribose–Ⓟ'),
  ctp: j('Cytosin', '(Pyrimidin)', '|', 'Ribose–Ⓟ–Ⓟ–Ⓟ'),

  // --- Katecholaminsynthese ---
  tyrosin: j('HO–[Benzol]', '|', 'CH₂', '|', 'CH–NH₃⁺', '|', 'COO⁻'),
  ldopa: j('HO–[Benzol]–OH', '|', 'CH₂', '|', 'CH–NH₃⁺', '|', 'COO⁻'),
  dopamin: j('HO–[Benzol]–OH', '|', 'CH₂', '|', 'CH₂–NH₃⁺'),
  noradrenalin: j('HO–[Benzol]–OH', '|', 'CH(OH)', '|', 'CH₂–NH₃⁺'),
  adrenalin: j('HO–[Benzol]–OH', '|', 'CH(OH)', '|', 'CH₂–NH₂⁺–CH₃'),
}
