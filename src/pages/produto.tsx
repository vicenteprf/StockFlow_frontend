import type React from "react";
import { useEffect, useState } from "react";
import { api } from "../services/api.ts";
import axios from "axios";
import Header from "../components/Header.tsx";
import SubmitButton from "../components/SubmitBotao.tsx";
import type { Categoria } from "../types";
import toast, { Toaster } from "react-hot-toast";

export default function ProdutoPage() {
  const [dados, setDados] = useState({
    nome: "",
    categoriaId: "",
    descricao: "",
  });

  const [categoria, setCategoria] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let ativo = true;

    async function carregarCategoria() {
      try {
        const response = await api.get("/categoria");
        if (ativo && response.data) {
          setCategoria(response.data);
        }
      } catch (e) {
        console.error("Erro ao carregar categorias:", e);
        toast.error("Erro ao carregar lista de categorias.");
      } finally {
        if (ativo) setLoading(false);
      }
    }

    carregarCategoria();

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

    setDados((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!dados.nome.trim() || !dados.categoriaId.trim()) {
      toast.error("Preencha todos os campos.");
      return;
    }

    try {
      const body = {
        nome: dados.nome,
        categoriaId: Number(dados.categoriaId),
        descricao: dados.descricao.trim() || undefined,
      };

      await api.post("/produto", body);

      toast.success("Produto cadastrado com sucesso!");

      setDados({
        nome: "",
        categoriaId: "",
        descricao: "",
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
      <Header texto="Novo produto" />
      <main className="min-h-screen bg-[#f4f7fc] flex flex-col items-center justify-center gap-6 px-4 py-8">
        <div className="w-full max-w-sm bg-white border border-slate-200/80 rounded-3xl shadow-sm flex flex-col items-center text-center overflow-hidden">
          <form
            onSubmit={handleSubmit}
            className="w-full text-left space-y-4 bg-blue-50/90 p-6"
          >
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Nome do produto
              </label>

              <input
                type="text"
                name="nome"
                onChange={handleOnChange}
                value={dados.nome}
                placeholder="Ex: Arroz tipo 1 - 5kg"
                className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Categoria
              </label>

              <select
                name="categoriaId"
                value={dados.categoriaId}
                onChange={handleOnChange}
                disabled={loading}
                className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              >
                {" "}
                <option value="">
                  {loading
                    ? "Carregando categorias..."
                    : "Selecione uma categoria"}
                </option>
                {categoria.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Descrição
                <span className="text-slate-400 text-xs">(opcional)</span>
              </label>

              <textarea
                name="descricao"
                value={dados.descricao}
                onChange={handleOnChange}
                placeholder="Detalhes adicionais sobre o produto..."
                className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <SubmitButton>Cadastrar produto</SubmitButton>
          </form>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
