export const PRIX_COURS: Record<string, { prixFCFA: string; prixEUR: string }[]> = {
  A1: [
    { prixFCFA: "100 000 FCFA", prixEUR: "153 €" },
    { prixFCFA: "100 000 FCFA", prixEUR: "153 €" },
    { prixFCFA: "120 000 FCFA", prixEUR: "183 €" }
  ],
  A2: [
    { prixFCFA: "105 000 FCFA", prixEUR: "161 €" },
    { prixFCFA: "105 000 FCFA", prixEUR: "161 €" },
    { prixFCFA: "125 000 FCFA", prixEUR: "191 €" }
  ],
  B1: [
    { prixFCFA: "110 000 FCFA", prixEUR: "168 €" },
    { prixFCFA: "110 000 FCFA", prixEUR: "168 €" },
    { prixFCFA: "130 000 FCFA", prixEUR: "199 €" }
  ],
  B2: [
    { prixFCFA: "115 000 FCFA", prixEUR: "176 €" },
    { prixFCFA: "115 000 FCFA", prixEUR: "176 €" },
    { prixFCFA: "135 000 FCFA", prixEUR: "206 €" }
  ],
  C1: [
    { prixFCFA: "120 000 FCFA", prixEUR: "183 €" },
    { prixFCFA: "120 000 FCFA", prixEUR: "183 €" },
    { prixFCFA: "140 000 FCFA", prixEUR: "214 €" }
  ]
};

const FORMAT_INDEX: Record<string, number> = {
  SEMAINE_MATIN: 0,
  SEMAINE_SOIR: 1,
  WEEKEND_SAT_DIM: 2,
};

export function getTarifCours(
  niveau: string,
  typeCours: string
): { prixFCFA: string; prixEUR: string } | null {
  const list = PRIX_COURS[niveau];
  if (!list) return null;
  const idx = FORMAT_INDEX[typeCours] ?? 0;
  return list[idx] ?? null;
}
