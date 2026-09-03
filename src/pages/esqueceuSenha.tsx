import { useState } from "react";
import { AxiosError } from "axios";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import toast, { Toaster } from "react-hot-toast";

export default function EsqueceuSenhaPage() {
  const [dados, setDados] = useState({ email: "" });
  const [carregando, setCarregando] = useState(false);

  function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setDados({
      ...dados,
      [name]: value,
    });
  }

  async function handleRecuperarSenha(e: React.FormEvent) {
    e.preventDefault();

    if (!dados.email.trim()) {
      toast.error("Por favor, preencha o campo de e-mail.");
      return;
    }

    try {
      setCarregando(true);

      await api.post("/auth/esqueceu-senha", { email: dados.email });

      toast.success(
        "Se o e-mail estiver cadastrado, um link de redefinição será enviado para a sua caixa de entrada.",
      );
      setDados({ email: "" });
    } catch (e) {
      const err = e as AxiosError;

      if (err.response && err.response.status === 404) {
        toast.error("Este e-mail não está cadastrado em nosso sistema.");
      } else {
        toast.error(
          "Ocorreu um erro ao processar a solicitação. Tente novamente mais tarde.",
        );
      }
    } finally {
      setCarregando(false);
    }
  }
  return (
    <main className="min-h-screen bg-slate-100 flex flex-col justify-center items-center border border-slate-200 p-8 sm:p-10">
      <form
        onSubmit={handleRecuperarSenha}
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 sm:p-10"
      >
        <div className="flex flex-col items-center gap-2 mb-10">
          <h1 className="text-2xl font-bold ">Recuperar senha</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
            Insira o seu e-mail cadastrado para receber as instruções de
            recuperação.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-600"
            >
              E-mail
            </label>
            <input
              onChange={handleOnChange}
              value={dados.email}
              type="email"
              name="email"
              placeholder="Ex: seuemail@provedor.com"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-2 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {carregando ? "Enviando..." : "Enviar link de recuperação"}
        </button>

        <div className="flex flex-row justify-center items-center mt-2">
          <Link
            className="text-sm font-medium text-blue-600 hover:underline"
            to={"/"}
          >
            Voltar para o login
          </Link>
        </div>
      </form>

      <Toaster />
    </main>
  );
}
