import type { TokenPayload } from "../types";

export function parseJwtToken(token: string | null): TokenPayload | null {
  if (!token) return null;

  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;

    const decodedJson = atob(payloadBase64);
    return JSON.parse(decodedJson) as TokenPayload;
  } catch (e) {
    console.error("Erro ao decodificar token JWT:", e);
    return null;
  }
}

export function getUsuarioDoToken() {
  const token = localStorage.getItem("token");
  const payload = parseJwtToken(token);

  const nomeCompleto = payload?.name || "Usuário";
  const partesNome = nomeCompleto.trim().split(/\s+/);
  const primeiroNome = partesNome[0] || "Usuário";

  const inicial =
    partesNome.length > 1
      ? `${partesNome[0][0]}${partesNome[1][0]}`.toUpperCase()
      : primeiroNome.substring(0, 2).toUpperCase();

  return { nome: primeiroNome, inicial, payload };
}
