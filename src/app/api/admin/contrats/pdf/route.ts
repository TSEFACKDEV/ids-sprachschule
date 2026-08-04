import { NextResponse } from "next/server";
import { getAuthUser, isStaff } from "@/lib/auth";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

function generateUniqueContractId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `CT-${year}${month}${day}-${random}`;
}

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !isStaff(authUser.role)) {
      return NextResponse.json({ success: false, error: "Accès refusé." }, { status: 403 });
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { width, height } = page.getSize();

    page.drawRectangle({ x: 0, y: height - 125, width, height: 125, color: rgb(0.04, 0.04, 0.04) });
    page.drawText("CONTRAT IDS-SPRACHSCHULE", {
      x: 40,
      y: height - 70,
      size: 18,
      font: fontBold,
      color: rgb(0.83, 0.686, 0.216),
    });

    const logoPath = path.join(process.cwd(), "public", "images", "logo.png");
    if (fs.existsSync(logoPath)) {
      try {
        const logoBytes = fs.readFileSync(logoPath);
        const logoImage = await pdfDoc.embedPng(logoBytes);
        page.drawImage(logoImage, { x: width - 110, y: height - 105, width: 70, height: 70 });
      } catch {
        // ignore invalid image
      }
    }

    const contractId = generateUniqueContractId();
    page.drawText(`Identifiant du contrat : ${contractId}`, {
      x: 40,
      y: height - 95,
      size: 10,
      font: fontRegular,
      color: rgb(1, 1, 1),
    });

    page.drawText("Ce document est un modèle de contrat téléchargeable, à personnaliser selon l’étudiant et le programme choisi.", {
      x: 40,
      y: height - 160,
      size: 11,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });

    page.drawText("Nom de l’étudiant : __________________________", { x: 40, y: height - 220, size: 11, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    page.drawText("Programme : ______________________________", { x: 40, y: height - 250, size: 11, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    page.drawText("Signature : ______________________________", { x: 40, y: height - 310, size: 11, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });

    const pdfBytes = await pdfDoc.save();
    const body = new Uint8Array(pdfBytes);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="contrat-${contractId}.pdf"`,
        "Content-Length": String(body.length),
      },
    });
  } catch (error) {
    console.error("[CONTRATS_PDF]", error);
    return NextResponse.json({ success: false, error: "Erreur génération du contrat." }, { status: 500 });
  }
}
