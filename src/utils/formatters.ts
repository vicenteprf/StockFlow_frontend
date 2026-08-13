export function formatarMoedaInput(value: string) {
  const apenasNumeros = value.replace(/\D/g, "");

  if (!apenasNumeros) return "";

  const valorNumerico = Number(apenasNumeros) / 100;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valorNumerico);
}
