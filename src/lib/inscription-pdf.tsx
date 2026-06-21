import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image as PDFImage,
  renderToBuffer,
  Font,
} from "@react-pdf/renderer";
import type { EtudiantPublic } from "@/types";

const OBJECTIF_LABELS: Record<string, string> = {
  ETUDES_ALLEMAGNE: "Études en Allemagne",
  TRAVAIL: "Travail",
  EXAMEN: "Préparation examen",
  VOYAGE: "Voyage",
  AUTRE: "Autre",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontSize: 10,
    color: "#0A0A0A",
  },
  header: {
    backgroundColor: "#0A0A0A",
    padding: 20,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 4,
  },
  logoContainer: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: "contain",
  },
  headerText: {
    flex: 1,
  },
  schoolName: {
    color: "#D4AF37",
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  slogan: {
    color: "#CC0000",
    fontSize: 9,
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 6,
    color: "#0A0A0A",
  },
  subtitle: {
    fontSize: 11,
    textAlign: "center",
    color: "#CC0000",
    marginBottom: 20,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#D4AF37",
    backgroundColor: "#0A0A0A",
    padding: "6 10",
    marginBottom: 8,
    borderRadius: 2,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
    paddingBottom: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eeeeee",
  },
  label: {
    width: "40%",
    fontFamily: "Helvetica-Bold",
    color: "#555555",
    fontSize: 9,
  },
  value: {
    width: "60%",
    color: "#0A0A0A",
    fontSize: 9,
  },
  numeroBadge: {
    backgroundColor: "#CC0000",
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    padding: 10,
    borderRadius: 4,
    marginBottom: 20,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 0.5,
    borderTopColor: "#cccccc",
    paddingTop: 10,
    fontSize: 8,
    color: "#999999",
    textAlign: "center",
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 4,
    objectFit: "cover",
  },
  photoContainer: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
});

function InscriptionDocument({ etudiant }: { etudiant: EtudiantPublic }) {
  const dateNaissance = new Date(etudiant.dateNaissance);
  const dateInscription = new Date(etudiant.dateInscription);

  const formatDate = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

  const jours = Array.isArray(etudiant.joursPreferees)
    ? etudiant.joursPreferees.join(", ")
    : "";

  const dispos = etudiant.disponibilites
    ? Object.entries(etudiant.disponibilites)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(", ")
    : "";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <PDFImage
              style={styles.logo}
              src="./public/images/logo.png"
            />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.schoolName}>
              IDS – Institut für die Deutsche Sprache
            </Text>
            <Text style={{ color: "#999", fontSize: 8, marginBottom: 2 }}>
              Carrefour Scalom, Biyem-Assi, Yaoundé, Cameroun
            </Text>
            <Text style={{ color: "#999", fontSize: 8, marginBottom: 2 }}>
              WhatsApp : +49 1573 0323154 | info@ids-sprachschule.com
            </Text>
            <Text style={styles.slogan}>
              Lernen. Verstehen. Erfolgreich sein.
            </Text>
          </View>
        </View>

        {/* Titre */}
        <Text style={styles.title}>FICHE D'INSCRIPTION</Text>
        <Text style={styles.subtitle}>
          Académie de langue allemande – Yaoundé, Cameroun
        </Text>

        {/* Numéro */}
        <Text style={styles.numeroBadge}>
          N° {etudiant.numeroInscription} — Inscrit le {formatDate(dateInscription)}
        </Text>

        {/* Photo */}
        {etudiant.photoUrl && (
          <View style={styles.photoContainer}>
            <PDFImage style={styles.photo} src={etudiant.photoUrl} />
          </View>
        )}

        {/* Informations personnelles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMATIONS PERSONNELLES</Text>
          {[
            ["Nom", etudiant.nom],
            ["Prénom", etudiant.prenom],
            ["Date de naissance", formatDate(dateNaissance)],
            ["Sexe", etudiant.sexe],
            ["Nationalité", etudiant.nationalite],
            ["Adresse", `${etudiant.adresse}, ${etudiant.ville}${etudiant.codePostal ? ` ${etudiant.codePostal}` : ""}`],
            ["Téléphone / WhatsApp", etudiant.telephone],
            ["Email", etudiant.email],
          ].map(([label, value]) => (
            <View style={styles.row} key={label}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Formation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FORMATION CHOISIE</Text>
          {[
            ["Niveau d'allemand", etudiant.niveauAllemand],
            ["Type de cours", etudiant.typeCours],
            ["Objectif", OBJECTIF_LABELS[etudiant.objectif] ?? etudiant.objectif],
            ["Disponibilités", dispos],
            ["Jours préférés", jours],
          ].map(([label, value]) => (
            <View style={styles.row} key={label}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Académique */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PARCOURS ACADÉMIQUE</Text>
          {[
            ["Niveau d'études", etudiant.niveauEtudes],
            ["Profession / Domaine", etudiant.profession ?? "—"],
          ].map(([label, value]) => (
            <View style={styles.row} key={label}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Institut für die Deutsche Sprache – Biyem-Assi, Yaoundé, Cameroun |
            info@ids-sprachschule.com | +49 1573 2878223
          </Text>
          <Text style={{ marginTop: 4 }}>
            Document généré automatiquement – Ne pas modifier
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateInscriptionPDF(
  etudiant: EtudiantPublic
): Promise<Buffer> {
  const buffer = await renderToBuffer(
    <InscriptionDocument etudiant={etudiant} />
  );
  return Buffer.from(buffer);
}