import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiLock } from "react-icons/fi";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { api } from "../services/api";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import BotaoGoogleLogin from "../components/BotaoGoogle.tsx";

export default function LoginPage() {
  const [dados, setDados] = useState({
    email: "",
    password: "",
  });

  const [mostrarSenha, setMostrarSenha] = useState(false);

  const navigate = useNavigate();

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    setDados({
      ...dados,
      [name]: value,
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!dados.email.trim() || !dados.password.trim()) {
      toast.error("Preencha todos os campos.");
      return;
    }

    try {
      const response = await api.post("/auth", dados);

      const token = response.data.token;

      if (token) {
        localStorage.setItem("token", token);
      }

      setDados({
        email: "",
        password: "",
      });

      navigate("/home");
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const errorMessage =
          e.response?.data?.message || "Erro ao realizar login.";

        toast.error(errorMessage);
        return;
      }

      toast.error("Erro inesperado ao realizar login.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7fc] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center gap-5">
        {/* Ícone Header */}
        <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
          <FiLock size={24} />
        </div>
        {/* Título */}
        <div>
          <h1 className="text-2xl font-bold text-blue-600 font-serif">
            StockFlow
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Controle de estoque simples e eficiente
          </p>
        </div>
        {/* Botão Google */}
        <BotaoGoogleLogin />
        {/* Divisor */}
        <div className="w-full flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200"></div>
          <span className="text-xs text-slate-400">ou entre com e-mail</span>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>
        {/* Formulário */}
        <form onSubmit={handleSubmit} className="w-full text-left space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              E-mail
            </label>
            <input
              type="email"
              name="email"
              placeholder="seu@email.com"
              onChange={handleOnChange}
              value={dados.email}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Senha
            </label>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                onChange={handleOnChange}
                value={dados.password}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-10 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 cursor-pointer p-1"
              >
                {mostrarSenha ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>
          <div className="flex justify-between">
            <Link
              to="/cadastro"
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Criar conta
            </Link>
            <Link
              to="/esqueceu-senha"
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition active:scale-[0.98] cursor-pointer shadow-sm"
          >
            Entrar
          </button>
        </form>
        {/* Rodapé */}
        <footer className="mt-2">
          <p className="text-[11px] text-slate-400 leading-tight">
            Ao entrar você concorda com os Termos de uso e Política de
            privacidade
          </p>
        </footer>
      </div>
      <Toaster />
    </main>
  );
}
