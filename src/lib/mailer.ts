import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.hostinger.com",
  port: Number(process.env.SMTP_PORT || 465),
  secure: process.env.SMTP_SECURE !== "false",
  auth: {
    user: process.env.EMAIL_ADDRESS!,
    pass: process.env.EMAIL_PASSWORD!,
  },
});

function getLogoAttachment(): { filename: string; path: string; cid: string } | null {
  try {
    const logoPath = path.join(process.cwd(), "logo.jpeg");
    if (!fs.existsSync(logoPath)) return null;

    return {
      filename: "logo.jpeg",
      path: logoPath,
      cid: "ids-sprachschule-logo",
    };
  } catch {
    return null;
  }
}

function withLogoAttachment(attachments: Array<Record<string, unknown>> = []): Array<Record<string, unknown>> {
  const logo = getLogoAttachment();
  if (!logo) return attachments;

  return [{
    filename: logo.filename,
    path: logo.path,
    cid: logo.cid,
  }, ...attachments];
}

function baseTemplate(content: string): string {
  const headerImg = `<img src="cid:ids-sprachschule-logo" alt="IDS-Sprachschule" style="display:block;max-width:100%;width:320px;height:auto;margin:0 auto;border:0;" />`;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>IDS-Sprachschule</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background:#0a0a0a;padding:24px 32px;text-align:center;">
              ${headerImg}
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background:#0a0a0a;padding:20px 32px;text-align:center;">
              <p style="color:#888;font-size:12px;margin:0;">
                IDS-Sprachschule – Biyem-Assi, Yaoundé, Cameroun<br/>
                Email : info@ids-sprachschule.com | WhatsApp : +49 1573 0323154
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendInscriptionConfirmation(
  to: string,
  prenom: string,
  nom: string,
  numeroInscription: string,
  niveauAllemand: string,
  tarif: { prixFCFA: string; prixEUR: string } | null
): Promise<void> {
  const ligneFrais = tarif
    ? `aux <strong>frais de formation du niveau ${niveauAllemand}</strong> choisi : <strong>${tarif.prixFCFA} / ${tarif.prixEUR}</strong> ;`
    : `aux <strong>frais de formation du niveau ${niveauAllemand}</strong> choisi ;`;

  const content = `
    <p style="color:#333;font-size:16px;">Bonjour <strong>${prenom} ${nom}</strong>,</p>
    <p style="color:#555;font-size:15px;line-height:1.7;margin-top:16px;">
      Nous vous remercions pour votre inscription à <strong>IDS-Sprachschule</strong>.
    </p>
    <div style="background:#f5f5f5;border-left:4px solid #CC0000;padding:16px 20px;margin:24px 0;border-radius:4px;">
      <p style="margin:0;color:#333;font-size:15px;">
        Votre <strong>numéro d'inscription</strong> est : <strong style="color:#CC0000;">${numeroInscription}</strong>
      </p>
    </div>
    <p style="color:#555;font-size:15px;line-height:1.7;">
      Vous pouvez également visiter notre site web :
      <a href="https://ids-sprachschule.com/en" style="color:#CC0000;">https://ids-sprachschule.com/en</a>
    </p>
    <p style="color:#555;font-size:15px;line-height:1.7;">
      Pour confirmer votre inscription, veuillez effectuer votre paiement en utilisant l'un des moyens suivants :
    </p>
    <ul style="color:#555;font-size:15px;line-height:1.9;padding-left:20px;">
      <li><strong>Orange Money :</strong> 695191134</li>
      <li><strong>MTN Mobile Money :</strong> 681067657</li>
      <li><strong>PayPal :</strong> paypal@ids-sprachschule.com</li>
    </ul>
    <p style="color:#333;font-size:15px;font-weight:bold;margin-top:20px;">Montant à payer :</p>
    <p style="color:#555;font-size:15px;line-height:1.7;">
      Le montant total à régler correspond :
    </p>
    <ul style="color:#555;font-size:15px;line-height:1.9;padding-left:20px;">
      <li>${ligneFrais}</li>
      <li>plus <strong>10 000 FCFA de frais d'inscription</strong>, si vous êtes un <strong>nouvel étudiant</strong>.</li>
    </ul>
    <div style="background:#fff3cd;border:1px solid #ffc107;padding:12px 16px;border-radius:4px;margin:20px 0;">
      <p style="margin:0;color:#856404;font-size:14px;line-height:1.7;">
        <strong>Important :</strong> les <strong>frais d'inscription de 10 000 FCFA</strong> sont <strong>payables une seule fois</strong>
        et <strong>uniquement par les nouveaux étudiants</strong>. Une fois réglés, ils restent valables pour l'ensemble de votre
        parcours à IDS-Sprachschule, quel que soit le nombre de niveaux que vous suivrez.
      </p>
    </div>
    <p style="color:#555;font-size:15px;line-height:1.7;">
      Vous avez également la possibilité d'effectuer votre paiement <strong>en espèces</strong> directement dans notre centre,
      situé à <strong>Biyem-Assi, Carrefour Scalom</strong>. Notre centre est <strong>ouvert du lundi au samedi</strong>.
    </p>
    <p style="color:#555;font-size:15px;line-height:1.7;">
      Dès réception de votre paiement, votre inscription sera confirmée et vous recevrez toutes les informations
      relatives au début de votre formation.
    </p>
    <p style="color:#555;font-size:15px;line-height:1.7;">
      Pour toute question ou information complémentaire, n'hésitez pas à nous contacter.
    </p>
    <p style="color:#555;font-size:15px;margin-top:24px;">Cordialement,</p>
    <p style="color:#0a0a0a;font-weight:bold;font-size:15px;">
      L'équipe IDS-Sprachschule
    </p>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM!,
    to,
    subject: "Inscription reçue – IDS-Sprachschule",
    html: baseTemplate(content),
    attachments: withLogoAttachment(),
  });
}

export async function sendAdminNewInscription(
  prenom: string,
  nom: string,
  niveau: string,
  numeroInscription: string
): Promise<void> {
  const content = `
    <p style="color:#333;font-size:16px;">Nouvelle inscription reçue</p>
    <div style="background:#f5f5f5;padding:16px 20px;margin:16px 0;border-radius:4px;">
      <p style="margin:4px 0;color:#555;">Étudiant : <strong>${prenom} ${nom}</strong></p>
      <p style="margin:4px 0;color:#555;">Niveau : <strong>${niveau}</strong></p>
      <p style="margin:4px 0;color:#555;">N° dossier : <strong style="color:#CC0000;">${numeroInscription}</strong></p>
    </div>
    <p style="color:#555;font-size:14px;">
      Connectez-vous au dashboard admin pour examiner ce dossier.
    </p>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM!,
    to: process.env.ADMIN_EMAIL!,
    subject: `Nouvelle inscription – ${prenom} ${nom} – Niveau ${niveau}`,
    html: baseTemplate(content),
    attachments: withLogoAttachment(),
  });
}

