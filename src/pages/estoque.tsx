import { useState, useEffect } from "react";
import { api } from "../services/api";
import toast, { Toaster } from "react-hot-toast";
import ScrollContainer from "react-indiana-drag-scroll";
import Header from "../components/Header";

interface Categoria {
  id: number;
  nome: string;
}

interface Produto {
  id: number;
  nome: string;
  descricao?: string;
  categoriaId: number;
  categoria?: { id: number; nome: string };
  quantidadeEstoque: number;
}

export default function EstoquePage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<
    number | null
  >(null);

  useEffect(() => {
    let active = true;

    async function carregarDados() {
      try {
        setCarregando(true);
        const [resCategorias, resProdutos] = await Promise.all([
          api.get("/categoria"),
          api.get("/produto"),
        ]);

        if (active) {
          if (resCategorias.data) setCategorias(resCategorias.data);
          if (resProdutos.data) setProdutos(resProdutos.data);
        }
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
        toast.error("Erro ao carregar estoque.");
      } finally {
        if (active) setCarregando(false);
      }
    }

    carregarDados();

    return () => {
      active = false;
    };
  }, []);

  function getQtdProdutosPorCategoria(catId: number) {
    return produtos.filter(
      (p) => p.categoriaId === catId || p.categoria?.id === catId,
    ).length;
  }

  const produtosFiltrados = produtos.filter((prod) => {
    const atendeCategoria =
      categoriaSelecionada === null ||
      prod.categoriaId === categoriaSelecionada ||
      prod.categoria?.id === categoriaSelecionada;

    const termo = busca.toLowerCase();
    const atendeBusca = prod.nome.toLowerCase().includes(termo);

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

                  return (
                    <div
                      key={prod.id}
                      className="flex items-center justify-between p-4 px-6 hover:bg-slate-50/60 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0">
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
                        </div>

                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 line-clamp-1">
                            {prod.nome}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400">
                            {nomeCategoria}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end text-right shrink-0">
                        <span className="text-xs font-bold text-slate-800">
                          {prod.quantidadeEstoque} unid.
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
