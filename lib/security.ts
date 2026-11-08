import { createHash, randomBytes } from "node:crypto";

export function hashActivationCode(code: string) {
  const pepper = process.env.ACTIVATION_CODE_PEPPER;
  if (!pepper) throw new Error("ACTIVATION_CODE_PEPPER is not configured.");
  return createHash("sha256").update(pepper + ":" + code.toUpperCase()).digest("hex");
}

export function generateActivationCode() {
  return randomBytes(5).toString("hex").toUpperCase();
}

export function generateSlug() {
  return randomBytes(7).toString("hex");
}
