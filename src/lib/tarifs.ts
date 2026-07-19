export const PRIX_COURS: Record<string, { prixFCFA: string; prixEUR: string }[]> = {
  A1: [
    { prixFCFA: "110 000 FCFA", prixEUR: "170 €" },
    { prixFCFA: "110 000 FCFA", prixEUR: "170 €" },
    { prixFCFA: "140 000 FCFA", prixEUR: "215 €" }
  ],
  A2: [
    { prixFCFA: "120 000 FCFA", prixEUR: "185 €" },
    { prixFCFA: "120 000 FCFA", prixEUR: "185 €" },
    { prixFCFA: "150 000 FCFA", prixEUR: "230 €" }
  ],
  B1: [
    { prixFCFA: "130 000 FCFA", prixEUR: "200 €" },
    { prixFCFA: "130 000 FCFA", prixEUR: "200 €" },
    { prixFCFA: "160 000 FCFA", prixEUR: "245 €" }
  ],
  B2: [
    { prixFCFA: "140 000 FCFA", prixEUR: "215 €" },
    { prixFCFA: "140 000 FCFA", prixEUR: "215 €" },
    { prixFCFA: "170 000 FCFA", prixEUR: "260 €" }
  ],
  C1: [
    { prixFCFA: "140 000 FCFA", prixEUR: "215 €" },
    { prixFCFA: "140 000 FCFA", prixEUR: "215 €" },
    { prixFCFA: "170 000 FCFA", prixEUR: "260 €" }
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
