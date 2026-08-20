import { useState, useEffect, useMemo } from "react";
import { api } from "../services/api";
import ScrollContainer from "react-indiana-drag-scroll";
import Header from "../components/Header";
import type { Movimentacao } from "../types";
import toast, { Toaster } from "react-hot-toast";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import BottomNav from "../components/BottomNav";

export default function HistoricoPage() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<"TODOS" | "ENTRADA" | "SAIDA">("TODOS");

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        const resMovimentacao = await api.get("/movimentacao");

        if (ativo && resMovimentacao?.data) {
          setMovimentacoes(resMovimentacao.data);
        }
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
        toast.error("Erro ao carregar lista de histórico.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, []);

  const movimentacoesAgrupadas = useMemo(() => {
    const filtradas = movimentacoes.filter((mov) => {
      const atendeFiltro = filtro === "TODOS" || mov.tipo === filtro;

      const termo = busca.toLowerCase();
      const codigoFormatado = String(mov.produto?.codigo || "").padStart(
        3,
        "0",
      );

      const atendeBusca =
        mov.produto?.nome?.toLowerCase().includes(termo) ||
        String(mov.produto?.codigo || "").includes(termo) ||
        codigoFormatado.includes(termo);

      return atendeFiltro && atendeBusca;
    });

    const grupos: { [chaveData: string]: Movimentacao[] } = {};

    filtradas.forEach((mov) => {
      const dataChave = mov.criado
        ? format(parseISO(mov.criado), "yyyy-MM-dd")
        : "sem-data";

      if (!grupos[dataChave]) {
        grupos[dataChave] = [];
      }
      grupos[dataChave].push(mov);
    });

    return grupos;
  }, [movimentacoes, filtro, busca]);

  const formatarCabecalhoData = (dataIsoString: string) => {
    if (dataIsoString === "sem-data") return "OUTROS REGISTROS";

    const data = parseISO(dataIsoString);

    if (isToday(data)) {
      return `HOJE — ${format(data, "dd MMM yyyy", { locale: ptBR }).toUpperCase()}`;
    }
    if (isYesterday(data)) {
      return `ONTEM — ${format(data, "dd MMM yyyy", { locale: ptBR }).toUpperCase()}`;
    }

    return format(data, "dd MMM yyyy", { locale: ptBR }).toUpperCase();
  };

  return (
    <div>
      <Header texto="Histórico" />
      <main className="min-h-screen bg-[#f4f7fc] flex flex-col items-center justify-center gap-6 px-4 py-8">
        <div className="w-full max-w-sm bg-white border border-slate-200/80 rounded-3xl shadow-sm flex flex-col items-center text-center overflow-hidden">
          <div className="w-full flex flex-col bg-white">
            <div className="p-6 pb-4">
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar produto ou código..."
                className="w-full rounded-xl bg-slate-100/90 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <hr className="border-t border-slate-200/80 w-full" />

            <div className="py-3 px-6">
              <ScrollContainer
                nativeMobileScroll={true}
                className="w-full max-w-full flex items-center gap-2 overflow-x-auto scrollbar-none select-none cursor-grab active:cursor-grabbing"
              >
                <button
                  onClick={() => setFiltro("TODOS")}
                  className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    filtro === "TODOS"
                      ? "bg-blue-200/60 text-blue-600"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200/50"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFiltro("ENTRADA")}
                  className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    filtro === "ENTRADA"
                      ? "bg-green-200/60 text-green-600"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200/50"
                  }`}
                >
                  Entradas
                </button>
                <button
                  onClick={() => setFiltro("SAIDA")}
                  className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    filtro === "SAIDA"
                      ? "bg-red-200/60 text-red-600"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200/50"
                  }`}
                >
                  Saídas
                </button>
              </ScrollContainer>
            </div>

            <hr className="border-t border-slate-200/80 w-full" />

            <div className="flex flex-col min-h-30">
              {carregando ? (
                <div className="p-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-medium text-slate-500">
                    Carregando histórico...
                  </span>
                </div>
              ) : Object.keys(movimentacoesAgrupadas).length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Nenhuma movimentação encontrada.
                </div>
              ) : (
                Object.entries(movimentacoesAgrupadas).map(
                  ([dataChave, lista]) => (
                    <div key={dataChave} className="flex flex-col">
                      <div className="bg-slate-50/80 px-6 py-2 border-y border-slate-100 text-left">
                        <span className="text-[10px] font-bold tracking-wider text-slate-400">
                          {formatarCabecalhoData(dataChave)}
                        </span>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {lista.map((mov) => {
                          const entrada = mov.tipo === "ENTRADA";
                          const codigoFormatado = String(
                            mov.produto?.codigo || 0,
                          ).padStart(3, "0");
                          const horaFormatada = mov.criado
                            ? format(parseISO(mov.criado), "HH:mm")
                            : "--:--";

                          const quantidade = Number(mov.quantidade) || 0;
                          const precoNumerico = mov.preco
                            ? Number(mov.preco)
                            : null;

                          const valorTotal = precoNumerico
                            ? ` · ${new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(quantidade * precoNumerico)}`
                            : "";

                          return (
                            <div
                              key={mov.id}
                              className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/50 transition cursor-pointer"
                            >
                              <div className="flex items-center gap-3 text-left">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                    entrada
                                      ? "bg-green-50 text-green-600"
                                      : "bg-red-50 text-red-500"
                                  }`}
                                >
                                  {entrada ? (
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                                      />
                                    </svg>
                                  ) : (
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2.5}
                                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                                      />
                                    </svg>
                                  )}
                                </div>

                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-slate-800 line-clamp-1">
                                    {mov.produto?.nome ||
                                      "Produto desconhecido"}
                                  </span>
                                  <span className="text-[11px] font-medium text-slate-400">
                                    PRD-{codigoFormatado} ·{" "}
                                    {`${mov.quantidade} `}
                                    unid
                                    {mov.motivo && ` · ${mov.motivo}`}
                                    {valorTotal}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-col items-end text-right shrink-0 gap-1">
                                <span
                                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                    entrada
                                      ? "bg-green-100/50 text-green-600"
                                      : "bg-red-100/70 text-red-500"
                                  }`}
                                >
                                  {entrada ? "Entrada" : "Saída"}
                                </span>
                                <span className="text-[10px] font-medium text-slate-400">
                                  {horaFormatada}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ),
                )
              )}
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
      <Toaster />
    </div>
  );
}
