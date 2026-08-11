import React, { useState, useEffect } from "react";
import { api } from "../services/api.ts";
import axios from "axios";
import Header from "../components/Header.tsx";
import toast, { Toaster } from "react-hot-toast";

interface Categoria {
  id: number;
  nome: string;
}

export default function CategoriaPage() {
  const [dados, setDados] = useState<string>("");
  const [editarCategoria, setEditarCategoria] = useState<number | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    async function carregarCategoria() {
      try {
        const response = await api.get("/categoria");
        if (active && response.data) {
          setCategorias(response.data);
        }
      } catch (error) {
        console.error("Erro na requisição:", error);
      } finally {
        setLoading(false);
      }
    }
    carregarCategoria();

    return () => {
      active = false;
    };
  }, []);

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDados(e.target.value);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!dados.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      if (editarCategoria) {
        const response = await api.put(`/categoria/${editarCategoria}`, {
          nome: dados,
        });

        setCategorias((prev) =>
          prev.map((cat) => (cat.id === editarCategoria ? response.data : cat)),
        );

        toast.success("Categoria atualizada com sucesso!");
        setDados("");
        setEditarCategoria(null);
      } else {
        const response = await api.post("/categoria", { nome: dados });

        toast.success("Categoria cadastrada com sucesso!");

        setCategorias((prev) => [...prev, response.data]);
        setDados("");
      }
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const errorMessage =
          e.response?.data?.message || "Erro ao cadastrar a categoria.";

        toast.error(errorMessage);
        return;
      }
    }
  }

  function handleEditar(categoria: Categoria) {
    setEditarCategoria(categoria.id);
    setDados(categoria.nome);
  }

  async function handleDeletar(id: number) {
    try {
      await api.delete(`/categoria/${id}`);

      toast.success("Categoria deletada com sucesso!");

      setCategorias((prev) => prev.filter((categoria) => categoria.id !== id));
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const errorMessage =
          e.response?.data?.message || "Erro ao cadastrar a categoria.";

        toast.error(errorMessage);
        return;
      }
    }
  }

  return (
    <div>
      <Header texto="Categorias" />
      <main className="min-h-screen bg-[#f4f7fc] flex flex-col items-center justify-center gap-6 px-4 py-8">
        <div className="w-full max-w-sm bg-white border border-slate-200/80 rounded-3xl shadow-sm flex flex-col items-center text-center overflow-hidden">
          <form
            onSubmit={handleSubmit}
            className="w-full text-left space-y-4 bg-blue-50/90 p-6"
          >
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Categoria
              </label>

              <input
                type="text"
                name="nome"
                value={dados}
                onChange={handleOnChange}
                placeholder="Ex: Laticinios"
                className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition active:scale-[0.98] cursor-pointer shadow-sm"
            >
              {editarCategoria ? "Salvar" : "Cadastrar"}
            </button>
          </form>
        </div>

        <div className="w-full max-w-sm bg-white border border-slate-200/80 rounded-3xl shadow-sm p-6">
          <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-4">
            Categorias Cadastradas
          </h3>

          {loading ? (
            <p className="text-xs text-slate-400 text-center py-2 animate-pulse">
              Carregando categorias...
            </p>
          ) : categorias.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-2">
              Nenhuma categoria cadastrada.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {categorias.map((categoria) => (
                <li
                  key={categoria.id}
                  className="py-3 flex items-center justify-between gap-2 first:pt-0 last:pb-0"
                >
                  <span className="text-sm font-medium text-slate-700">
                    {categoria.nome}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditar(categoria)}
                      type="button"
                      className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeletar(categoria.id)}
                      className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition cursor-pointer"
                    >
                      Deletar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <Toaster />
    </div>
  );
}
