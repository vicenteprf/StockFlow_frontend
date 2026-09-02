import { useState } from "react";
import { api } from "../services/api";
import axios from "axios";
import toast from "react-hot-toast";
import type { ModalConviteProps } from "../types/index";

export function ModalConvite({ onClose, onSucesso }: ModalConviteProps) {
  const [dados, setDados] = useState({
    nome: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setDados((prev) => ({
      ...prev,
      [name]: value,
    }));
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

      onSucesso();
      onClose();
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

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl flex flex-col gap-4">
        <h3 className="text-lg font-bold text-slate-800">Convidar Membro</h3>

        <form onSubmit={handleConvidarMembro} className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-slate-500 font-medium">Nome</label>
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
            <label className="text-xs text-slate-500 font-medium">E-mail</label>
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
              onClick={onClose}
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
  );
}
