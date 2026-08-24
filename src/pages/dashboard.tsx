import { ResponsiveContainer, BarChart, Bar, XAxis, Cell } from "recharts";
import BottomNav from "../components/BottomNav";

const chartData = [
  { month: "ago", value: 40, active: false },
  { month: "set", value: 60, active: false },
  { month: "out", value: 35, active: false },
  { month: "nov", value: 75, active: false },
  { month: "dez", value: 50, active: false },
  { month: "jan", value: 100, active: true },
];

export default function DashboardPage() {
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
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.active ? "#2563eb" : "#bfdbfe"}
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
            <div className="flex items-center justify-between p-4">
              <div className="w-full flex flex-row justify-between items-center">
                <div className="flex flex-row items-center gap-3">
                  <div className="flex items-center justify-center bg-blue-100 w-10 h-10 rounded-full">
                    <p className="text-sm font-bold text-blue-500">JS</p>
                  </div>

                  <div className="flex flex-col justify-center items-start">
                    <p className="text-sm font-semibold">João Silva</p>
                    <p className="text-xs text-slate-400 uppercase font-medium">
                      Administrador
                    </p>
                  </div>
                </div>

                <div className="bg-blue-100 py-0.5 px-2 rounded-2xl">
                  <p className="text-xs font-bold text-blue-600">Admin</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="w-full flex flex-row justify-between items-center">
                <div className="flex flex-row items-center gap-3">
                  <div className="flex items-center justify-center bg-green-100 w-10 h-10 rounded-full">
                    <p className="text-sm font-bold text-green-500">MO</p>
                  </div>

                  <div className="flex flex-col justify-center items-start">
                    <p className="text-sm font-semibold">Maria Oliveira</p>
                    <p className="text-xs text-slate-400 uppercase font-medium">
                      Convidada
                    </p>
                  </div>
                </div>

                <div className="bg-green-100 py-0.5 px-2 rounded-2xl">
                  <p className="text-xs font-bold text-green-600">Ativo</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="w-full flex flex-row justify-between items-center">
                <div className="flex flex-row items-center gap-3">
                  <div className="flex items-center justify-center bg-slate-100 w-10 h-10 rounded-full">
                    <p className="text-lg font-bold text-slate-500">+</p>
                  </div>

                  <div className="flex flex-col justify-center items-start">
                    <p className="text-sm font-semibold text-slate-300">
                      Convidar membro
                    </p>
                    <p className="text-xs text-slate-300 uppercase font-medium">
                      Mais 3 vagas disponíveis
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-slate-300 py-1.5 px-3 rounded-xl">
                  <button className="text-xs font-semibold cursor-pointer">
                    Convidar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
