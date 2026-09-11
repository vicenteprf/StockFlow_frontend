import { useEffect, useState } from "react";
import axios from "axios";
import { api } from "../services/api";
import toast, { Toaster } from "react-hot-toast";
import Header from "../components/Header";
import SubmitButton from "../components/SubmitBotao";
import type { Produto, ItemEntrada } from "../types/index";
import { formatarMoedaInput, formatarMoeda } from "../utils/formatters";
import { FiTrash2 } from "react-icons/fi";

export default function EntradaPage() {
  const [itens, setItens] = useState<ItemEntrada[]>([
    {
      produtoId: "",
      quantidade: "1",
      unidade: "unid",
      validade: "",
      preco: "",
    },
  ]);
  const [observacao, setObservacao] = useState("");
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let ativo = true;

    async function carregarProdutos() {
      try {
        const response = await api.get("/produto");
        if (ativo && response.data) {
          const produtosOrdenados = response.data.sort(
            (a: Produto, b: Produto) =>
              a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }),
          );

          setProdutos(produtosOrdenados);
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

  function handleItemChange(
    index: number,
    field: keyof ItemEntrada,
    value: string,
  ) {
    setItens((prev) => {
      const novosItens = [...prev];
      let val = value;

      if (field === "preco") {
        val = formatarMoedaInput(value);
      } else if (field === "quantidade") {
        val = value.replace(/\D/g, "");
      }

      novosItens[index] = {
        ...novosItens[index],
        [field]: val,
      };

      return novosItens;
    });
  }

  function adicionarItem() {
    setItens((prev) => [
      ...prev,
      {
        produtoId: "",
        quantidade: "1",
        unidade: "unid",
        validade: "",
        preco: "",
      },
    ]);
  }

  function removerItem(index: number) {
    if (itens.length === 1) {
      toast.error("A entrada precisa ter ao menos 1 item.");
      return;
    }
    setItens((prev) => prev.filter((_, i) => i !== index));
  }

  const calcularSubtotal = (item: ItemEntrada) => {
    const qtd = Number(item.quantidade) || 0;
    const precoNum = Number(item.preco.replace(/\D/g, "")) / 100 || 0;
    return qtd * precoNum;
  };

  const valorTotalGeral = itens.reduce(
    (acc, item) => acc + calcularSubtotal(item),
    0,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      if (!item.produtoId) {
        toast.error(`Selecione um produto para o Item ${i + 1}.`);
        return;
      }
      if (!item.quantidade || Number(item.quantidade) <= 0) {
        toast.error(`Informe uma quantidade válida para o Item ${i + 1}.`);
        return;
      }
    }

    try {
      const payload = {
        itens: itens.map((item) => {
          const precoNumerico =
            Number(item.preco.replace(/\D/g, "")) / 100 || 0;

          return {
            produtoId: Number(item.produtoId),
            quantidade: Number(item.quantidade),
            unidade: item.unidade,
            preco: precoNumerico > 0 ? precoNumerico : undefined,
            validade: item.validade.trim() ? item.validade : undefined,
          };
        }),
        observacao: observacao.trim(),
      };

      await api.post("/movimentacao/entrada", payload);
      toast.success("Entrada em lote registrada com sucesso!");

      setItens([
        {
          produtoId: "",
          quantidade: "1",
          unidade: "unid",
          validade: "",
          preco: "",
        },
      ]);
      setObservacao("");
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const apiMessage = e.response?.data?.message;
        toast.error(
          typeof apiMessage === "string"
            ? apiMessage
            : "Erro ao registrar entrada.",
        );
      }
    }
  }

  return (
    <div>
      <Header texto="Registrar entrada" />
      <main className="min-h-screen bg-[#f4f7fc] flex flex-col items-center justify-center gap-6 px-4 py-8">
        <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl shadow-sm flex flex-col items-center overflow-hidden">
          <form
            onSubmit={handleSubmit}
            className="w-full text-left space-y-4 bg-blue-50/90 p-6"
          >
            {itens.map((item, index) => (
              <div
                key={index}
                className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3 relative"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">
                    Item {index + 1}
                  </span>
                  {itens.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removerItem(index)}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold cursor-pointer"
                      title="Remover Item"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  )}
                </div>

                <div>
                  <select
                    value={item.produtoId}
                    onChange={(e) =>
                      handleItemChange(index, "produtoId", e.target.value)
                    }
                    disabled={loading}
                    className="w-full rounded-xl bg-white border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 transition"
                  >
                    <option value="">
                      {loading
                        ? "Carregando produtos..."
                        : "Selecione um produto"}
                    </option>
                    {produtos.map((prod) => (
                      <option key={prod.id} value={prod.id}>
                        {prod.nome}
                        {prod.descricao ? ` - ${prod.descricao}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1 ">
                      Qtd.
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantidade}
                      onChange={(e) =>
                        handleItemChange(index, "quantidade", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Valor unit.
                    </label>
                    <input
                      type="text"
                      placeholder="R$ 0,00"
                      value={item.preco}
                      onChange={(e) =>
                        handleItemChange(index, "preco", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Validade
                    </label>
                    <input
                      type="date"
                      value={item.validade}
                      onChange={(e) =>
                        handleItemChange(index, "validade", e.target.value)
                      }
                      className="w-full appearance-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1 ">
                      Unidade
                    </label>
                    <select
                      value={item.unidade}
                      onChange={(e) =>
                        handleItemChange(index, "unidade", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="unid">unid</option>
                      <option value="pacote">pacote</option>
                      <option value="kg">kg</option>
                      <option value="Litro">Litro</option>
                      <option value="caixa">caixa</option>
                    </select>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500 font-medium pt-1">
                  Subtotal:{" "}
                  <span className="font-bold text-slate-800">
                    {formatarMoeda(calcularSubtotal(item))}
                  </span>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={adicionarItem}
              className="w-full py-2.5 bg-white border border-dashed border-blue-400 hover:border-blue-600 text-blue-600 font-semibold rounded-xl text-sm transition cursor-pointer shadow-sm"
            >
              + Adicionar produto
            </button>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Fornecedor <span className="text-slate-400">(opcional)</span>
              </label>
              <input
                type="text"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Nome do fornecedor"
                className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-blue-600 p-4 text-white">
              <span className="text-sm font-medium">Total da entrada</span>
              <span className="text-xl font-bold">
                {formatarMoeda(valorTotalGeral)}
              </span>
            </div>

            <SubmitButton>Confirmar entrada</SubmitButton>
          </form>
        </div>
      </main>

      <Toaster />
    </div>
  );
}
