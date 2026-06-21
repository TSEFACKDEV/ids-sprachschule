export type Locale = "fr" | "en" | "de";

export type Role = "ADMIN" | "ETUDIANT";

export type StatutInscription = "EN_ATTENTE" | "VALIDE" | "REFUSE";

export type NiveauAllemand = "A1" | "A2" | "B1" | "B2" | "C1";

export type TypeCours =
  | "SEMAINE_MATIN"
  | "SEMAINE_SOIR"
  | "WEEKEND_SAT_DIM"
  | "WEEKEND_SAT_MER_DIM"
  | "EN_LIGNE"
  | "PRESENTIEL";

export type TypeExamen = "GOETHE" | "OSD" | "TELC" | "ECL" | "TESTDAF";

export type NatureFacture = "ACOMPTE" | "TOTAL";

export type ModePaiement =
  | "ESPECES"
  | "VIREMENT"
  | "PAYPAL"
  | "ORANGE_MONEY"
  | "MTN_MONEY";

export type Objectif =
  | "ETUDES_ALLEMAGNE"
  | "TRAVAIL"
  | "EXAMEN"
  | "VOYAGE"
  | "AUTRE";

export interface JWTPayload {
  userId: string;
  role: Role;
  mustChangePassword: boolean;
  etudiantId?: string;
  numeroInscription?: string;
  iat?: number;
  exp?: number;
}

export interface EtudiantPublic {
  id: string;
  numeroInscription: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  dateNaissance: string;
  sexe: string;
  nationalite: string;
  adresse: string;
  ville: string;
  codePostal?: string;
  photoUrl?: string;
  niveauEtudes: string;
  profession?: string;
  objectif: Objectif;
  disponibilites: Record<string, boolean>;
  joursPreferees: string[];
  niveauAllemand: NiveauAllemand;
  typeCours: string;
  statut: StatutInscription;
  dateInscription: string;
}

export interface GroupePublic {
  id: string;
  nom: string;
  niveau: NiveauAllemand;
  type: TypeCours;
  heureDebut: string;
  heureFin: string;
  salle: string;
  enseignant: string;
}

export interface FacturePublic {
  id: string;
  numeroRecu: string;
  formation: string;
  montantTotal: number;
  montantVerse: number;
  resteAPayer: number;
  nature: NatureFacture;
  modePaiement: ModePaiement;
  statut: string;
  date: string;
}

export interface CoursPublic {
  id: string;
  niveau: NiveauAllemand;
  nom: string;
  description: string;
  competences: string;
  dureeEnMois: number;
  preparationGratuiteIncluse: boolean;
  formats: FormatCoursPublic[];
}

export interface FormatCoursPublic {
  id: string;
  type: TypeCours;
  dureeMois: number;
  prixFCFA: number;
  prixEUR: number;
}

export interface InscriptionFormData {
  nom: string;
  prenom: string;
  dateNaissance: string;
  sexe: string;
  nationalite: string;
  adresse: string;
  ville: string;
  codePostal: string;
  telephone: string;
  email: string;
  photoUrl: string;
  niveauAllemand: NiveauAllemand | "";
  typeCours: string;
  objectif: Objectif | "";
  disponibilites: {
    matin: boolean;
    apresMidi: boolean;
    soir: boolean;
    weekend: boolean;
  };
  joursPreferees: string[];
  niveauEtudes: string;
  profession: string;
  accepteReglement: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}