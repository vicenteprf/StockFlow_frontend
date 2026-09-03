import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { AxiosError } from "axios";
import { api } from "../services/api.ts";

import toast, { Toaster } from "react-hot-toast";

export default function RedefinicaoSenhaPage() {
  const [dados, setDados] = useState({
    senha: "",
    novasenha: "",
  });
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setDados({
      ...dados,
      [name]: value,
    });
  }

  async function handleRedefinirSenha(e: React.FormEvent) {
    e.preventDefault();

    if (!token) {
      toast.error(
        "O token de recuperação está ausente ou é inválido. Solicite um novo link.",
      );
      return;
    }

    if (!dados.senha.trim() || !dados.novasenha.trim()) {
      toast.error("Preencha todos os campos.");
      return;
    }

    if (dados.senha.length < 6) {
      toast.error("A nova senha deve conter no mínimo 6 caracteres.");
      return;
    }

    if (dados.senha !== dados.novasenha) {
      toast.error("A nova senha e a confirmação não coincidem.");
      return;
    }

    try {
      setCarregando(true);

      await api.post("/auth/redefinir-senha", {
        token,
        senha: dados.senha,
      });

      toast.success("Sua senha foi redefinida com sucesso!");

      setDados({ senha: "", novasenha: "" });

      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      const err = error as AxiosError<{ error: string }>;

      if (err.response && err.response.data && err.response.data.error) {
        toast.error(err.response.data.error);
      } else {
        toast.error("Erro ao redefinir a senha. Tente novamente mais tarde.");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col justify-center items-center gap-4 p-4">
      <form
        onSubmit={handleRedefinirSenha}
        noValidate
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200  p-8 sm:p-10"
      >
        <div className="flex flex-col justify-center items-center gap-2 mb-10">
          <h1 className="text-2xl font-bold text-center">Redefinir senha</h1>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="senha"
              className="text-sm font-medium text-slate-600"
            >
              Nova senha
            </label>

            <div className="relative">
              <input
                onChange={handleOnChange}
                value={dados.senha}
                type={mostrarSenha ? "text" : "password"}
                name="senha"
                placeholder="Digite a nova senha"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />

              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-300 cursor-pointer flex items-center justify-center"
              >
                {mostrarSenha ? (
                  <FaEyeSlash
                    size={18}
                    className="hover:text-blue-400 transition-colors duration-200"
                  />
                ) : (
                  <FaEye
                    size={18}
                    className="hover:text-blue-400 transition-colors duration-200"
                  />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="novasenha"
              className="text-sm font-medium text-slate-600"
            >
              Confirmação da senha
            </label>

            <div className="relative">
              <input
                onChange={handleOnChange}
                value={dados.novasenha}
                type={mostrarSenha ? "text" : "password"}
                name="novasenha"
                placeholder="Confirme a nova senha"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-300 cursor-pointer flex items-center justify-center"
              >
                {mostrarSenha ? (
                  <FaEyeSlash
                    size={18}
                    className="hover:text-blue-400 transition-colors duration-200"
                  />
                ) : (
                  <FaEye
                    size={18}
                    className="hover:text-blue-400 transition-colors duration-200"
                  />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full mt-2 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {carregando ? "Atualizando..." : "Redefinir senha"}
          </button>
        </div>
      </form>

      <Toaster />
    </main>
  );
}
