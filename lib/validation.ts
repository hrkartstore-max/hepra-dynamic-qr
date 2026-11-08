import { z } from "zod";

export const httpsUrlSchema = z.string().url().refine((value) => {
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}, "Please enter a valid HTTPS URL.");

export const slugSchema = z.string().min(4).max(48).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens.");
