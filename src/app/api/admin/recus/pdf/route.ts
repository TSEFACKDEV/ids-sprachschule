import { NextResponse } from "next/server";
import { getAuthUser, isStaff } from "@/lib/auth";
import { PDFDocument, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

function generateUniqueRecuId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `REC-${year}${month}${day}-${hours}${minutes}${seconds}-${random}`;
}

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser || !isStaff(authUser.role)) {
      return NextResponse.json({ success: false, error: "Accès refusé." }, { status: 403 });
    }

    const templatePath = path.join(process.cwd(), "Recu_de_paiement_IDS_v2_modifie.pdf");
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { success: false, error: "Template PDF introuvable." },
        { status: 404 }
      );
    }

    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const uniqueId = generateUniqueRecuId();
    const pages = pdfDoc.getPages();

    const logoPath = path.join(process.cwd(), "public", "images", "logo.png");

    for (const page of pages) {
      const { height } = page.getSize();

      if (fs.existsSync(logoPath)) {
        try {
          const logoBytes = fs.readFileSync(logoPath);
          const logoImage = await pdfDoc.embedPng(logoBytes);
          page.drawImage(logoImage, {
            x: 32,
            y: height - 100,
            width: 70,
            height: 70,
          });
        } catch {
          // Logo non lisible, on continue sans
        }
      }

      const fontBold = await pdfDoc.embedFont("Helvetica-Bold");
      page.drawText(`N° ${uniqueId}`, {
        x: 32,
        y: height - 115,
        size: 11,
        font: fontBold,
        color: rgb(0.8, 0, 0),
      });
    }

    const pdfBytes = await pdfDoc.save();
    const body = new Uint8Array(pdfBytes);

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="recu-${uniqueId}.pdf"`,
        "Content-Length": String(body.length),
      },
    });
  } catch (error) {
    console.error("[RECUS_PDF]", error);
    return NextResponse.json(
      { success: false, error: "Erreur génération du reçu." },
      { status: 500 }
    );
  }
}
