# 🧬 Stoffwechsel-Quiz

Interaktives Lern-Quiz für biochemische Stoffwechselwege (Nuxt 3 + Canvas). Lernen über eine 2D-Karte: Wege erkunden, Zwischenprodukte/Enzyme per Klick auf der Karte zuordnen, Richtungen und Netto-Bilanzen abfragen. Der Lernfortschritt wird pro Profil im Browser gespeichert (Leitner-System für gezielte Wiederholung).

## Features

- **Übersichtskarte** aller Stoffwechselwege – zeigt über gemeinsame Metabolite (Acetyl-CoA, Pyruvat, Glucose-6-P …), wie die Wege zusammenhängen. Anklickbare Wege führen ins Detail.
- **Detail-Ansicht je Weg** in zwei Modi:
  - *Erkunden* – vollständige Karte mit Intermediaten, Enzymen, Richtungen (→ irreversibel, ⇌ reversibel), Cofaktoren (grün = verbraucht, rot = wird frei), Reaktionstabelle und Quellen.
  - *Quiz* – vier Fragetypen: Metabolit anklicken, Enzym-Reaktion anklicken, Richtung bestimmen, „was wird frei/verbraucht".
- **Netto-Gesamtbilanz** je Weg als kompakte Übersicht (Redoxreaktionen, CO₂, NADH/FADH₂, Phosphoanhydridbindungen, Transaminierungen …).
- **Orientierungs-Mini-Map** zeigt jederzeit, wo im Gesamtbild man sich befindet.
- **Fortschritt pro Profil** im `localStorage` (Leitner-Boxen 1–5): falsch beantwortete und ungesehene Items werden bevorzugt wiederholt.

## Stand

| Weg | Status |
| --- | --- |
| Citratzyklus | ✅ Detail + Quiz |
| Glykolyse, Gluconeogenese, β-Oxidation, Harnstoffzyklus, … | 🔜 geplant (in Übersicht referenziert) |

## Setup

Das Projekt nutzt **Yarn 4** (Berry, `nodeLinker: node-modules`).

```bash
yarn install
yarn dev      # http://localhost:3000
```

Weitere Skripte:

```bash
yarn build    # Produktions-Build
yarn preview  # Build lokal testen
yarn generate # statische Seite generieren
```

## Projektstruktur

```
data/
  overview.ts          # Knoten + Kanten der Gesamtübersicht
  pathways/
    index.ts           # Registry aller Wege
    citratzyklus.ts     # ein Weg = eine Datei
types/metabolism.ts    # Datenmodell (Pathway, Reaction, Cofactor …)
components/
  OverviewMap.vue       # Canvas-Übersicht
  PathwayCanvas.vue     # Canvas-Renderer je Weg (Explore + Quiz-Hittests)
  NetBalance.vue        # Netto-Bilanz
  AppHeader.vue         # Profilauswahl + Breadcrumb
composables/
  useProgress.ts        # Leitner-Fortschritt im localStorage
  useProfile.ts         # Lernprofile
  useDpiCanvas.ts        # HiDPI-Canvas + Resize
utils/                  # Canvas-, Quiz-, Storage-, Theme-Helfer
pages/
  index.vue             # Übersicht
  pathway/[id].vue       # Detail + Quiz
```

## Neuen Stoffwechselweg ergänzen

1. Datei in `data/pathways/` anlegen, die das `Pathway`-Interface aus [`types/metabolism.ts`](types/metabolism.ts) erfüllt (Knoten mit normalisierten Koordinaten 0..1, Reaktionen mit Enzym/Richtung/Cofaktoren, Netto-Bilanz, Quellen).
2. In [`data/pathways/index.ts`](data/pathways/index.ts) importieren und registrieren.
3. In [`data/overview.ts`](data/overview.ts) die zugehörige Kante auf `status: 'fertig'` setzen und `pathwayId` verknüpfen.

Quiz-Fragen werden automatisch aus den Daten generiert (`utils/quiz.ts`).

## Datenqualität

Inhalte stammen aus zuverlässigen Quellen (Wikipedia, AMBOSS, NCBI/StatPearls). Quellenabhängige oder unsichere Angaben (z. B. ΔG°′-Werte, ATP-Ausbeute) sind im Datenmodell mit `uncertain: true` markiert und erscheinen in der App als `*` – diese bitte selbst gegenprüfen.