export async function sendValidationEmail(
  to: string,
  prenom: string,
  nom: string,
  numeroInscription: string,
  // motDePasseTemp reste généré et stocké en base (nécessaire pour la connexion
  // future), mais n'est plus transmis par email.
  _motDePasseTemp: string,
  pdfBuffer: Buffer
): Promise<void> {
  const content = `
    <p style="color:#333;font-size:16px;">Bonjour <strong>${prenom} ${nom}</strong>,</p>
    <p style="color:#555;font-size:15px;line-height:1.7;margin-top:16px;">
      Félicitations ! Votre inscription à <strong>IDS-Sprachschule</strong>
      a été <strong style="color:#16a34a;">validée</strong>.
    </p>
    <p style="color:#555;font-size:15px;line-height:1.7;">
      Le programme et les horaires de vos cours vous seront communiqués dans les meilleurs délais.
      En attendant, nous vous invitons à passer dans notre centre afin de récupérer vos manuels
      de cours, si ce n'est pas déjà fait.
    </p>
    <p style="color:#555;font-size:15px;line-height:1.7;">
      Vous pouvez également visiter notre site web :
      <a href="https://ids-sprachschule.com/en" style="color:#CC0000;">https://ids-sprachschule.com/en</a>
    </p>
    <p style="color:#555;font-size:14px;">
      Vous trouverez ci-joint votre fiche d'inscription.
    </p>
    <p style="color:#555;font-size:15px;margin-top:24px;">Cordialement,</p>
    <p style="color:#0a0a0a;font-weight:bold;font-size:15px;">L'équipe IDS-Sprachschule</p>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM!,
    to,
    subject: "Inscription validée – IDS-Sprachschule",
    html: baseTemplate(content),
    attachments: withLogoAttachment([
      {
        filename: `fiche-inscription-${numeroInscription}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ]),
  });
}

