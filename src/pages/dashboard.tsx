import { useEffect, useState } from "react";
import { api } from "../services/api";
import { ResponsiveContainer, BarChart, Bar, XAxis, Cell } from "recharts";
import BottomNav from "../components/BottomNav";
import { ModalConvite } from "../components/ModalConvite";
import type { Categoria, Movimentacao, Usuario } from "../types";
import toast, { Toaster } from "react-hot-toast";
import { FiLoader } from "react-icons/fi";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatarMesAno } from "../utils/formatters";
import { parseJwtToken } from "../utils/auth";

export default function DashboardPage() {
  const [equipe, setEquipe] = useState<Usuario[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [mesAnoSelecionado, setMesAnoSelecionado] = useState<string>("");

  async function carregarEquipe() {
    try {
      const response = await api.get<Usuario[]>("/usuario");
      setEquipe(response.data);
    } catch (e) {
      console.error("Erro ao carregar membros da equipe:", e);
    }
  }

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      try {
        setCarregando(true);

        const [resUsuario, resMovimentacao, resCategoria] = await Promise.all([
          api.get("/usuario"),
          api.get("/movimentacao"),
          api.get("/categoria"),
        ]);
        if (ativo) {
          if (resUsuario) setEquipe(resUsuario.data);
          if (resMovimentacao) setMovimentacoes(resMovimentacao.data);
          if (resCategoria) setCategorias(resCategoria.data);
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

  const limiteVagas = 5;
  const vagasDisponiveis = limiteVagas - equipe.length;

  async function handleExcluirMembro(id: number) {
    if (!confirm("Tem certeza que deseja remover este membro da equipe?")) {
      return;
    }

    try {
      await api.delete(`/usuario/${String(id)}`);
      toast.success("Membro removido com sucesso!");
      await carregarEquipe();
    } catch (e) {
      console.error("Erro ao excluir membro:", e);
      toast.error("Erro ao remover membro da equipe.");
    }
  }

  const opcoesMeses = Array.from(
    new Set(
      movimentacoes
        .map((mov) => {
          const dataBruta = mov.criado;
          if (!dataBruta) return null;
          return new Date(dataBruta).toISOString().slice(0, 7);
        })
        .filter((mes): mes is string => mes !== null),
    ),
  )
    .sort()
    .reverse();

  const movimentacoesFiltradas = movimentacoes.filter((mov) => {
    if (!mesAnoSelecionado) return true;
    const dataBruta = mov.criado;
    if (!dataBruta) return false;
    const mesMov = new Date(dataBruta).toISOString().slice(0, 7);
    return mesMov === mesAnoSelecionado;
  });

  const totalEntrada = movimentacoesFiltradas
    .filter((mov) => mov.tipo === "ENTRADA")
    .reduce((acc, mov) => {
      const preco = mov.preco ? Number(mov.preco) : 0;
      const quantidade = mov.quantidade || 1;
      return acc + preco * quantidade;
    }, 0);

  const totalEntradaItens = movimentacoesFiltradas
    .filter((mov) => mov.tipo === "ENTRADA")
    .reduce((acc: number, mov: Movimentacao) => acc + mov.quantidade, 0);

  const totalSaida = movimentacoesFiltradas
    .filter((mov) => mov.tipo === "SAIDA")
    .reduce((acc, mov) => {
      const preco = mov.preco ? Number(mov.preco) : 0;
      const quantidade = mov.quantidade || 1;
      return acc + preco * quantidade;
    }, 0);

  const totalSaidaItens = movimentacoesFiltradas
    .filter((mov) => mov.tipo === "SAIDA")
    .reduce((acc: number, mov: Movimentacao) => acc + mov.quantidade, 0);

  const chartData = Array.from(
    movimentacoes
      .filter((mov) => mov.tipo === "ENTRADA")
      .reduce((acc, mov) => {
        const dataBruta = mov.criado;
        if (!dataBruta) return acc;

        const dataObj = new Date(dataBruta);
        const chaveMesAno = dataObj.toISOString().slice(0, 7);

        const labelMes = format(dataObj, "MMM", { locale: ptBR }).replace(
          ".",
          "",
        );

        const preco = mov.preco ? Number(mov.preco) : 0;
        const qtd = mov.quantidade || 1;
        const valorTotal = preco * qtd;

        if (!acc.has(chaveMesAno)) {
          acc.set(chaveMesAno, {
            chave: chaveMesAno,
            mes: labelMes,
            valor: 0,
          });
        }

        acc.get(chaveMesAno)!.valor += valorTotal;
        return acc;
      }, new Map<string, { chave: string; mes: string; valor: number }>())
      .values(),
  )
    .sort((a, b) => a.chave.localeCompare(b.chave))
    .map((item) => {
      const mesAtual = new Date().toISOString().slice(0, 7);
      const chaveAlvo = mesAnoSelecionado || mesAtual;

      return {
        mes: item.mes,
        valor: item.valor,
        ativo: item.chave === chaveAlvo,
      };
    });

  const categoriaMap = new Map<number, string>(
    categorias.map((cat) => [cat.id, cat.nome]),
  );

  const categoriasGastoMap = movimentacoesFiltradas
    .filter((mov) => mov.tipo === "ENTRADA")
    .reduce((acc, mov) => {
      const categoriaId = mov.produto?.categoria.id;

      const nomeCategoria =
        (categoriaId ? categoriaMap.get(categoriaId) : null) || "Sem categoria";

      const preco = mov.preco ? Number(mov.preco) : 0;
      const quantidade = mov.quantidade || 1;
      const valorMovimentacao = preco * quantidade;

      const valorAtual = acc.get(nomeCategoria) || 0;
      acc.set(nomeCategoria, valorAtual + valorMovimentacao);

      return acc;
    }, new Map<string, number>());

  const categoriasMaisGastaram = Array.from(categoriasGastoMap.entries())
    .map(([nome, valor]) => {
      const porcentagem =
        totalEntrada > 0 ? Math.round((valor / totalEntrada) * 100) : 0;
      return { nome, valor, porcentagem };
    })
    .sort((a, b) => b.valor - a.valor);

  const token = localStorage.getItem("token");
  const usuarioLogadoId = parseJwtToken(token)?.id ?? null;

  const usuarioLogado = equipe.find((u) => u.id === usuarioLogadoId);
  const eUsuarioLogadoAdmin = usuarioLogado?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-[#f4f7fc] flex flex-col">
      <header className="w-full flex flex-row justify-between items-center p-6 pb-4 bg-white border-b border-slate-100">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <div>
          <select
            name="mes"
            value={mesAnoSelecionado}
            onChange={(e) => setMesAnoSelecionado(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 bg-white cursor-pointer outline-none"
          >
            <option value="">Todos os meses</option>
            {opcoesMeses.map((mesAno) => (
              <option key={mesAno} value={mesAno}>
                {formatarMesAno(mesAno)}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-6 px-4 py-6 pb-24 max-w-md mx-auto w-full">
        {carregando ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-75 gap-2">
            <FiLoader size={32} className="text-blue-600 animate-spin" />
            <p className="text-xs text-slate-400 font-medium">
              Carregando dados...
            </p>
          </div>
        ) : (
          <>
            <div className="w-full grid grid-cols-2 gap-4">
              <div className="relative flex flex-col justify-center items-start gap-1 bg-white p-4 pl-5 border border-slate-100 rounded-2xl shadow-sm shadow-blue-200">
                <p className="text-xs text-slate-400 uppercase font-medium">
                  entrada no mês
                </p>
                <h1 className="text-2xl text-slate-900 font-bold">
                  R${" "}
                  {totalEntrada.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </h1>
                <p className="text-[10px] text-slate-400 font-medium">
                  acumulado no período
                </p>
              </div>

              <div className="flex flex-col justify-center items-start gap-1 bg-white p-4 border border-slate-100 rounded-2xl shadow-sm shadow-red-200">
                <p className="text-xs text-slate-400 uppercase font-medium">
                  saídas no mês
                </p>
                <h1 className="text-2xl text-slate-900 font-bold">
                  R${" "}
                  {totalSaida.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </h1>
                <p className="text-[10px] text-slate-400 font-medium">
                  acumulado no período
                </p>
              </div>

              <div className="flex flex-col justify-center items-start gap-1 bg-white p-4 border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-xs text-slate-400 uppercase font-medium">
                  entradas de itens
                </p>
                <h1 className="text-2xl text-slate-900 font-bold">
                  {totalEntradaItens}
                </h1>
                <p className="text-[10px] text-slate-400 font-medium">
                  unidades
                </p>
              </div>

              <div className="flex flex-col justify-center items-start gap-1 bg-white p-4 border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-xs text-slate-400 uppercase font-medium">
                  saídas de itens
                </p>
                <h1 className="text-2xl text-slate-900 font-bold">
                  {totalSaidaItens}
                </h1>
                <p className="text-[10px] text-slate-400 font-medium">
                  unidades
                </p>
              </div>
            </div>

            <div className="w-full flex flex-col gap-6">
              <div className="w-full bg-white p-5 border border-slate-100 rounded-2xl shadow-sm">
                <h2 className="text-sm font-semibold text-slate-700 mb-4">
                  Entradas por mês (R$)
                </h2>

                <div className="h-40 w-full">
                  {chartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-xs text-slate-400">
                      Nenhuma entrada registrada para exibir no gráfico.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                      >
                        <XAxis
                          dataKey="mes"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#94a3b8", fontSize: 12 }}
                        />
                        <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.ativo ? "#2563eb" : "#bfdbfe"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col gap-3">
              <p className="text-xs text-slate-400 uppercase font-medium tracking-wider">
                categoria que mais gastaram
              </p>

              <div className="w-full bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 shadow-sm overflow-hidden">
                {categoriasMaisGastaram.length === 0 ? (
                  <p className="p-4 text-xs text-slate-400 text-center">
                    Nenhuma entrada registrada para este mês.
                  </p>
                ) : (
                  categoriasMaisGastaram.map((cat) => (
                    <div
                      key={cat.nome}
                      className="flex items-center justify-between p-4"
                    >
                      <div className="w-full flex flex-row justify-between items-center">
                        <p className="text-sm font-semibold">{cat.nome}</p>

                        <div className="flex flex-col justify-center items-end">
                          <p className="text-sm font-semibold">
                            R${" "}
                            {cat.valor.toLocaleString("pt-BR", {
                              minimumFractionDigits: 2,
                            })}
                          </p>
                          <p className="text-xs text-slate-400 uppercase font-medium">
                            {cat.porcentagem}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="w-full flex flex-col gap-3">
              <p className="text-xs text-slate-400 uppercase font-medium tracking-wider">
                equipe
              </p>

              <div className="w-full bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 shadow-sm overflow-hidden">
                {equipe.map((usuario) => {
                  const inicialMembro = usuario.nome
                    .substring(0, 2)
                    .toUpperCase();
                  const eAdminMembro = usuario.role === "ADMIN";

                  return (
                    <div
                      key={usuario.id}
                      className="flex items-center justify-between p-4"
                    >
                      <div className="w-full flex flex-row justify-between items-center">
                        <div className="flex flex-row items-center gap-3">
                          <div
                            className={`flex items-center justify-center w-10 h-10 rounded-full ${
                              eAdminMembro ? "bg-blue-100" : "bg-green-100"
                            }`}
                          >
                            <p
                              className={`text-sm font-bold ${
                                eAdminMembro
                                  ? "text-blue-600"
                                  : "text-green-600"
                              }`}
                            >
                              {inicialMembro}
                            </p>
                          </div>

                          <div className="flex flex-col justify-center items-start">
                            <p className="text-sm font-semibold">
                              {usuario.nome}
                            </p>
                            <p className="text-xs text-slate-400 uppercase font-medium">
                              {eAdminMembro ? "Administrador" : "Convidado"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div
                            className={`py-0.5 px-2 rounded-2xl ${
                              eAdminMembro ? "bg-blue-100" : "bg-green-100"
                            }`}
                          >
                            <p
                              className={`text-xs font-bold ${
                                eAdminMembro
                                  ? "text-blue-600"
                                  : "text-green-600"
                              }`}
                            >
                              {eAdminMembro ? "Admin" : "Ativo"}
                            </p>
                          </div>

                          {eUsuarioLogadoAdmin &&
                            usuario.id !== usuarioLogadoId && (
                              <button
                                type="button"
                                onClick={() => handleExcluirMembro(usuario.id)}
                                className="text-xs font-semibold py-0.5 px-2 rounded-2xl bg-red-100 text-red-500 hover:text-red-700 p-1 cursor-pointer transition-colors"
                                title="Remover membro"
                              >
                                Excluir
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {eUsuarioLogadoAdmin && (
                  <div className="flex items-center justify-between p-4">
                    <div className="w-full flex flex-row justify-between items-center">
                      <div className="flex flex-row items-center gap-3">
                        <div className="flex items-center justify-center bg-slate-100 w-10 h-10 rounded-full">
                          <p className="text-lg font-bold text-slate-500">+</p>
                        </div>

                        <div className="flex flex-col justify-center items-start">
                          <p className="text-sm font-semibold text-slate-400">
                            Convidar membro
                          </p>
                          <p className="text-xs text-slate-300 uppercase font-medium">
                            {vagasDisponiveis > 0
                              ? `Mais ${vagasDisponiveis} ${vagasDisponiveis === 1 ? "vaga disponível" : "vagas disponíveis"}`
                              : "Limite de vagas atingido"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-300 py-1.5 px-3 rounded-xl">
                        <button
                          type="button"
                          disabled={vagasDisponiveis <= 0}
                          onClick={() => setModalAberto(true)}
                          className="text-xs font-semibold text-slate-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Convidar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {modalAberto && (
        <ModalConvite
          onClose={() => setModalAberto(false)}
          onSucesso={carregarEquipe}
        />
      )}

      <BottomNav />
      <Toaster />
    </div>
  );
}
