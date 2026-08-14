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
