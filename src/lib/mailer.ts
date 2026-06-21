import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Yahoo",
  auth: {
    user: process.env.EMAIL_ADDRESS!,
    pass: process.env.EMAIL_PASSWORD!,
  },
});

function baseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>IDS – Institut für die Deutsche Sprache</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="background:#0a0a0a;padding:24px 32px;text-align:center;">
              <p style="color:#D4AF37;font-size:22px;font-weight:bold;margin:0;">
                IDS – Institut für die Deutsche Sprache
              </p>
              <p style="color:#CC0000;font-size:13px;margin:6px 0 0 0;">
                Lernen. Verstehen. Erfolgreich sein.
              </p>
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
                Institut für die Deutsche Sprache – Biyem-Assi, Yaoundé, Cameroun<br/>
                Email : info@ids-sprachschule.com | WhatsApp : +49 1573 2878223
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
  numeroInscription: string
): Promise<void> {
  const content = `
    <p style="color:#333;font-size:16px;">Bonjour <strong>${prenom}</strong>,</p>
    <p style="color:#555;font-size:15px;line-height:1.7;margin-top:16px;">
      Votre dossier d'inscription à l'Institut für die Deutsche Sprache a bien été reçu.
    </p>
    <div style="background:#f5f5f5;border-left:4px solid #CC0000;padding:16px 20px;margin:24px 0;border-radius:4px;">
      <p style="margin:0;color:#333;font-size:15px;">
        Votre numéro de dossier : <strong style="color:#CC0000;">${numeroInscription}</strong>
      </p>
    </div>
    <p style="color:#555;font-size:15px;line-height:1.7;">
      Nous examinerons votre dossier dans les meilleurs délais et vous recevrez vos
      identifiants de connexion dès validation.
    </p>
    <p style="color:#555;font-size:15px;margin-top:24px;">Cordialement,</p>
    <p style="color:#0a0a0a;font-weight:bold;font-size:15px;">
      L'équipe IDS
    </p>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM!,
    to,
    subject: "Inscription reçue – IDS",
    html: baseTemplate(content),
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
  });
}

export async function sendValidationEmail(
  to: string,
  prenom: string,
  nom: string,
  numeroInscription: string,
  motDePasseTemp: string,
  pdfBuffer: Buffer
): Promise<void> {
  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const content = `
    <p style="color:#333;font-size:16px;">Bonjour <strong>${prenom} ${nom}</strong>,</p>
    <p style="color:#555;font-size:15px;line-height:1.7;margin-top:16px;">
      Félicitations ! Votre inscription à l'Institut für die Deutsche Sprache (IDS)
      a été <strong style="color:#16a34a;">validée</strong>.
    </p>
    <div style="background:#0a0a0a;color:#fff;padding:20px 24px;margin:24px 0;border-radius:6px;">
      <p style="margin:0 0 8px 0;font-size:14px;color:#D4AF37;font-weight:bold;">
        Vos identifiants de connexion
      </p>
      <p style="margin:4px 0;font-size:15px;">
        Identifiant : <strong style="color:#D4AF37;">${numeroInscription}</strong>
      </p>
      <p style="margin:4px 0;font-size:15px;">
        Mot de passe temporaire : <strong style="color:#D4AF37;">${motDePasseTemp}</strong>
      </p>
    </div>
    <p style="color:#555;font-size:15px;">
      Connectez-vous sur :
      <a href="${appUrl}/fr/connexion" style="color:#CC0000;">${appUrl}/fr/connexion</a>
    </p>
    <div style="background:#fff3cd;border:1px solid #ffc107;padding:12px 16px;border-radius:4px;margin:20px 0;">
      <p style="margin:0;color:#856404;font-size:14px;">
        <strong>Important :</strong> vous serez invité à changer votre mot de passe
        dès votre première connexion.
      </p>
    </div>
    <p style="color:#555;font-size:14px;">
      Vous trouverez ci-joint votre fiche d'inscription.
    </p>
    <p style="color:#555;font-size:15px;margin-top:24px;">Cordialement,</p>
    <p style="color:#0a0a0a;font-weight:bold;font-size:15px;">L'équipe IDS</p>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM!,
    to,
    subject: "Inscription validée – Vos identifiants IDS",
    html: baseTemplate(content),
    attachments: [
      {
        filename: `fiche-inscription-${numeroInscription}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
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
    <p style="color:#0a0a0a;font-weight:bold;font-size:15px;">L'équipe IDS</p>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM!,
    to,
    subject: "Mise à jour de votre dossier IDS",
    html: baseTemplate(content),
  });
}

export async function sendPasswordResetEmail(
  to: string,
  prenom: string,
  numeroInscription: string,
  motDePasseTemp: string
): Promise<void> {
  const appUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const content = `
    <p style="color:#333;font-size:16px;">Bonjour <strong>${prenom}</strong>,</p>
    <p style="color:#555;font-size:15px;line-height:1.7;margin-top:16px;">
      Votre mot de passe a été réinitialisé par l'administration IDS.
    </p>
    <div style="background:#0a0a0a;color:#fff;padding:20px 24px;margin:24px 0;border-radius:6px;">
      <p style="margin:0 0 8px 0;font-size:14px;color:#D4AF37;font-weight:bold;">
        Nouveau mot de passe temporaire
      </p>
      <p style="margin:4px 0;font-size:15px;">
        Identifiant : <strong style="color:#D4AF37;">${numeroInscription}</strong>
      </p>
      <p style="margin:4px 0;font-size:15px;">
        Mot de passe : <strong style="color:#D4AF37;">${motDePasseTemp}</strong>
      </p>
    </div>
    <p style="color:#555;font-size:15px;">
      Connectez-vous sur :
      <a href="${appUrl}/fr/connexion" style="color:#CC0000;">${appUrl}/fr/connexion</a>
    </p>
    <p style="color:#555;font-size:14px;">
      Vous devrez définir un nouveau mot de passe personnel à votre prochaine connexion.
    </p>
    <p style="color:#555;font-size:15px;margin-top:24px;">Cordialement,</p>
    <p style="color:#0a0a0a;font-weight:bold;font-size:15px;">L'équipe IDS</p>`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM!,
    to,
    subject: "Réinitialisation de votre mot de passe – IDS",
    html: baseTemplate(content),
  });
}

export async function sendBulkMessage(
  recipients: string[],
  sujet: string,
  corps: string
): Promise<void> {
  const content = `
    <p style="color:#333;font-size:16px;">${corps.replace(/\n/g, "<br/>")}</p>`;

  for (const email of recipients) {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: sujet,
      html: baseTemplate(content),
    });
  }
}