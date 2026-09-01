import { format, parseISO, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatarMoedaInput(value: string) {
  const apenasNumeros = value.replace(/\D/g, "");

  if (!apenasNumeros) return "";

  const valorNumerico = Number(apenasNumeros) / 100;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valorNumerico);
}

export function formatarValidade(validade?: string | Date) {
  if (!validade) return "Val: N/A";
  const data = new Date(validade);
  return `Val: ${data.toLocaleDateString("pt-BR")}`;
}

export function formatarDataExtensa(data?: string | Date | null) {
  if (!data) return "-";

  try {
    const dataObj = typeof data === "string" ? parseISO(data) : data;
    return format(dataObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return "-";
  }
}

export function formatarDataMovimentacao(dataIso?: string | null) {
  if (!dataIso) return "";

  const data = parseISO(dataIso);
  const horario = format(data, "HH:mm");

  if (isToday(data)) {
    return `hoje, ${horario}`;
  }

  if (isYesterday(data)) {
    return `ontem, ${horario}`;
  }

  return `${format(data, "dd/MM/yyyy", { locale: ptBR })}, ${horario}`;
}

export function getSaudacao(): string {
  const hora = new Date().getHours();

  if (hora >= 5 && hora < 12) return "Bom dia";
  if (hora >= 12 && hora < 18) return "Boa tarde";
  return "Boa noite";
}

export function formatarMesAno(chaveMesAno: string) {
  const data = parseISO(`${chaveMesAno}-01`);

  const textoFormatado = format(data, "MMMM yyyy", { locale: ptBR });

  return textoFormatado.charAt(0).toUpperCase() + textoFormatado.slice(1);
}
