import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Aucun fichier fourni." },
        { status: 400 }
      );
    }

    // Validation type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Format non autorisé. Utilisez JPG, PNG ou WebP." },
        { status: 400 }
      );
    }

    // Validation taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Fichier trop volumineux. Maximum 5MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const url = await uploadImage(buffer, "ids/etudiants");

    return NextResponse.json({ success: true, data: { url } });
  } catch (error) {
    console.error("[UPLOAD]", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'upload." },
      { status: 500 }
    );
  }
}