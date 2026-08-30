export function sanitizeDatabaseUrl(url: string | undefined): string {
  if (!url) return "";

  return url
    .replace(/&channel_binding=[^&#]*/g, "")
    .replace(/\?channel_binding=[^&#]*&?/g, "?")
    .replace(/\?$/, "");
}

export function getDatabaseUrl(): string {
  return sanitizeDatabaseUrl(process.env.DATABASE_URL);
}