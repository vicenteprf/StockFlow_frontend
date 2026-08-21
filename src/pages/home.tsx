import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api.ts";
import {
  FiArrowDown,
  FiPlusSquare,
  FiHexagon,
  FiArrowUp,
  FiTag,
  FiGrid,
  FiAlertTriangle,
  FiLoader,
  FiLogOut,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import BottomNav from "../components/BottomNav";
import type { Produto, Movimentacao } from "../types/index.ts";
import {
  startOfDay,
  parseISO,
  format,
  differenceInDays,
  isToday,
  isYesterday,
  subDays,
  isAfter,
} from "date-fns";
import { ptBR } from "date-fns/locale";

function formatarDataMovimentacao(dataIso?: string | null) {
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

function getSaudacao(): string {
  const hora = new Date().getHours();

  if (hora >= 5 && hora < 12) return "Bom dia";
  if (hora >= 12 && hora < 18) return "Boa tarde";
  return "Boa noite";
}

function getUsuarioDoToken() {
  const token = localStorage.getItem("token");
  if (!token) return { nome: "Usuario", inicial: "U" };

  try {
    const payloadBase64 = token.split(".")[1];
    const payloadDecodificado = JSON.parse(atob(payloadBase64));

    const nomeCompleto = payloadDecodificado.name || "Usuário";
    const primeiroNome = nomeCompleto.split(" ")[0];

    const partesNome = nomeCompleto.trim().split(" ");
    const inicial =
      partesNome.length > 1
        ? `${partesNome[0][0]}${partesNome[1][0]}`.toUpperCase()
        : partesNome[0].substring(0, 2).toUpperCase();

    return { nome: primeiroNome, inicial };
  } catch (e) {
    console.error("Erro ao decodificar token JWT:", e);
    return { nome: "Usuário", inicial: "U" };
  }
}

export default function HomePage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);

  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  useEffect(() => {
    let ativo = true;

    async function carregandoDados() {
      try {
        setCarregando(true);
        const [resProduto, resMovimentacao] = await Promise.all([
          api.get("/produto"),
          api.get("/movimentacao"),
        ]);

        if (ativo) {
          if (resProduto.data) setProdutos(resProduto.data);
          if (resMovimentacao.data) setMovimentacoes(resMovimentacao.data);
        }
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
        toast.error("Erro ao carregar estoque.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregandoDados();

    return () => {
      ativo = false;
    };
  }, []);

  const totalProdutos = produtos.reduce((acc, prod) => {
    return acc + (prod.quantidadeEstoque || 0);
  }, 0);

  const hoje = startOfDay(new Date());

  const produtosVencendo = produtos.filter((prod) => {
    if (!prod.validade) return false;

    const dataValidade = startOfDay(parseISO(prod.validade));
    const diasAteVencer = differenceInDays(dataValidade, hoje);

    return diasAteVencer >= 0 && diasAteVencer <= 15;
  });

  const totalVencendo = produtosVencendo.length;

  const ultimasMovimentacoes = movimentacoes.slice(0, 3);

  const saudacao = getSaudacao();

  const usuario = useMemo(() => getUsuarioDoToken(), []);
  const { nome } = usuario;

  const limiteSeteDias = subDays(hoje, 7);

  const entradasEstaSemana = movimentacoes.reduce((acc, mov) => {
    if (mov.tipo !== "ENTRADA" || !mov.criado) return acc;

    const dataMov = parseISO(mov.criado);

    if (isAfter(dataMov, limiteSeteDias)) {
      return acc + (mov.quantidade || 0);
    }

    return acc;
  }, 0);

  const valorTotalEstoque = produtos.reduce((acc, prod) => {
    const movComPreco = movimentacoes.find(
      (mov) => mov.produto?.id === prod.id && mov.preco !== null,
    );

    const precoUnitario = movComPreco?.preco || 0;
    const quantidade = prod.quantidadeEstoque || 0;

    return acc + quantidade * precoUnitario;
  }, 0);

  return (
    <div className="min-h-screen bg-[#f4f7fc] flex flex-col">
      <header className="w-full flex flex-row items-center justify-between p-6 pb-4 bg-white border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-blue-600 tracking-tight">
            StockFlow
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            {saudacao}, {nome} 👋
          </p>
        </div>

        <div className="flex flex-row items-center gap-3">
          <button
            onClick={handleLogout}
            title="Sair da conta"
            className="flex items-center justify-center w-10 h-10 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors cursor-pointer"
          >
            <FiLogOut size={18} />
          </button>
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
              <div className="flex flex-col justify-center items-start gap-1 bg-white p-4 border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-xs text-slate-400 uppercase font-medium">
                  itens em estoque
                </p>
                <h1 className="text-2xl text-slate-900 font-bold">
                  {totalProdutos}
                </h1>
                <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
                  <span>↑</span> {entradasEstaSemana} esta semana
                </p>
              </div>

              <div className="flex flex-col justify-center items-start gap-1 bg-white p-4 border border-slate-100 rounded-2xl shadow-sm">
                <p className="text-xs text-slate-400 uppercase font-medium">
                  valor total
                </p>
                <h1 className="text-2xl text-slate-900 font-bold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(valorTotalEstoque)}
                </h1>
                <p className="text-[10px] text-slate-400 font-medium">
                  estimativa baseada na última entrada
                </p>
              </div>
            </div>

            {totalVencendo > 0 && (
              <div className="w-full bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl flex items-center gap-3">
                <FiAlertTriangle
                  size={20}
                  className="text-amber-600 shrink-0"
                />
                <p className="text-amber-800 text-xs leading-relaxed">
                  <span className="text-amber-700 font-bold">
                    {totalVencendo}{" "}
                    {totalVencendo === 1 ? "produto" : "produtos"}
                  </span>{" "}
                  com validade próxima ao vencimento.
                </p>
              </div>
            )}

            <div className="w-full flex flex-col gap-3">
              <p className="text-xs text-slate-400 uppercase font-medium tracking-wider">
                acesso rápido
              </p>

              <div className="w-full grid grid-cols-2 gap-3">
                <Link
                  to={"/entrada"}
                  className="flex flex-col items-start gap-1 bg-white p-4 border border-slate-100 rounded-2xl shadow-sm hover:border-blue-500 hover:shadow-md transition cursor-pointer text-left"
                >
                  <div className="bg-blue-50 p-2 rounded-xl mb-1">
                    <FiArrowDown size={20} className="text-blue-600" />
                  </div>
                  <h2 className="text-sm text-slate-900 font-semibold">
                    Entrada
                  </h2>
                  <p className="text-xs text-slate-400 font-normal">
                    Registrar chegada
                  </p>
                </Link>

                <Link
                  to={"/saida"}
                  className="flex flex-col items-start gap-1 bg-white p-4 border border-slate-100 rounded-2xl shadow-sm hover:border-blue-500 hover:shadow-md transition cursor-pointer text-left"
                >
                  <div className="bg-blue-50 p-2 rounded-xl mb-1">
                    <FiArrowUp size={20} className="text-blue-600" />
                  </div>
                  <h2 className="text-sm text-slate-900 font-semibold">
                    Saída
                  </h2>
                  <p className="text-xs text-slate-400 font-normal">
                    Registrar saída
                  </p>
                </Link>

                <Link
                  to={"/produto"}
                  className="flex flex-col items-start gap-1 bg-white p-4 border border-slate-100 rounded-2xl shadow-sm hover:border-blue-500 hover:shadow-md transition cursor-pointer text-left"
                >
                  <div className="bg-blue-50 p-2 rounded-xl mb-1">
                    <FiPlusSquare size={20} className="text-blue-600" />
                  </div>
                  <h2 className="text-sm text-slate-900 font-semibold">
                    Cadastro
                  </h2>
                  <p className="text-xs text-slate-400 font-normal">
                    Novo produto
                  </p>
                </Link>

                <Link
                  to={"/categoria"}
                  className="flex flex-col items-start gap-1 bg-white p-4 border border-slate-100 rounded-2xl shadow-sm hover:border-blue-500 hover:shadow-md transition cursor-pointer text-left"
                >
                  <div className="bg-blue-50 p-2 rounded-xl mb-1">
                    <FiTag size={20} className="text-blue-600" />
                  </div>
                  <h2 className="text-sm text-slate-900 font-semibold">
                    Categoria
                  </h2>
                  <p className="text-xs text-slate-400 font-normal">
                    Nova categoria
                  </p>
                </Link>

                <Link
                  to={"/estoque"}
                  className="flex flex-col items-start gap-1 bg-white p-4 border border-slate-100 rounded-2xl shadow-sm hover:border-blue-500 hover:shadow-md transition cursor-pointer text-left"
                >
                  <div className="bg-blue-50 p-2 rounded-xl mb-1">
                    <FiHexagon size={20} className="text-blue-600" />
                  </div>
                  <h2 className="text-sm text-slate-900 font-semibold">
                    Estoque
                  </h2>
                  <p className="text-xs text-slate-400 font-normal">
                    Ver quantidades
                  </p>
                </Link>

                <Link
                  to={"/dashboard"}
                  className="flex flex-col items-start gap-1 bg-white p-4 border border-slate-100 rounded-2xl shadow-sm hover:border-blue-500 hover:shadow-md transition cursor-pointer text-left"
                >
                  <div className="bg-blue-50 p-2 rounded-xl mb-1">
                    <FiGrid size={20} className="text-blue-600" />
                  </div>
                  <h2 className="text-sm text-slate-900 font-semibold">
                    Dashboard
                  </h2>
                  <p className="text-xs text-slate-400 font-normal">
                    Gastos do mês
                  </p>
                </Link>
              </div>
            </div>

            <div className="w-full flex flex-col gap-3">
              <p className="text-xs text-slate-400 uppercase font-medium tracking-wider">
                últimas movimentações
              </p>

              <div className="w-full bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 shadow-sm overflow-hidden">
                {ultimasMovimentacoes.map((mov) => {
                  const entrada = mov.tipo === "ENTRADA";
                  return (
                    <div
                      key={mov.id}
                      className="flex items-center justify-between p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`rounded-xl p-2.5 ${
                            entrada ? "bg-green-50" : "bg-red-50"
                          }`}
                        >
                          {entrada ? (
                            <FiArrowDown size={18} className="text-green-600" />
                          ) : (
                            <FiArrowUp size={18} className="text-red-600" />
                          )}
                        </div>

                        <div>
                          <h3 className="text-xs font-semibold">
                            {mov.produto?.nome}
                          </h3>
                          <p className="text-xs text-slate-400">
                            {entrada ? "Entrada" : "Saída"} · {mov.quantidade}{" "}
                            unid.
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-sm font-semibold block ${
                            entrada ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {entrada
                            ? `+${mov.quantidade}`
                            : `-${mov.quantidade}`}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatarDataMovimentacao(mov.criado)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>
      <BottomNav />
      <Toaster />
    </div>
  );
}
