import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "../services/api";
import toast, { Toaster } from "react-hot-toast";
import Header from "../components/Header";
import SubmitButton from "../components/SubmitBotao";
import type { Produto } from "../types/index";
import { formatarMoedaInput } from "../utils/formatters";

export default function EntradaPage() {
  const [dados, setDados] = useState({
    produtoId: "",
    quantidade: "",
    unidade: "unid",
    validade: "",
    preco: "",
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;

    if (name === "preco") {
      setDados((prev) => ({
        ...prev,
        preco: formatarMoedaInput(value),
      }));
      return;
    }

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

  const quantidade = Number(dados.quantidade) || 0;
  const precoNumerico = Number(dados.preco.replace(/\D/g, "")) / 100 || 0;

  const valorTotal = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(quantidade * precoNumerico);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!dados.produtoId.trim() || !dados.quantidade.trim()) {
      toast.error("Selecione o produto e informe a quantidade.");
      return;
    }

    if (Number(dados.quantidade) <= 0) {
      toast.error("A quantidade deve ser maior que zero.");
      return;
    }

    try {
      const payload = {
        produtoId: Number(dados.produtoId),
        quantidade: Number(dados.quantidade),
        tipo: "ENTRADA",
        preco: precoNumerico > 0 ? precoNumerico : undefined,
        validade: dados.validade.trim() ? dados.validade : undefined,
        observacao: dados.observacao.trim() ? dados.observacao : undefined,
      };

      await api.post("/movimentacao", payload);
      toast.success("Entrada registrada com sucesso!");

      setDados({
        produtoId: "",
        quantidade: "",
        unidade: "unid",
        validade: "",
        preco: "",
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
      <Header texto="Registrar entrada" />
      <main className="min-h-screen bg-[#f4f7fc] flex flex-col items-center justify-center gap-6 px-4 py-8">
        <div className="w-full max-w-sm bg-white border border-slate-200/80 rounded-3xl shadow-sm flex flex-col items-center text-center overflow-hidden">
          <form
            onSubmit={handleSubmit}
            className="w-full text-left space-y-4 bg-blue-50/90 p-6"
          >
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Produto
                <span className="text-slate-400 text-xs">- nome ou código</span>
              </label>

              <select
                name="produtoId"
                value={dados.produtoId}
                onChange={handleOnChange}
                disabled={loading}
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Quantidade
                </label>

                <input
                  type="number"
                  name="quantidade"
                  min="1"
                  onChange={handleOnChange}
                  value={dados.quantidade}
                  placeholder="10"
                  className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">
                  Unidade
                </label>

                <select
                  name="unidade"
                  onChange={handleOnChange}
                  value={dados.unidade}
                  className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                >
                  <option>unid</option>
                  <option>pacote</option>
                  <option>kg</option>
                  <option>Litro</option>
                  <option>caixa</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Validade
              </label>

              <input
                type="date"
                name="validade"
                onChange={handleOnChange}
                value={dados.validade}
                className="w-full appearance-none rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition [&::-webkit-calendar-picker-indicator]:cursor-pointer"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Valor unitário (R$)
              </label>

              <input
                type="text"
                name="preco"
                onChange={handleOnChange}
                value={dados.preco}
                placeholder="R$ 0,00"
                className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Fornecedor{" "}
                <span className="text-slate-400 text-xs">(opcional)</span>
              </label>

              <input
                type="text"
                name="observacao"
                onChange={handleOnChange}
                value={dados.observacao}
                placeholder="Nome do fornecedor"
                className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-200/50 p-4 border border-slate-200/60">
              <span className="text-sm font-medium text-slate-600">
                Valor total desta entrada
              </span>
              <span className="text-lg font-bold text-blue-600">
                {valorTotal}
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
                Esta entrada será registrada no histórico com data e hora.
              </p>
            </div>

            <SubmitButton>Confirmar entrada</SubmitButton>
          </form>
        </div>
      </main>

      <Toaster />
    </div>
  );
}
