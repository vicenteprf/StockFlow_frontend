import { useState, useEffect } from "react";
import { api } from "../services/api";
import toast, { Toaster } from "react-hot-toast";
import ScrollContainer from "react-indiana-drag-scroll";
import Header from "../components/Header";
import type { Produto, Categoria } from "../types";
import { differenceInDays, format, parseISO, startOfDay } from "date-fns";
import BottomNav from "../components/BottomNav";

export default function EstoquePage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<
    number | null
  >(null);

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        setCarregando(true);
        const [resCategorias, resProdutos] = await Promise.all([
          api.get("/categoria"),
          api.get("/produto"),
        ]);

        if (ativo) {
          if (resCategorias.data) setCategorias(resCategorias.data);
          if (resProdutos.data) setProdutos(resProdutos.data);
        }
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
        toast.error("Erro ao carregar estoque.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, []);

  function getQtdProdutosPorCategoria(catId: number) {
    return produtos.filter(
      (p) => p.categoriaId === catId || p.categoria?.id === catId,
    ).length;
  }

  function getStatusValidade(dataIso?: string | null) {
    if (!dataIso) return { status: "OK", texto: null };

    const hoje = startOfDay(new Date());
    const dataValidade = startOfDay(parseISO(dataIso));

    const diasRestantes = differenceInDays(dataValidade, hoje);
    const dataFormatada = format(dataValidade, "dd/MM/yyyy");

    if (diasRestantes < 0) {
      return { status: "VENCIDO", texto: "VENCIDO ✕" };
    }

    if (diasRestantes <= 15) {
      return { status: "A_VENCER", texto: `Val: ${dataFormatada} ⚠` };
    }

    return { status: "OK", texto: `Val: ${dataFormatada}` };
  }

  const produtosFiltrados = produtos.filter((prod) => {
    const atendeCategoria =
      categoriaSelecionada === null ||
      prod.categoriaId === categoriaSelecionada ||
      prod.categoria?.id === categoriaSelecionada;

    const termo = busca.toLowerCase();
    const codigoFormatado = String(prod.codigo).padStart(3, "0");

    const atendeBusca =
      prod.nome.toLowerCase().includes(termo) ||
      String(prod.codigo).includes(termo) ||
      codigoFormatado.includes(termo);

    return atendeCategoria && atendeBusca;
  });

  return (
    <div>
      <Header texto="Estoque" />
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

            <div className="py-4 px-6">
              <ScrollContainer
                nativeMobileScroll={true}
                className="w-full max-w-full flex items-center gap-2 overflow-x-auto scrollbar-none select-none cursor-grab active:cursor-grabbing"
              >
                <button
                  onClick={() => setCategoriaSelecionada(null)}
                  className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs transition cursor-pointer ${
                    categoriaSelecionada === null
                      ? "bg-blue-100/80 font-semibold text-blue-600"
                      : "bg-slate-100/80 font-medium text-slate-500 hover:bg-blue-200/60 hover:text-blue-600"
                  }`}
                >
                  Todos ({produtos.length})
                </button>
                {categorias.map((cat) => {
                  const total = getQtdProdutosPorCategoria(cat.id);
                  const estaSelecionado = categoriaSelecionada === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategoriaSelecionada(cat.id)}
                      className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs transition cursor-pointer ${
                        estaSelecionado
                          ? "bg-blue-100/80 font-semibold text-blue-600"
                          : "bg-slate-100/80 font-medium text-slate-500 hover:bg-blue-200/60 hover:text-blue-600"
                      }`}
                    >
                      {cat.nome} ({total})
                    </button>
                  );
                })}
              </ScrollContainer>
            </div>

            <hr className="border-t border-slate-200/80 w-full" />

            <div className="flex flex-col divide-y divide-slate-100 min-h-30 justify-center">
              {carregando ? (
                <div className="p-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-medium text-slate-500">
                    Carregando estoque...
                  </span>
                </div>
              ) : produtosFiltrados.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  Nenhum produto encontrado.
                </div>
              ) : (
                produtosFiltrados.map((prod) => {
                  const nomeCategoria =
                    prod.categoria?.nome ||
                    categorias.find((c) => c.id === prod.categoriaId)?.nome ||
                    "Geral";

                  const { status, texto: textoValidade } = getStatusValidade(
                    prod.validade,
                  );

                  return (
                    <div
                      key={prod.id}
                      className={`flex items-center justify-between p-4 px-6 hover:bg-slate-50/60 transition cursor-pointer relative ${
                        status === "A_VENCER"
                          ? "bg-amber-50/40 border-l-4 border-l-amber-500"
                          : status === "VENCIDO"
                            ? "bg-red-50/40 border-l-4 border-l-red-500"
                            : ""
                      }`}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                            status === "A_VENCER"
                              ? "bg-amber-50 border-amber-200 text-amber-600"
                              : status === "VENCIDO"
                                ? "bg-red-50 border-red-200 text-red-500"
                                : "bg-blue-50 border-blue-100 text-blue-500"
                          }`}
                        >
                          {status === "A_VENCER" ? (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                          ) : status === "VENCIDO" ? (
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.8}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                              />
                            </svg>
                          )}
                        </div>

                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 line-clamp-1">
                            {prod.nome}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400">
                            #{String(prod.codigo).padStart(3, "0")} ·{" "}
                            {nomeCategoria}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end text-right shrink-0">
                        <span className="text-xs font-bold text-slate-800">
                          {prod.quantidadeEstoque} unid.
                        </span>
                        {textoValidade && (
                          <span
                            className={`text-[11px] font-bold ${
                              status === "A_VENCER"
                                ? "text-amber-600"
                                : status === "VENCIDO"
                                  ? "text-red-500"
                                  : "font-medium text-slate-400"
                            }`}
                          >
                            {textoValidade}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
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
