import { useEffect, useState } from "react";
import { api } from "../services/api";
import { ResponsiveContainer, BarChart, Bar, XAxis, Cell } from "recharts";
import BottomNav from "../components/BottomNav";
import type { Usuario } from "../types";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

const chartData = [
  { mes: "ago", valor: 40, ativo: false },
  { mes: "set", valor: 60, ativo: false },
  { mes: "out", valor: 35, ativo: false },
  { mes: "nov", valor: 75, ativo: false },
  { mes: "dez", valor: 50, ativo: false },
  { mes: "jan", valor: 100, ativo: true },
];

export default function DashboardPage() {
  const [equipe, setEquipe] = useState<Usuario[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [dados, setDados] = useState({
    nome: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

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

    async function buscarDados() {
      try {
        const response = await api.get<Usuario[]>("/usuario");
        if (ativo) {
          setEquipe(response.data);
        }
      } catch (e) {
        console.error("Erro ao carregar membros da equipe:", e);
      }
    }

    buscarDados();

    return () => {
      ativo = false;
    };
  }, []);

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setDados({
      ...dados,
      [name]: value,
    });
  }

  async function handleConvidarMembro(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/usuario/convite", dados);

      toast.success("Membro convidado com sucesso!");

      setDados({
        nome: "",
        email: "",
        password: "",
      });

      setModalAberto(false);
      await carregarEquipe();
    } catch (e) {
      console.error("Erro ao convidar membro:", e);
      if (axios.isAxiosError(e) && e.response?.data?.message) {
        toast.error(e.response.data.message);
      } else {
        toast.error("Erro ao enviar convite. Verifique os dados fornecidos.");
      }
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <div className="min-h-screen bg-[#f4f7fc] flex flex-col">
      <header className="w-full flex flex-row justify-between items-center p-6 pb-4 bg-white border-b border-slate-100">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <div>
          <select
            name="mes"
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 bg-white cursor-pointer outline-none"
          >
            <option value="">Selecione o mês</option>
            <option value="jan">Janeiro 2026</option>
            <option value="fev">Fevereiro 2026</option>
            <option value="mar">Março 2026</option>
          </select>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-6 px-4 py-6 pb-24 max-w-md mx-auto w-full">
        <div className="w-full grid grid-cols-2 gap-4">
          <div className="relative flex flex-col justify-center items-start gap-1 bg-white p-4 pl-5 border border-slate-100 rounded-2xl shadow-sm">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />
            <p className="text-xs text-slate-400 uppercase font-medium">
              entrada no mês
            </p>
            <h1 className="text-2xl text-slate-900 font-bold">R$ 892</h1>
            <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
              <span>↑</span>18% vs Dez
            </p>
          </div>

          <div className="flex flex-col justify-center items-start gap-1 bg-white p-4 border border-slate-100 rounded-2xl shadow-sm">
            <p className="text-xs text-slate-400 uppercase font-medium">
              saídas no mês
            </p>
            <h1 className="text-2xl text-slate-900 font-bold">R$ 314</h1>
            <p className="text-[10px] text-red-400 font-medium">
              <span>↓</span> 5% vs Dez
            </p>
          </div>

          <div className="flex flex-col justify-center items-start gap-1 bg-white p-4 border border-slate-100 rounded-2xl shadow-sm">
            <p className="text-xs text-slate-400 uppercase font-medium">
              entradas de itens
            </p>
            <h1 className="text-2xl text-slate-900 font-bold">47</h1>
            <p className="text-[10px] text-slate-400 font-medium">unidades</p>
          </div>

          <div className="flex flex-col justify-center items-start gap-1 bg-white p-4 border border-slate-100 rounded-2xl shadow-sm">
            <p className="text-xs text-slate-400 uppercase font-medium">
              saídas de itens
            </p>
            <h1 className="text-2xl text-slate-900 font-bold">12</h1>
            <p className="text-[10px] text-slate-400 font-medium">unidades</p>
          </div>
        </div>

        <div className="w-full flex flex-col gap-6">
          <div className="w-full bg-white p-5 border border-slate-100 rounded-2xl shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-4">
              Entradas por mês (R$)
            </h2>

            <div className="h-40 w-full">
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
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col gap-3">
          <p className="text-xs text-slate-400 uppercase font-medium tracking-wider">
            categoria que mais gastaram
          </p>

          <div className="w-full bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="w-full flex flex-row justify-between items-center">
                <p className="text-sm font-semibold">Alimentos secos</p>

                <div className="flex flex-col justify-center items-end">
                  <p className="text-sm font-semibold">R$ 412</p>
                  <p className="text-xs text-slate-400 uppercase font-medium">
                    46%
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="w-full flex flex-row justify-between items-center">
                <p className="text-sm font-semibold">Bebidas</p>

                <div className="flex flex-col justify-center items-end">
                  <p className="text-sm font-semibold">R$ 218</p>
                  <p className="text-xs text-slate-400 uppercase font-medium">
                    24%
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="w-full flex flex-row justify-between items-center">
                <p className="text-sm font-semibold">Limpeza</p>

                <div className="flex flex-col justify-center items-end">
                  <p className="text-sm font-semibold">R$ 156</p>
                  <p className="text-xs text-slate-400 uppercase font-medium">
                    18%
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="w-full flex flex-row justify-between items-center">
                <p className="text-sm font-semibold">Higiene pessoal</p>

                <div className="flex flex-col justify-center items-end">
                  <p className="text-sm font-semibold">R$ 106</p>
                  <p className="text-xs text-slate-400 uppercase font-medium">
                    12%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col gap-3">
          <p className="text-xs text-slate-400 uppercase font-medium tracking-wider">
            equipe
          </p>

          <div className="w-full bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 shadow-sm overflow-hidden">
            {equipe.map((usuario) => {
              const inicialMembro = usuario.nome.substring(0, 2).toUpperCase();
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
                            eAdminMembro ? "text-blue-600" : "text-green-600"
                          }`}
                        >
                          {inicialMembro}
                        </p>
                      </div>

                      <div className="flex flex-col justify-center items-start">
                        <p className="text-sm font-semibold">{usuario.nome}</p>
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
                            eAdminMembro ? "text-blue-600" : "text-green-600"
                          }`}
                        >
                          {eAdminMembro ? "Admin" : "Ativo"}
                        </p>
                      </div>

                      {!eAdminMembro && (
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
          </div>
        </div>
      </main>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-800">
              Convidar Membro
            </h3>

            <form
              onSubmit={handleConvidarMembro}
              className="flex flex-col gap-3"
            >
              <div>
                <label className="text-xs text-slate-500 font-medium">
                  Nome
                </label>
                <input
                  type="text"
                  required
                  name="nome"
                  value={dados.nome}
                  onChange={handleOnChange}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                  placeholder="Nome do membro"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 font-medium">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  name="email"
                  value={dados.email}
                  onChange={handleOnChange}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 font-medium">
                  Senha temporária
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  name="password"
                  value={dados.password}
                  onChange={handleOnChange}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
                  placeholder="******"
                  autoComplete="new-password"
                />
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Enviando..." : "Cadastrar Membro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <BottomNav />
      <Toaster />
    </div>
  );
}