export async function sendRefusEmail(
  to: string,
  prenom: string,
  motif: string
): Promise<void> {
  const content = `
    <p style="color:#333;font-size:16px;">Bonjour <strong>${prenom}</strong>,</p>
    <p style="color:#555;font-size:15px;line-height:1.7;margin-top:16px;">
      Suite à l'examen de votre dossier d'inscription, nous ne sommes pas en mesure
      de valider votre candidature pour la raison suivante :
    </p>
    <div style="background:#fff5f5;border-left:4px solid #CC0000;padding:16px 20px;margin:20px 0;border-radius:4px;">
      <p style="margin:0;color:#555;font-size:15px;">${motif}</p>
    </div>
    <p style="color:#555;font-size:15px;">
      N'hésitez pas à nous contacter pour plus d'informations ou pour soumettre
      une nouvelle candidature.
    </p>
    <p style="color:#555;font-size:15px;margin-top:24px;">Cordialement,</p>
    <p style="color:#0a0a0a;font-weight:bold;font-size:15px;">L'équipe IDS-Sprachschule</p>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM!,
    to,
    subject: "Mise à jour de votre dossier IDS-Sprachschule",
    html: baseTemplate(content),
    attachments: withLogoAttachment(),
  });
}

export async function sendPasswordResetEmail(
  to: string,
  prenom: string
): Promise<void> {
  const content = `
    <p style="color:#333;font-size:16px;">Bonjour <strong>${prenom}</strong>,</p>
    <p style="color:#555;font-size:15px;line-height:1.7;margin-top:16px;">
      Votre dossier IDS-Sprachschule a été pris en charge par l'administration.
    </p>
    <p style="color:#555;font-size:15px;line-height:1.7;">
      Le programme et les horaires de vos cours vous seront communiqués dans les meilleurs délais.
      En attendant, nous vous invitons à passer dans notre centre afin de récupérer vos manuels
      de cours, si ce n'est pas déjà fait.
    </p>
    <p style="color:#555;font-size:15px;line-height:1.7;">
      Vous pouvez aussi visiter notre site web :
      <a href="https://ids-sprachschule.com/en" style="color:#CC0000;">https://ids-sprachschule.com/en</a>
    </p>
    <p style="color:#555;font-size:15px;margin-top:24px;">Cordialement,</p>
    <p style="color:#0a0a0a;font-weight:bold;font-size:15px;">L'équipe IDS-Sprachschule</p>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM!,
    to,
    subject: "Mise à jour de votre dossier IDS-Sprachschule",
    html: baseTemplate(content),
    attachments: withLogoAttachment(),
  });
}

export interface BulkSendResult {
  sent: number;
  failed: number;
  failedEmails: string[];
}

export async function sendBulkMessage(
  recipients: string[],
  sujet: string,
  corps: string
): Promise<BulkSendResult> {
  const uniqueRecipients = [...new Set(recipients.filter((e) => e && e.trim()))];

  const content = `
    <p style="color:#333;font-size:16px;">${corps.replace(/\n/g, "<br/>")}</p>`;

  const failedEmails: string[] = [];
  const concurrency = 5;
  let index = 0;

  async function worker() {
    while (index < uniqueRecipients.length) {
      const email = uniqueRecipients[index++];
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM!,
          to: email,
          subject: sujet,
          html: baseTemplate(content),
          attachments: withLogoAttachment(),
        });
      } catch (error) {
        failedEmails.push(email);
        console.error(`[MAIL] FAIL -> ${email}`, error);
      }
    }
  }

  await Promise.all(
    Array.from(
      { length: Math.min(concurrency, uniqueRecipients.length) },
      () => worker()
    )
  );

  return {
    sent: uniqueRecipients.length - failedEmails.length,
    failed: failedEmails.length,
    failedEmails,
  };
}