import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { api } from "../services/api";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function CadastroPage() {
  const [dados, setDados] = useState({
    nome: "",
    empresa: "",
    email: "",
    password: "",
  });

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

    if (
      !dados.nome.trim() ||
      !dados.empresa.trim() ||
      !dados.email.trim() ||
      !dados.password.trim()
    ) {
      toast.error("Preencha todos os campos.");
      return;
    }

    try {
      const response = await api.post("/usuario", dados);

      const token = response.data.token;

      if (token) {
        localStorage.setItem("token", token);
      }

      setDados({
        nome: "",
        empresa: "",
        email: "",
        password: "",
      });

      navigate("/home");
    } catch (e: unknown) {
      if (axios.isAxiosError(e)) {
        const errorMessage =
          e.response?.data?.message || "Erro ao realizar o cadastro.";

        toast.error(errorMessage);
        return;
      }

      toast.error("Erro inesperado ao realizar o cadastro.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7fc] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm bg-white border border-slate-200/80 rounded-3xl shadow-sm flex flex-col items-center text-center overflow-hidden">
        <div className="w-full relative flex items-center justify-center p-6 pb-4 border-b border-slate-200">
          <button
            onClick={() => navigate("/")}
            className="absolute left-6 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg p-2 cursor-pointer transition"
            aria-label="Voltar"
          >
            <MdArrowBack size={18} className="text-slate-600" />
          </button>
          <h1 className="text-xl font-bold text-slate-800 font-serif">
            Criar conta
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full text-left space-y-4 bg-blue-50/90 p-6"
        >
          <div className="flex flex-col gap-4">
            <h2 className="text-xs font-medium text-slate-600 leading-relaxed">
              Crie sua conta de administrador. Você poderá convidar até 4
              pessoas depois.
            </h2>

            <button
              type="button"
              className="w-full py-3 px-4 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium text-sm flex items-center justify-center gap-2 hover:bg-slate-100 transition cursor-pointer shadow-xs"
            >
              <FcGoogle size={20} />
              Cadastrar com Google
            </button>
          </div>

          <div className="w-full flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200"></div>
            <span className="text-sm text-slate-400">ou preencha os dados</span>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Nome completo
            </label>

            <input
              type="text"
              name="nome"
              placeholder="João Silva"
              onChange={handleOnChange}
              value={dados.nome}
              className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Nome do estoque/empresa
            </label>

            <input
              type="text"
              name="empresa"
              placeholder="Estoque Casa"
              onChange={handleOnChange}
              value={dados.empresa}
              className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="João@email.com"
              onChange={handleOnChange}
              value={dados.email}
              className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-600">
              senha
            </label>

            <input
              type="password"
              name="password"
              placeholder="***********"
              onChange={handleOnChange}
              value={dados.password}
              className="w-full rounded-xl bg-white border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition active:scale-[0.98] cursor-pointer shadow-sm"
          >
            Criar conta
          </button>

          <div className="flex flex-row justify-center items-center">
            <p className="text-[11px] text-slate-400 leading-tight">
              {" "}
              Já tem conta?{" "}
              <Link
                to="/"
                className="text-xs font-medium text-blue-600 hover:underline"
              >
                Entrar
              </Link>
            </p>
          </div>
        </form>
      </div>
      <Toaster />
    </main>
  );
}
