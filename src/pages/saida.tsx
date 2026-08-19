import { useState, useEffect } from "react";
import axios from "axios";
import { api } from "../services/api";
import toast, { Toaster } from "react-hot-toast";
import Header from "../components/Header";
import SubmitButton from "../components/SubmitBotao";
import type { Produto } from "../types";

export default function SaidaPage() {
  const [dados, setDados] = useState({
    produtoId: "",
    quantidade: "",
    motivo: "",
    observacao: "",
  });

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let ativo = true;

    async function carregarProdutos() {
      try {
        const response = await api.get("/produto");
        if (ativo && response.data) {
          setProdutos(response.data);
        }
      } catch (e) {
        console.error("Erro ao carregar produtos:", e);
        toast.error("Erro ao carregar lista de produtos.");
      } finally {
        if (ativo) setLoading(false);
      }
    }

    carregarProdutos();

    return () => {
      ativo = false;
    };
  }, []);

  function handleOnChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = e.target;

    if (name === "quantidade") {
      const apenasNumeros = value.replace(/\D/g, "");
      setDados((prev) => ({
        ...prev,
        quantidade: apenasNumeros,
      }));
      return;
    }

    setDados((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const produtoSelecionado = produtos.find(
    (p) => p.id === Number(dados.produtoId),
  );

  const estoqueAtual = produtoSelecionado?.quantidadeEstoque || 0;
  const quantidadeSaida = Number(dados.quantidade) || 0;
  const saldoAposSaida = Math.max(0, estoqueAtual - quantidadeSaida);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!dados.produtoId.trim() || !dados.quantidade.trim()) {
      toast.error("Selecione o produto e informe a quantidade");
      return;
    }

    if (Number(dados.quantidade) <= 0) {
      toast.error("A quantidade deve ser maior que zero.");
      return;
    }

    if (quantidadeSaida > estoqueAtual) {
      toast.error(`Estoque insuficiente! Saldo atual: ${estoqueAtual}`);
      return;
    }

    try {
      const payload = {
        produtoId: Number(dados.produtoId),
        quantidade: Number(dados.quantidade),
        tipo: "SAIDA",
        motivo: dados.motivo.trim() ? dados.motivo : undefined,
        observacao: dados.observacao.trim() ? dados.observacao : undefined,
      };

      await api.post("/movimentacao", payload);
      toast.success("Saída registrada com sucesso!");

      setProdutos((prev) =>
        prev.map((p) =>
          p.id === Number(dados.produtoId)
            ? {
                ...p,
                quantidadeEstoque:
                  p.quantidadeEstoque - Number(dados.quantidade),
              }
            : p,
        ),
      );

      setDados({
        produtoId: "",
        quantidade: "",
        motivo: "",
        observacao: "",
      });
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const apiMessage = e.response?.data?.message;

        const errorMessage =
          typeof apiMessage === "string"
            ? apiMessage
            : "Erro ao cadastrar o produto. Verifique os dados.";

        toast.error(errorMessage);
        return;
      }
    }
  }

  return (
    <div>
      <Header texto="Registrar saída" />
      <main className="min-h-screen bg-[#f4f7fc] flex flex-col items-center justify-center gap-6 px-4 py-8">
        <div className="w-full max-w-sm bg-white border border-slate-200/80 rounded-3xl shadow-sm flex flex-col items-center text-center overflow-hidden">
          <form
            onSubmit={handleSubmit}
            className="w-full text-left space-y-4 bg-blue-50/90 p-6"
          >
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Produto{" "}
                <span className="text-slate-400 text-xs">- nome ou código</span>
              </label>

              <select
                name="produtoId"
                onChange={handleOnChange}
                value={dados.produtoId}
                className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              >
                <option value="">
                  {loading ? "Carregando produtos..." : "Selecione um produto"}
                </option>
                {produtos.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 rounded-2xl bg-slate-100/50 p-3 border border-slate-400/60">
              <span className="text-slate-400 text-xs">
                {produtoSelecionado
                  ? `${produtoSelecionado.codigo || `PRD-${produtoSelecionado.id}`} ${
                      produtoSelecionado.categoria?.nome
                        ? `· ${produtoSelecionado.categoria.nome}`
                        : ""
                    }`
                  : "Selecione um produto"}
              </span>
              <div className="flex flex-row justify-between">
                <p>Em estoque</p>
                <span className="text-lg font-bold text-blue-600">
                  {dados.produtoId ? `${estoqueAtual} unid` : "0 unid."}
                </span>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Quantidade a dar saída
              </label>

              <input
                type="number"
                min="1"
                name="quantidade"
                onChange={handleOnChange}
                value={dados.quantidade}
                className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Motivo da saída
                <span className="text-slate-400 text-xs"> (opcional)</span>
              </label>

              <select
                name="motivo"
                onChange={handleOnChange}
                value={dados.motivo}
                className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              >
                <option value="">Selecione um motivo</option>
                <option>Uso interno</option>
                <option>Venda</option>
                <option>Descarte / Vencimento</option>
                <option>Transferência</option>
                <option>Outros</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Observação
                <span className="text-slate-400 text-xs"> (opcional)</span>
              </label>

              <textarea
                name="observacao"
                onChange={handleOnChange}
                value={dados.observacao}
                placeholder="Detalhes adicionais..."
                className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div className="flex flex-row justify-between items-center rounded-2xl bg-slate-100/50 p-3 border border-slate-400/60">
              <span className="text-slate-600 text-xs">Saldo após a saída</span>

              <span className="text-lg font-bold">
                {dados.produtoId ? `${saldoAposSaida} unid` : "0 unid."}
              </span>
            </div>

            <div className="flex items-start gap-2.5 rounded-2xl bg-blue-50/80 p-3.5 border border-blue-100 text-blue-600">
              <svg
                className="w-5 h-5 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16v-4m0-4h.01"
                />
              </svg>
              <p className="text-xs font-medium leading-relaxed">
                Esta saída será registrada no histórico com data e hora.
              </p>
            </div>

            <SubmitButton>Confirmar saída</SubmitButton>
          </form>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
